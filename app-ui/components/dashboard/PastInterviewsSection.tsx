import { ScrollView, XStack, YStack, Text, type YStackProps } from "tamagui";
import type { InterviewHistoryItem } from "lib/hooks/useInterviewHistory";
import { InterviewHistoryCard } from "./InterviewHistoryCard";

type Props = YStackProps & {
  history: InterviewHistoryItem[];
  onViewAll: () => void;
};

export function PastInterviewsSection({ history, onViewAll, ...rest }: Props) {
  const preview = history.slice(0, 3);

  return (
    <YStack gap={14} {...rest}>
      <XStack px={24} alignItems="center" justifyContent="space-between">
        <Text color="white" fontSize={18} fontWeight="700">
          Past Interviews
        </Text>
        <Text
          color="rgba(255,255,255,0.4)"
          fontSize={11}
          fontWeight="600"
          letterSpacing={1}
          onPress={onViewAll}
          cursor="pointer"
        >
          VIEW ALL
        </Text>
      </XStack>

      {preview.length === 0 ? (
        <Text px={24} color="rgba(255,255,255,0.25)" fontSize={14}>
          No interviews yet — start your first session below.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 8, gap: 12 }}
        >
          {preview.map((item) => (
            <InterviewHistoryCard key={item.session_id} item={item} />
          ))}
        </ScrollView>
      )}
    </YStack>
  );
}
