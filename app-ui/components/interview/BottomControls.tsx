import React from "react";
import { Mic, PhoneOff, Volume2 } from "@tamagui/lucide-icons";
import { Button, XStack } from "tamagui";

/* ---------------- Types ---------------- */

type BottomControlsProps = {
  isRecording: boolean;
  onMicToggle: () => void;
  onEnd: () => void;
  speakerOn: boolean;
  onSpeakerToggle: () => void;
};

/* ---------------- Component ---------------- */

const BottomControls = ({
  isRecording,
  onMicToggle,
  onEnd,
  speakerOn,
  onSpeakerToggle,
}: BottomControlsProps) => {
  return (
    <XStack
      alignSelf="center"
      bg="rgba(17,24,39,0.9)"
      borderColor="rgba(255,255,255,0.08)"
      borderWidth={1}
      borderRadius={999}
      p="$2.5"
      gap="$4"
      shadowColor="black"
      shadowRadius={20}
      shadowOpacity={0.4}
      elevation={10}
    >
      {/* Mic */}
      <ControlButton
        active={isRecording}
        icon={<Mic size={22} />}
        onPress={onMicToggle}
      />

      {/* End Call */}
      <EndCallButton onPress={onEnd} />

      {/* Speaker */}
      <ControlButton
        active={speakerOn}
        icon={<Volume2 size={22} />}
        onPress={onSpeakerToggle}
      />
    </XStack>
  );
};

/* ---------------- Control Button ---------------- */

function ControlButton({
  icon,
  onPress,
  active = false,
  danger = false,
}: Readonly<{
  icon: React.ReactNode;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}>) {
  return (
    <Button
      circular
      size="$5"
      bg={
        danger
          ? "#ef4444"
          : active
          ? "rgba(99,102,241,0.25)"
          : "rgba(255,255,255,0.15)"
      }
      pressStyle={{ scale: 0.92 }}
      animation="quick"
      onPress={onPress}
    >
      {icon}
    </Button>
  );
}

function EndCallButton({ onPress }: Readonly<{ onPress: () => void }>) {
  return (
    <Button
      size="$5"
      px="$6"
      bg="#ef4444"
      borderRadius="$10"
      pressStyle={{ scale: 0.95, bg: "#dc2626" }}
      animation="quick"
      onPress={onPress}
      shadowColor="black"
      shadowRadius={10}
      shadowOpacity={0.35}
      elevation={12}
    >
      <XStack gap="$2" items="center">
        <PhoneOff size={20} color="white" />
      </XStack>
    </Button>
  );
}


export default BottomControls;
