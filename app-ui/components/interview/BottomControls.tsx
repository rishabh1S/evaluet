import React from "react";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "@tamagui/lucide-icons";
import { XStack } from "tamagui";
import { Pressable } from "react-native";

/* ---------------- Types ---------------- */

type BottomControlsProps = {
  isRecording: boolean;
  onMicToggle: () => void;
  onEnd: () => void;
  speakerOn: boolean;
  onSpeakerToggle: () => void;
};

const BTN_SIZE = 62;
const END_WIDTH = 112;
const RADIUS = BTN_SIZE / 2;

/* ---------------- Component ---------------- */

const BottomControls = ({
  isRecording,
  onMicToggle,
  onEnd,
  speakerOn,
  onSpeakerToggle,
}: BottomControlsProps) => {
  return (
    <XStack alignSelf="center" alignItems="center" gap={20}>
      {/* Mic */}
      <Pressable
        onPress={onMicToggle}
        style={({ pressed }) => ({
          width: BTN_SIZE,
          height: BTN_SIZE,
          borderRadius: RADIUS,
          backgroundColor: isRecording
            ? "rgba(99,102,241,0.3)"
            : "rgba(255,255,255,0.12)",
          borderWidth: 1,
          borderColor: isRecording
            ? "rgba(99,102,241,0.5)"
            : "rgba(255,255,255,0.1)",
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        {isRecording ? (
          <Mic size={24} color="white" />
        ) : (
          <MicOff size={24} color="rgba(255,255,255,0.6)" />
        )}
      </Pressable>

      {/* End Call */}
      <Pressable
        onPress={onEnd}
        style={({ pressed }) => ({
          width: END_WIDTH,
          height: BTN_SIZE,
          borderRadius: RADIUS,
          backgroundColor: pressed ? "#e05555" : "#F07070",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <PhoneOff size={24} color="white" />
      </Pressable>

      {/* Speaker */}
      <Pressable
        onPress={onSpeakerToggle}
        style={({ pressed }) => ({
          width: BTN_SIZE,
          height: BTN_SIZE,
          borderRadius: RADIUS,
          backgroundColor: speakerOn
            ? "rgba(99,102,241,0.3)"
            : "rgba(255,255,255,0.12)",
          borderWidth: 1,
          borderColor: speakerOn
            ? "rgba(99,102,241,0.5)"
            : "rgba(255,255,255,0.1)",
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        {speakerOn ? (
          <Volume2 size={24} color="white" />
        ) : (
          <VolumeX size={24} color="rgba(255,255,255,0.6)" />
        )}
      </Pressable>
    </XStack>
  );
};

export default BottomControls;
