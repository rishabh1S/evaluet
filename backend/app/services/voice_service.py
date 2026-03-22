import asyncio
import io
from typing import AsyncGenerator, Optional

import numpy as np
from deepgram import AsyncDeepgramClient
from deepgram.core.events import EventType

from app.core.llm_sanitizer import sanitize_llm_output

# 100ms of silence @ 16kHz mono int16
_SILENCE_FRAME = (np.zeros(1600, dtype=np.int16)).tobytes()

class DeepgramService:
    def __init__(self, voice_model: str = "aura-2-amalthea-en"):
        # Reads DEEPGRAM_API_KEY / DEEPGRAM_ACCESS_TOKEN from env
        self.client = AsyncDeepgramClient()
        self._listen_cm = None          # context manager for listen.v2
        self.connection = None          # listen.v2 connection

        self.transcript_queue: asyncio.Queue[str] = asyncio.Queue()
        self.assistant_speaking: bool = False
        self.voice_model = voice_model

        # Silence keepalive
        self._silence_task: Optional[asyncio.Task] = None
        self._silence_interval: float = 0.7  # seconds between silence frames

        # TTS timeout
        self.tts_timeout: float = 12.0

    # =========================
    #   FLUX STT START/STOP
    # =========================
    async def start(self) -> bool:
        """
        Start a Flux listen.v2 connection, using EndOfTurn events as final user text.
        """
        try:
            # Required Flux settings: model, audio format, sample rate
            # This assumes you send raw 16kHz mono linear16 PCM from the client.
            self._listen_cm = self.client.listen.v2.connect(
                model="flux-general-en",
                encoding="linear16",   
                sample_rate="16000"  
            )

            # Manually enter the async context manager
            self.connection = await self._listen_cm.__aenter__()

            # Register handlers
            self.connection.on(EventType.OPEN, lambda _: print("[Flux] connection opened"))
            self.connection.on(EventType.ERROR, lambda e: print("[Flux] ERROR:", e))
            self.connection.on(EventType.CLOSE, lambda _: print("[Flux] connection closed"))
            self.connection.on(EventType.MESSAGE, self._on_message)

            asyncio.create_task(self.connection.start_listening())

            print("Flux connection started successfully")
            return True

        except Exception as e:
            print("Deepgram Start Error:", e)
            return False

    async def stop(self):
        """
        Cleanly close listen connection and silence loop.
        """
        await self.stop_silence_loop()

        try:
            if self._listen_cm:
                # Exit the context manager we manually entered
                await self._listen_cm.__aexit__(None, None, None)

        except Exception as e:
            print("Deepgram stop error:", e)
        finally:
            self.connection = None
            self._listen_cm = None

    # =========================
    #   FLUX EVENT HANDLER
    # =========================
    def _on_message(self, message) -> None:
        """
        Handle Flux Listen v2 messages and push final turns into transcript_queue.

        For Flux:
          - Final turns:   type == "TurnInfo" and event == "EndOfTurn"
          - Transcript:    message.transcript (top level)
        """
        msg_type = getattr(message, "type", None)
        event = getattr(message, "event", None)
        transcript = getattr(message, "transcript", None)

        # Debug while integrating:
        # print("[Flux raw]", msg_type, event, transcript)

        # Streamed partials (optional log)
        if transcript and not self.assistant_speaking:
            print("User (stream):", transcript)

        # End-of-turn final transcript
        if msg_type == "TurnInfo" and event == "EndOfTurn":
            final_text = (transcript or "").strip()
            if final_text and not self.assistant_speaking:
                print("[Flux EndOfTurn]", final_text)
                self.transcript_queue.put_nowait(final_text)

    # =========================
    #   AUDIO INPUT TO FLUX
    # =========================
    async def send_audio(self, audio_data: bytes):
        """
        Send raw 16-bit mono PCM @ 16kHz to Flux.
        Make sure your frontend encodes audio exactly like this.
        """
        if not self.connection:
            return
        try:
            # SDK example uses the internal _send for raw binary frames
            await self.connection._send(audio_data)
            # If/when SDK exposes send_media for async, you can switch:
            # await self.connection.send_media(audio_data)
        except Exception as e:
            print("[Flux] send_audio error:", e)

    # =========================
    #   SILENCE KEEPALIVE
    # =========================
    async def _silence_loop(self):
        """Continuously send small silence frames until cancelled."""
        try:
            while True:
                if self.connection:
                    try:
                        await self.connection._send(_SILENCE_FRAME)
                    except Exception:
                        # Connection might be closing; ignore
                        pass
                await asyncio.sleep(self._silence_interval)
        except asyncio.CancelledError:
            return

    def start_silence_loop(self):
        """Start background task that keeps Flux alive while assistant is speaking."""
        if not self._silence_task or self._silence_task.done():
            self._silence_task = asyncio.create_task(self._silence_loop())

    async def stop_silence_loop(self):
        """Stop the silence background task."""
        if self._silence_task and not self._silence_task.done():
            self._silence_task.cancel()
            try:
                await self._silence_task
            except asyncio.CancelledError:
                pass
            self._silence_task = None

    # =========================
    #   TTS (AURA-2)
    # =========================
    async def text_to_speech_stream(
        self,
        text_stream: AsyncGenerator[str, None]
    ) -> AsyncGenerator[tuple[bytes, str], None]:
        """
        Takes a text-token async generator and yields (audio_chunk_bytes, text_so_far).
        You already use this in your convo loop.
        """
        current_sentence = ""
        sentence_buffer = []

        async for token in text_stream:
            current_sentence += token
            if any(p in token for p in [".", "?", "!", "\n"]):
                sentence_buffer.append(current_sentence)
                current_sentence = ""
                
                if sentence_buffer:
                    raw_sentence = sentence_buffer.pop(0)
                    clean_sentence = sanitize_llm_output(raw_sentence)
                    
                    if clean_sentence.strip():
                        audio = await self._tts_with_timeout(clean_sentence)
                        yield audio, clean_sentence

        if current_sentence.strip():
            clean_sentence = sanitize_llm_output(current_sentence)
            audio = await self._tts_with_timeout(clean_sentence)
            yield audio, clean_sentence

    async def _tts_with_timeout(self, text: str) -> Optional[bytes]:
        """
        Wrap TTS call with timeout. Returns None if it fails or times out.
        """
        try:
            return await asyncio.wait_for(
                self._tts(text),
                timeout=self.tts_timeout
            )
        except asyncio.TimeoutError:
            print(f"[TTS] Timeout after {self.tts_timeout}s for: '{text[:50]}...'")
            return None
        except Exception as e:
            print(f"[TTS] Error: {e}")
            return None


    async def _tts(self, text: str) -> Optional[bytes]:
        """
        Deepgram v5 TTS via Aura-2 (streaming → collected into a single bytes blob).
        """
        try:
            audio_bytes = io.BytesIO()

            async for chunk in self.client.speak.v1.audio.generate(
                text=text,
                model=self.voice_model, 
                encoding="linear16",
                container="none"
            ):
                audio_bytes.write(chunk)

            return audio_bytes.getvalue()

        except Exception as e:
            print("TTS Error:", e)
            return None
