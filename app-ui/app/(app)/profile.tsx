import { YStack, XStack, Text, Button, Separator, Switch } from "tamagui";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  Pencil,
} from "@tamagui/lucide-icons";
import { clearToken } from "lib/auth";
import { useProfile } from "lib/hooks/useProfile";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const MENU_ITEMS = [
  { icon: Shield, label: "Privacy Policy" },
  { icon: FileText, label: "Terms of Service" },
  { icon: HelpCircle, label: "Help Center" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const [darkMode, setDarkMode] = useState(true);

  const name = profile?.name ?? "";
  const email = profile?.email ?? "";
  const initials = name ? getInitials(name) : "?";

  const handleSignOut = async () => {
    await clearToken();
    router.replace("/(auth)");
  };

  return (
    <LinearGradient
      colors={["#060b14", "#0B1220", "#0F172A"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          {/* ── Header bar ── */}
          <XStack
            px={24}
            pt={16}
            pb={8}
            alignItems="center"
            position="relative"
          >
            <XStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="rgba(255,255,255,0.07)"
              borderWidth={1}
              borderColor="rgba(255,255,255,0.1)"
              alignItems="center"
              justifyContent="center"
              onPress={() => router.back()}
              cursor="pointer"
            >
              <ChevronLeft size={22} color="rgba(255,255,255,0.7)" />
            </XStack>
            <YStack flex={1} alignItems="center">
              <Text color="white" fontSize={18} fontWeight="700">
                Profile
              </Text>
            </YStack>
            {/* Spacer to balance back button */}
            <YStack width={40} />
          </XStack>

          {/* ── Avatar section ── */}
          <YStack alignItems="center" pt={28} pb={32} gap={12}>
            {/* Avatar with edit badge */}
            <YStack position="relative">
              <YStack
                width={96}
                height={96}
                borderRadius={48}
                backgroundColor="#6366F1"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize={32} fontWeight="800">
                  {initials}
                </Text>
              </YStack>
              {/* Edit badge */}
              <YStack
                position="absolute"
                bottom={0}
                right={0}
                width={28}
                height={28}
                borderRadius={14}
                backgroundColor="#1E293B"
                borderWidth={2}
                borderColor="#0B1220"
                alignItems="center"
                justifyContent="center"
              >
                <Pencil size={13} color="rgba(255,255,255,0.7)" />
              </YStack>
            </YStack>

            <YStack alignItems="center" gap={4}>
              <Text color="white" fontSize={20} fontWeight="700">
                {name || "—"}
              </Text>
              <Text color="rgba(255,255,255,0.45)" fontSize={14}>
                {email}
              </Text>
            </YStack>

            <Button
              height={36}
              paddingHorizontal={24}
              backgroundColor="transparent"
              borderWidth={1}
              borderColor="#6366F1"
              borderRadius={20}
              pressStyle={{ opacity: 0.7, backgroundColor: "transparent" }}
            >
              <Text color="#6366F1" fontSize={14} fontWeight="600">
                Edit Profile
              </Text>
            </Button>
          </YStack>

          <YStack px={24} gap={12}>
            {/* Dark Mode row */}
            <XStack
              backgroundColor="rgba(255,255,255,0.05)"
              borderRadius={14}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.08)"
              paddingHorizontal={16}
              paddingVertical={14}
              alignItems="center"
              gap={12}
            >
              <Moon size={20} color="rgba(255,255,255,0.6)" />
              <Text color="white" fontSize={16} fontWeight="600" flex={1}>
                Dark Mode
              </Text>
              <Switch
                size="$3"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                backgroundColor={darkMode ? "#6366F1" : "rgba(255,255,255,0.15)"}
              >
                <Switch.Thumb animation="quick" />
              </Switch>
            </XStack>

            {/* Menu group */}
            <YStack
              backgroundColor="rgba(255,255,255,0.05)"
              borderRadius={14}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.08)"
              overflow="hidden"
            >
              {MENU_ITEMS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <YStack key={item.label}>
                    {index > 0 && (
                      <Separator
                        borderColor="rgba(255,255,255,0.07)"
                        marginHorizontal={16}
                      />
                    )}
                    <XStack
                      paddingHorizontal={16}
                      paddingVertical={16}
                      alignItems="center"
                      gap={12}
                      pressStyle={{ opacity: 0.7 }}
                      cursor="pointer"
                    >
                      <Icon size={20} color="rgba(255,255,255,0.55)" />
                      <Text
                        color="white"
                        fontSize={16}
                        fontWeight="600"
                        flex={1}
                      >
                        {item.label}
                      </Text>
                      <ChevronRight
                        size={18}
                        color="rgba(255,255,255,0.25)"
                      />
                    </XStack>
                  </YStack>
                );
              })}
            </YStack>

            {/* Sign Out */}
            <Button
              onPress={handleSignOut}
              height={52}
              backgroundColor="#991B1B"
              borderRadius={14}
              pressStyle={{ backgroundColor: "#7F1D1D" }}
              mt={4}
            >
              <XStack gap={10} alignItems="center">
                <LogOut size={18} color="white" />
                <Text color="white" fontSize={16} fontWeight="700">
                  Sign Out
                </Text>
              </XStack>
            </Button>

            {/* Footer */}
            <YStack alignItems="center" mt={16} gap={4}>
              <Text
                color="rgba(255,255,255,0.2)"
                fontSize={11}
                fontWeight="600"
                letterSpacing={1}
              >
                VERSION 1.0.0 (BUILD 1)
              </Text>
              <Text color="rgba(255,255,255,0.2)" fontSize={11}>
                © 2025 Evaluet Inc.
              </Text>
            </YStack>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
