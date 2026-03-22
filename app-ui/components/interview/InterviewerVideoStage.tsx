import { forwardRef, useImperativeHandle, useRef } from "react";
import { View } from "tamagui";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import {
  Video,
  ResizeMode,
  AVPlaybackStatusSuccess,
} from "expo-av";

export type InterviewerVideoStageRef = {
  startTalking: () => void;
  stopTalking: () => void;
};

type Props = {
  idleVideoUrl: string;
  talkingVideoUrl: string;
};

const CLIP_SIZE_MS = 6000;
const FADE_MS = 80;

export const InterviewerVideoStage = forwardRef<
  InterviewerVideoStageRef,
  Props
>(({ idleVideoUrl, talkingVideoUrl }, ref) => {
  const idleVideoRef = useRef<Video>(null);
  const talkingVideoRef = useRef<Video>(null);

  const idleOpacity = useSharedValue(1);
  const talkingOpacity = useSharedValue(0);

  const idleReady = useRef(false);
  const talkingReady = useRef(false);

  const idleStyle = useAnimatedStyle(() => ({
    opacity: idleOpacity.value,
  }));

  const talkingStyle = useAnimatedStyle(() => ({
    opacity: talkingOpacity.value,
  }));

  function seekRandom(
    video: Video | null,
    status: AVPlaybackStatusSuccess
  ) {
    if (!video || !status.durationMillis) return;

    const maxIndex = Math.floor(
      status.durationMillis / CLIP_SIZE_MS
    );
    if (maxIndex <= 0) return;

    const randomIndex = Math.floor(Math.random() * maxIndex);
    video.setPositionAsync(randomIndex * CLIP_SIZE_MS);
  }

  function crossfadeToTalking() {
    if (!talkingReady.current) return;

    idleOpacity.value = withTiming(0, { duration: FADE_MS });
    talkingOpacity.value = withTiming(1, { duration: FADE_MS });
  }

  function crossfadeToIdle() {
    if (!idleReady.current) return;

    talkingOpacity.value = withTiming(0, { duration: FADE_MS });
    idleOpacity.value = withTiming(1, { duration: FADE_MS });
  }

  useImperativeHandle(ref, () => ({
    startTalking() {
      crossfadeToTalking();
    },
    stopTalking() {
      crossfadeToIdle();
    },
  }));

  return (
    <View width="100%" height="100%" bg="#020617">
      {/* Idle Video */}
      <Animated.View
        style={[
          { position: "absolute", inset: 0 },
          idleStyle,
        ]}
      >
        <Video
          ref={idleVideoRef}
          source={{ uri: idleVideoUrl }}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          volume={0}
          style={{ width: "100%", height: "100%" }}
          onLoad={(status) => {
            if (status.isLoaded) {
              seekRandom(idleVideoRef.current, status);
            }
          }}
          onReadyForDisplay={() => {
            idleReady.current = true;
          }}
        />
      </Animated.View>

      {/* Talking Video */}
      <Animated.View
        style={[
          { position: "absolute", inset: 0 },
          talkingStyle,
        ]}
      >
        <Video
          ref={talkingVideoRef}
          source={{ uri: talkingVideoUrl }}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          volume={0}
          style={{ width: "100%", height: "100%" }}
          onLoad={(status) => {
            if (status.isLoaded) {
              seekRandom(talkingVideoRef.current, status);
            }
          }}
          onReadyForDisplay={() => {
            talkingReady.current = true;
          }}
        />
      </Animated.View>
    </View>
  );
});
