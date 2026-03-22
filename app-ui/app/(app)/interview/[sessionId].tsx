import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, YStack } from "tamagui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { useKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import { WS_BASE } from "../../../lib/env";
import { Audio } from "expo-av";
import {
  AudioRecorderProvider,
  useSharedAudioRecorder,
} from "@siteed/expo-audio-studio";
import { useInterviewerStore } from "lib/store/interviewerStore";
import { BottomControls, TopBar, CompletionOverlay } from "components/interview";
import { mergeUint8Arrays, pcmToWav } from "lib/utils/audioUtils";
import {
  InterviewerVideoStage,
  InterviewerVideoStageRef,
} from "components/interview/InterviewerVideoStage";

/* ---------------- Screen Wrapper ---------------- */

export default function InterviewScreenWrapper() {
  return (
    <AudioRecorderProvider>
      <InterviewScreen />
    </AudioRecorderProvider>
  );
}

/* ---------------- Main Screen ---------------- */

function InterviewScreen() {
  const router = useRouter();
  const [currentSentence, setCurrentSentence] = useState("");
  const [speakerOn, setSpeakerOn] = useState(true);
  const speakerOnRef = useRef(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const currentSound = useRef<Audio.Sound | null>(null);
  const { sessionId } = useLocalSearchParams();
  const ws = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState("Connecting…");
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [timerActive, setTimerActive] = useState(false);
  const micStartedRef = useRef(false);
  const interviewEndedRef = useRef(false);
  const audioBufferRef = useRef<Uint8Array[]>([]);
  const playLockRef = useRef<Promise<void> | null>(null);
  const assistantSpeakingRef = useRef(false);
  const clearInterviewer = useInterviewerStore((s) => s.clear);
  const interviewer = useInterviewerStore((s) => s.interviewer);
  const videoStageRef = useRef<InterviewerVideoStageRef>(null);

  useKeepAwake();

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const { startRecording, stopRecording } = useSharedAudioRecorder();

  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const timeLabel = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    ws.current = new WebSocket(`${WS_BASE}/ws/interview/${sessionId}`);
    ws.current.binaryType = "arraybuffer";

    ws.current.onopen = async () => {
      setStatus("Connected");
      setTimerActive(true);

      if (!micStartedRef.current) {
        try {
          await startRecordingSafe();
          micStartedRef.current = true;
        } catch (e) {
          console.warn("Mic start blocked until user tap", e);
        }
      }
    };

    ws.current.onmessage = async (e) => {
      if (typeof e.data === "string") {
        const msg = JSON.parse(e.data);

        if (msg.type === "transcript" && msg.role === "assistant") {
          setCurrentSentence(msg.content);
        }

        if (msg.type === "control" && msg.action === "END_INTERVIEW") {
          interviewEndedRef.current = true;
          setTimerActive(false);
          setStatus("Interview completed");
          clearInterviewer();
          stopRecordingSafe();
          setIsRecording(false);
          setIsCompleted(true);
          return;
        }
      }

      if (!interviewEndedRef.current && e.data instanceof ArrayBuffer) {
        enqueueAudio(e.data);
      }
    };

    ws.current.onerror = () => setStatus("Connection error");
    ws.current.onclose = () => {
      if (!interviewEndedRef.current) {
        setStatus("Disconnected");
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (currentSound.current) {
        currentSound.current.unloadAsync();
      }
    };
  }, []);

  async function startRecordingSafe() {
    if (isRecordingRef.current) return;

    await startRecording({
      sampleRate: 16000,
      channels: 1,
      encoding: "pcm_16bit",
      interval: 100,
      onAudioStream: async (event) => {
        if (
          !ws.current ||
          interviewEndedRef.current ||
          assistantSpeakingRef.current
        ) {
          return;
        }

        const bytes = Buffer.from(event.data as string, "base64");
        ws.current.send(bytes);
      },
    });

    isRecordingRef.current = true;
    setIsRecording(true);
  }

  async function stopRecordingSafe() {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    await stopRecording();
    setIsRecording(false);
  }

  function enqueueAudio(buffer: ArrayBuffer) {
    audioBufferRef.current.push(new Uint8Array(buffer));
    flushAndPlay();
  }

  async function flushAndPlay() {
    if (playLockRef.current) return;

    playLockRef.current = (async () => {
      while (audioBufferRef.current.length > 0) {
        const chunks = audioBufferRef.current.splice(0, 4);
        const merged = mergeUint8Arrays(chunks);
        await playMergedPcm(merged);
      }
    })();

    await playLockRef.current;
    playLockRef.current = null;
  }

  function playMergedPcm(pcmData: Uint8Array): Promise<void> {
    return new Promise((resolve) => {
      playMergedPcmInternal(pcmData, resolve);
    });
  }

  async function playMergedPcmInternal(
    pcmData: Uint8Array,
    resolve: () => void
  ) {
    try {
      if (!speakerOnRef.current) {
        assistantSpeakingRef.current = false;
        resolve();
        return;
      }

      assistantSpeakingRef.current = true;
      videoStageRef.current?.startTalking();
      await stopRecordingSafe();

      const wavData = pcmToWav(pcmData);
      const base64 = Buffer.from(wavData).toString("base64");
      const sound = new Audio.Sound();
      currentSound.current = sound;

      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          assistantSpeakingRef.current = false;
          videoStageRef.current?.stopTalking();

          if (!interviewEndedRef.current) {
            setTimeout(() => startRecordingSafe().catch(() => {}), 120);
          }

          resolve();
        }
      });

      await sound.loadAsync(
        { uri: `data:audio/wav;base64,${base64}` },
        { shouldPlay: true }
      );
    } catch (e) {
      console.error("TTS playback error:", e);
      assistantSpeakingRef.current = false;
      resolve();
    }
  }

  function toggleSpeaker() {
    const next = !speakerOnRef.current;
    speakerOnRef.current = next;
    setSpeakerOn(next);

    if (!next && currentSound.current) {
      // Silence the active chunk immediately without breaking the promise chain.
      // stopAsync/unloadAsync would prevent didJustFinish from firing, permanently
      // locking playLockRef and blocking all future audio.
      currentSound.current.setVolumeAsync(0).catch(() => {});
    }
  }

  function endInterview() {
    interviewEndedRef.current = true;
    setTimerActive(false);
    clearInterviewer();
    ws.current?.send(
      JSON.stringify({ type: "control", action: "END_INTERVIEW" })
    );
    ws.current?.close();
    setIsCompleted(true);
  }

  return (
    <LinearGradient
      colors={["#022c22", "#0f172a", "#111827"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.8 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <YStack flex={1}>
          {/* TopBar — natural height */}
          <TopBar timeLabel={timeLabel} status={status} />

          {/* Video — fills all remaining space */}
          <YStack flex={1} px="$2" pb="$2">
            <YStack
              flex={1}
              bg="#020617"
              borderColor="rgba(255,255,255,0.06)"
              borderWidth={1}
              borderRadius="$8"
              overflow="hidden"
              shadowColor="black"
              shadowOpacity={0.55}
              shadowRadius={28}
              elevation={12}
            >
              <InterviewerVideoStage
                ref={videoStageRef}
                idleVideoUrl={interviewer?.idle_video_url ?? ""}
                talkingVideoUrl={interviewer?.talking_video_url ?? ""}
              />

              {/* Caption overlay — sliding window, Google Meet-style */}
              {currentSentence ? (() => {
                const CAPTION_WORD_LIMIT = 30;
                const words = currentSentence.split(' ').filter(Boolean);
                const displaySentence = words.length > CAPTION_WORD_LIMIT
                  ? words.slice(-CAPTION_WORD_LIMIT).join(' ')
                  : currentSentence;
                return (
                  <YStack
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    bg="rgba(0,0,0,0.6)"
                    px="$4"
                    py="$3"
                  >
                    <Text
                      color="white"
                      fontSize="$4"
                      fontWeight="500"
                      textAlign="center"
                    >
                      {displaySentence}
                    </Text>
                  </YStack>
                );
              })() : null}
            </YStack>
          </YStack>

          {/* Controls */}
          <YStack py="$4" alignItems="center">
            <BottomControls
              isRecording={isRecording}
              onMicToggle={() =>
                isRecording ? stopRecordingSafe() : startRecordingSafe()
              }
              onEnd={endInterview}
              speakerOn={speakerOn}
              onSpeakerToggle={toggleSpeaker}
            />
          </YStack>
        </YStack>
      </SafeAreaView>

      {isCompleted && <CompletionOverlay onBack={() => router.back()} />}
    </LinearGradient>
  );
}
