import React from "react";
import { XStack, YStack, Text, Circle } from "tamagui";

type TopBarProps = {
  timeLabel: string;
  status: string;
};

const TopBar = ({ timeLabel, status }: TopBarProps) => {
  const getStatusColor = () => {
    if (status.includes("Connected")) return "#22c55e";
    if (status.includes("Disconnected")) return "#ef4444";
    return "#94a3b8";
  };

  return (
      <YStack gap="$2" px="$4" py="$3">
        <XStack justify="space-between" items="center">
          <Text fontSize={19} fontWeight="700" color="#f8fafc">
            Live Interview
          </Text>

          <Text
            color="#f8fafc"
            fontSize={22}
            fontWeight="700"
            letterSpacing={2}
            fontVariant={["tabular-nums"]}
          >
            {timeLabel}
          </Text>
        </XStack>

        <XStack items="center" gap="$2">
          <Circle size={7} bg={getStatusColor()} />
          <Text color={getStatusColor()} fontSize={13} fontWeight="500">
            {status}
          </Text>
        </XStack>
      </YStack>
  );
};

export default TopBar;
