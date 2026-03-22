import { YStack, Button, Text, ScrollView, XStack, Separator } from "tamagui";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Timer,
  ShieldPlus,
} from "@tamagui/lucide-icons";
import { useProfile } from "lib/hooks/useProfile";
import { useInterviewHistory } from "lib/hooks/useInterviewHistory";
import { SafeAreaView } from "react-native-safe-area-context";

/* ── Helpers ── */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeDate(isoDate: string | null): string {
  if (!isoDate) return "";
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const STATUS_CONFIG = {
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

/* ── Screen ── */

export default function IndexScreen() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: history = [] } = useInterviewHistory();

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const initials = profile?.name ? getInitials(profile.name) : "?";

  return (
    <LinearGradient
      colors={["#060b14", "#0B1220", "#0F172A"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          flex={1}
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <XStack
            px={24}
            pt={16}
            pb={24}
            alignItems="center"
            justifyContent="space-between"
            position="relative"
          >
            {/* Spacer to balance the right avatar */}
            <YStack width={44} />

            {/* Centered welcome text */}
            <YStack alignItems="center" gap={3}>
              <Text color="white" fontSize={22} fontWeight="800">
                Welcome back, {firstName}
              </Text>
              <Text color="rgba(255,255,255,0.4)" fontSize={13}>
                Ready for your next breakthrough?
              </Text>
            </YStack>

            {/* Profile avatar (right) */}
            <YStack
              width={44}
              height={44}
              borderRadius={22}
              backgroundColor="#6366F1"
              alignItems="center"
              justifyContent="center"
              onPress={() => router.push("/(app)/profile")}
              cursor="pointer"
            >
              <Text color="white" fontSize={15} fontWeight="700">
                {initials}
              </Text>
            </YStack>
          </XStack>

          {/* ── Past Interviews ── */}
          <YStack gap={14} mb={28}>
            <XStack
              px={24}
              alignItems="center"
              justifyContent="space-between"
            >
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
              <Text
                px={24}
                color="rgba(255,255,255,0.25)"
                fontSize={14}
              >
                No interviews yet — start your first session below.
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 24, paddingRight: 8, gap: 12 }}
              >
                {history.map((item) => {
                  const cfg =
                    STATUS_CONFIG[item.status] ?? STATUS_CONFIG.ACTIVE;
                  const StatusIcon = cfg.icon;
                  return (
                    <YStack
                      key={item.session_id}
                      width={200}
                      backgroundColor="rgba(255,255,255,0.05)"
                      borderColor="rgba(255,255,255,0.08)"
                      borderWidth={1}
                      borderRadius={16}
                      padding={16}
                      gap={10}
                    >
                      {/* Status badge */}
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
                        <Text
                          color={cfg.color}
                          fontSize={10}
                          fontWeight="700"
                          letterSpacing={0.8}
                        >
                          {cfg.label}
                        </Text>
                      </XStack>

                      <YStack gap={3}>
                        <Text
                          color="white"
                          fontSize={15}
                          fontWeight="700"
                          numberOfLines={1}
                        >
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
                })}
              </ScrollView>
            )}
          </YStack>

          {/* ── New Interview Card ── */}
          <YStack px={24} mb={20}>
            <YStack
              backgroundColor="rgba(255,255,255,0.05)"
              borderRadius={20}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.08)"
              padding={28}
              alignItems="center"
              gap={14}
            >
              {/* Icon */}
              <YStack
                width={72}
                height={72}
                borderRadius={20}
                backgroundColor="#6366F1"
                alignItems="center"
                justifyContent="center"
              >
                <ShieldPlus size={34} color="white" />
              </YStack>

              <YStack alignItems="center" gap={8}>
                <Text color="white" fontSize={24} fontWeight="800">
                  New Interview
                </Text>
                <Text
                  color="rgba(255,255,255,0.45)"
                  fontSize={14}
                  textAlign="center"
                  lineHeight={22}
                >
                  Start a new session to refine your skills{"\n"}and master
                  your career trajectory.
                </Text>
              </YStack>

              <Button
                onPress={() => router.push("/(app)/setup")}
                width="100%"
                height={54}
                backgroundColor="#6366F1"
                borderRadius={14}
                pressStyle={{ backgroundColor: "#4F52D9" }}
                mt={4}
              >
                <Text color="white" fontSize={16} fontWeight="700">
                  Start a new session
                </Text>
              </Button>
            </YStack>
          </YStack>

          {/* ── Stats Row ── */}
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
                <TrendingUp size={20} color="rgba(255,255,255,0.5)" />
                <Text color="#22c55e" fontSize={12} fontWeight="600">
                  +12%
                </Text>
              </XStack>
              <YStack gap={3}>
                <Text color="rgba(255,255,255,0.45)" fontSize={13}>
                  Score Avg.
                </Text>
                <Text color="white" fontSize={28} fontWeight="800">
                  8.4
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
                <Text color="rgba(255,255,255,0.35)" fontSize={12}>
                  12h
                </Text>
              </XStack>
              <YStack gap={3}>
                <Text color="rgba(255,255,255,0.45)" fontSize={13}>
                  Practice Time
                </Text>
                <Text color="white" fontSize={28} fontWeight="800">
                  24.5h
                </Text>
              </YStack>
            </YStack>
          </XStack>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
