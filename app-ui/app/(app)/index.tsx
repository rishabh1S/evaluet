import { ScrollView, YStack } from "tamagui";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "lib/hooks/useProfile";
import { useInterviewHistory } from "lib/hooks/useInterviewHistory";
import { useStats } from "lib/hooks/useStats";
import {
  DashboardHeader,
  PastInterviewsSection,
  NewInterviewCard,
  StatsRow,
} from "components/dashboard";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function IndexScreen() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: history = [] } = useInterviewHistory();
  const { data: stats } = useStats();

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
          <YStack gap={24}>
            <DashboardHeader
              firstName={firstName}
              initials={initials}
              onAvatarPress={() => router.push("/(app)/profile")}
            />

            <PastInterviewsSection
              history={history}
              onViewAll={() => router.push("/(app)/interviews")}
            />

            <NewInterviewCard onPress={() => router.push("/(app)/setup")} />

            {stats && <StatsRow stats={stats} />}
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
