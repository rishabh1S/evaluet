import { ScrollView, YStack, XStack, Text } from "tamagui";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable } from "react-native";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useInterviewHistory } from "lib/hooks/useInterviewHistory";
import {
  STATUS_CONFIG,
  formatRelativeDate,
} from "components/dashboard/InterviewHistoryCard";

export default function InterviewsScreen() {
  const router = useRouter();
  const { data: history = [] } = useInterviewHistory();

  return (
    <LinearGradient
      colors={["#060b14", "#0B1220", "#0F172A"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <XStack px={16} pt={12} pb={16} alignItems="center" gap={12}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={26} color="white" />
          </Pressable>
          <Text color="white" fontSize={20} fontWeight="700">
            All Interviews
          </Text>
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 12 }}
        >
          {history.length === 0 ? (
            <Text color="rgba(255,255,255,0.25)" fontSize={14} mt={24}>
              No interviews yet — complete your first session to see it here.
            </Text>
          ) : (
            history.map((item) => {
              const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.ACTIVE;
              const StatusIcon = cfg.icon;
              return (
                <YStack
                  key={item.session_id}
                  backgroundColor="rgba(255,255,255,0.05)"
                  borderColor="rgba(255,255,255,0.08)"
                  borderWidth={1}
                  borderRadius={16}
                  padding={16}
                  gap={10}
                  onPress={() => router.push("/(app)/report")}
                  cursor="pointer"
                  pressStyle={{ opacity: 0.75 }}
                >
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack
                      backgroundColor={cfg.bg}
                      borderRadius={20}
                      paddingHorizontal={10}
                      paddingVertical={5}
                      gap={6}
                      alignItems="center"
                    >
                      <StatusIcon size={10} color={cfg.color} />
                      <Text
                        color={cfg.color}
                        fontSize={10}
                        fontWeight="700"
                        letterSpacing={0.8}
                      >
                        {cfg.label}
                      </Text>
                    </XStack>
                    <Text color="rgba(255,255,255,0.3)" fontSize={12}>
                      {formatRelativeDate(item.created_at)}
                    </Text>
                  </XStack>

                  <YStack gap={3}>
                    <Text color="white" fontSize={16} fontWeight="700" numberOfLines={1}>
                      {item.job_role}
                    </Text>
                    <Text color="rgba(255,255,255,0.45)" fontSize={13}>
                      {item.candidate_level}
                    </Text>
                  </YStack>

                  <Text color="rgba(255,255,255,0.35)" fontSize={12}>
                    {item.interviewer_name ?? ""}
                  </Text>
                </YStack>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
