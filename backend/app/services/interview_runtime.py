import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect
from app.services.voice_service import DeepgramService 
from app.services.ai_service import get_ai_response_stream
from app.core.interview_state import InterviewStateManager


async def audio_loop(
    websocket: WebSocket,
    dg: DeepgramService,
    shutdown_event: asyncio.Event,
):
    try:
        while not shutdown_event.is_set():
            msg = await websocket.receive()

            if "text" in msg:
                try:
                    data = json.loads(msg["text"])
                    if data.get("type") == "control" and data.get("action") == "END_INTERVIEW":
                        shutdown_event.set()
                        break
                except Exception:
                    pass
                continue

            if "bytes" in msg and not dg.assistant_speaking:
                await dg.send_audio(msg["bytes"])
    except WebSocketDisconnect:
        shutdown_event.set()
    except Exception as e:
        print("AUDIO LOOP ERROR:", e)
        shutdown_event.set()


async def conversation_loop(
    websocket: WebSocket,
    dg: DeepgramService,
    history: list,
    shutdown_event: asyncio.Event,
):
    state = InterviewStateManager()

    while not state.over and not shutdown_event.is_set():
        try:
            user_text = await asyncio.wait_for(
                dg.transcript_queue.get(), timeout=1.0
            )
        except asyncio.TimeoutError:
            if state.expired():
                await handle_timeout(
                    websocket, dg, history, state, shutdown_event
                )
                break
            continue

        if len(user_text.strip().split()) < 2:
            continue

        await send_transcript(websocket, "user", user_text, history)

        ai_stream = get_ai_response_stream(history)
        full_reply = await stream_llm_response(websocket, dg, ai_stream)

        if full_reply:
            await send_transcript(websocket, "assistant", full_reply, history)

        if "[END_INTERVIEW]" in full_reply:
            await end_interview(websocket, state, shutdown_event)
            break


async def send_transcript(
    websocket: WebSocket,
    role: str,
    content: str,
    history: list,
):
    await websocket.send_text(json.dumps({
        "type": "transcript",
        "role": role,
        "content": content
    }))
    history.append({"role": role, "content": content})


async def stream_llm_response(
    websocket: WebSocket,
    dg: DeepgramService,
    ai_stream,
) -> str:
    full_reply = ""

    dg.assistant_speaking = True
    dg.start_silence_loop()

    try:
        async for audio, clean_text in dg.text_to_speech_stream(ai_stream):
            if clean_text:
                full_reply += clean_text + " "
                await websocket.send_text(json.dumps({
                    "type": "transcript",
                    "role": "assistant",
                    "content": full_reply.strip(),
                    "partial": True,
                }))
            if audio:
                await websocket.send_bytes(audio)
    finally:
        await dg.stop_silence_loop()
        dg.assistant_speaking = False

    return full_reply.strip()

async def end_interview(
    websocket: WebSocket,
    state: InterviewStateManager,
    shutdown_event: asyncio.Event,
):
    await websocket.send_text(json.dumps({
        "type": "control",
        "action": "END_INTERVIEW"
    }))
    state.over = True
    shutdown_event.set()


async def handle_timeout(
    websocket: WebSocket,
    dg: DeepgramService,
    history: list,
    state: InterviewStateManager,
    shutdown_event: asyncio.Event,
):
    history.append({
        "role": "system",
        "content": "SYSTEM: Time is up"
    })

    ai_stream = get_ai_response_stream(history)
    final_reply = await stream_llm_response(websocket, dg, ai_stream)

    if final_reply:
        await send_transcript(websocket, "assistant", final_reply, history)

    await end_interview(websocket, state, shutdown_event)



async def send_greeting(
    websocket: WebSocket,
    dg: DeepgramService,
    greeting: str,
    history: list,
):
    await websocket.send_text(json.dumps({
        "type": "transcript",
        "role": "assistant",
        "content": greeting
    }))

    async def single_text_stream():
        yield greeting

    dg.assistant_speaking = True
    dg.start_silence_loop()

    try:
        async for audio, _ in dg.text_to_speech_stream(single_text_stream()):
            if audio: 
                await websocket.send_bytes(audio)
    finally:
        await dg.stop_silence_loop()
        dg.assistant_speaking = False

    history.append({"role": "assistant", "content": greeting})
