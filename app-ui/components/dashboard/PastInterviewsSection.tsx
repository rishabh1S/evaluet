import { ScrollView, XStack, YStack, Text, type YStackProps } from "tamagui";
import type { InterviewHistoryItem } from "lib/hooks/useInterviewHistory";
import { InterviewHistoryCard } from "./InterviewHistoryCard";

type Props = YStackProps & {
  history: InterviewHistoryItem[];
};

export function PastInterviewsSection({ history, ...rest }: Props) {
  return (
    <YStack gap={14} mb={28} {...rest}>
      <XStack px={24} alignItems="center" justifyContent="space-between">
        <Text color="white" fontSize={18} fontWeight="700">
          Past Interviews
        </Text>
        <Text
          color="rgba(255,255,255,0.4)"
          fontSize={11}
          fontWeight="600"
          letterSpacing={1}
        >
          VIEW ALL
        </Text>
      </XStack>

      {history.length === 0 ? (
        <Text px={24} color="rgba(255,255,255,0.25)" fontSize={14}>
          No interviews yet — start your first session below.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 8, gap: 12 }}
        >
          {history.map((item) => (
            <InterviewHistoryCard key={item.session_id} item={item} />
          ))}
        </ScrollView>
      )}
    </YStack>
  );
}
