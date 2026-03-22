import { XStack, YStack, Text } from "tamagui";
import { TrendingUp, TrendingDown, Timer } from "@tamagui/lucide-icons";
import type { StatsData } from "lib/hooks/useStats";

type Props = {
  stats: StatsData;
};

export function StatsRow({ stats }: Props) {
  const deltaPositive = stats.score_delta_pct >= 0;
  const DeltaIcon = deltaPositive ? TrendingUp : TrendingDown;
  const deltaColor = deltaPositive ? "#22c55e" : "#f87171";
  const deltaLabel = `${deltaPositive ? "+" : ""}${stats.score_delta_pct}%`;

  return (
    <XStack px={24} gap={12}>
      {/* Score Avg */}
      <YStack
        flex={1}
        backgroundColor="rgba(255,255,255,0.05)"
        borderRadius={16}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.08)"
        padding={16}
        gap={10}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <DeltaIcon size={20} color="rgba(255,255,255,0.5)" />
          <Text color={deltaColor} fontSize={12} fontWeight="600">
            {deltaLabel}
          </Text>
        </XStack>
        <YStack gap={3}>
          <Text color="rgba(255,255,255,0.45)" fontSize={13}>
            Score Avg.
          </Text>
          <Text color="white" fontSize={28} fontWeight="800">
            {stats.score_avg || "—"}
          </Text>
        </YStack>
      </YStack>

      {/* Practice Time */}
      <YStack
        flex={1}
        backgroundColor="rgba(255,255,255,0.05)"
        borderRadius={16}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.08)"
        padding={16}
        gap={10}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Timer size={20} color="rgba(255,255,255,0.5)" />
          <YStack alignItems="flex-end" gap={1}>
            <Text color="rgba(255,255,255,0.55)" fontSize={12} fontWeight="600">
              {stats.practice_month_hours}h
            </Text>
            <Text
              color="rgba(255,255,255,0.25)"
              fontSize={9}
              letterSpacing={0.5}
            >
              this mo.
            </Text>
          </YStack>
        </XStack>
        <YStack gap={3}>
          <Text color="rgba(255,255,255,0.45)" fontSize={13}>
            Practice Time
          </Text>
          <Text color="white" fontSize={28} fontWeight="800">
            {stats.practice_total_hours}h
          </Text>
        </YStack>
      </YStack>
    </XStack>
  );
}
