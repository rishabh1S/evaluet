import { XStack, YStack, Text } from "tamagui";
import { CheckCircle, Clock, XCircle } from "@tamagui/lucide-icons";
import type { InterviewHistoryItem } from "lib/hooks/useInterviewHistory";

export const STATUS_CONFIG = {
  COMPLETED: {
    label: "COMPLETED",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: CheckCircle,
  },
  ACTIVE: {
    label: "IN PROGRESS",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    icon: Clock,
  },
  FAILED: {
    label: "FAILED",
    color: "#f87171",
    bg: "rgba(239,68,68,0.12)",
    icon: XCircle,
  },
} as const;

export function formatRelativeDate(isoDate: string | null): string {
  if (!isoDate) return "";
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

type Props = {
  item: InterviewHistoryItem;
};

export function InterviewHistoryCard({ item }: Props) {
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.ACTIVE;
  const StatusIcon = cfg.icon;

  return (
    <YStack
      width={200}
      backgroundColor="rgba(255,255,255,0.05)"
      borderColor="rgba(255,255,255,0.08)"
      borderWidth={1}
      borderRadius={16}
      padding={16}
      gap={10}
    >
      <XStack
        backgroundColor={cfg.bg}
        borderRadius={20}
        paddingHorizontal={10}
        paddingVertical={5}
        gap={6}
        alignItems="center"
        alignSelf="flex-start"
      >
        <StatusIcon size={10} color={cfg.color} />
        <Text color={cfg.color} fontSize={10} fontWeight="700" letterSpacing={0.8}>
          {cfg.label}
        </Text>
      </XStack>

      <YStack gap={3}>
        <Text color="white" fontSize={15} fontWeight="700" numberOfLines={1}>
          {item.job_role}
        </Text>
        <Text color="rgba(255,255,255,0.45)" fontSize={13}>
          {item.candidate_level}
        </Text>
      </YStack>

      <XStack alignItems="center" justifyContent="space-between">
        <Text color="rgba(255,255,255,0.35)" fontSize={12}>
          {item.interviewer_name ?? ""}
        </Text>
        <Text color="rgba(255,255,255,0.3)" fontSize={12}>
          {formatRelativeDate(item.created_at)}
        </Text>
      </XStack>
    </YStack>
  );
}
