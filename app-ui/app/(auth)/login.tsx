import { YStack, XStack, Input, Button, Text } from "tamagui";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_BASE } from "../../lib/env";
import { setToken } from "../../lib/auth";
import { LinearGradient } from "expo-linear-gradient";
import {
  BrainCircuit,
  ChevronLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
} from "@tamagui/lucide-icons";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

const PURPLE = "#6366F1";
const PURPLE_PRESS = "#4F52D9";
const INPUT_BG = "rgba(255,255,255,0.06)";
const INPUT_BORDER = "rgba(255,255,255,0.12)";
const ICON_COLOR = "rgba(255,255,255,0.35)";

export default function Auth() {
  const { tab: initialTab } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<"login" | "register">(
    initialTab === "register" ? "register" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        alert("Invalid credentials");
        return;
      }
      const { access_token } = await res.json();
      await setToken(access_token);
      await new Promise(res => setTimeout(res, 50))
      router.replace("/(app)");
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        alert("Registration failed");
        return;
      }
      const { access_token } = await res.json();
      await setToken(access_token);
      await new Promise(res => setTimeout(res, 50));
      router.replace("/(app)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#080D18", "#0C1220", "#08101E"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack flex={1} px={24} pt={64} pb={40}>
            {/* Header */}
            <YStack mb={28} alignItems="center" position="relative">
              {router.canGoBack() && (
                <XStack
                  position="absolute"
                  left={0}
                  top={0}
                  width={40}
                  height={40}
                  alignItems="center"
                  justifyContent="center"
                  onPress={() => router.back()}
                  cursor="pointer"
                >
                  <ChevronLeft size={24} color="rgba(255,255,255,0.7)" />
                </XStack>
              )}
              <YStack alignItems="center" gap={10}>
                <YStack
                  width={72}
                  height={72}
                  backgroundColor={PURPLE}
                  borderRadius={20}
                  alignItems="center"
                  justifyContent="center"
                >
                  <BrainCircuit size={36} color="white" />
                </YStack>
                <Text fontSize={28} fontWeight="800" color="white" mt={4}>
                  Evaluet
                </Text>
                <Text
                  fontSize={14}
                  color="rgba(255,255,255,0.4)"
                  textAlign="center"
                >
                  Your premium digital interview mentor.
                </Text>
              </YStack>
            </YStack>

            {/* Card */}
            <YStack
              backgroundColor="rgba(255,255,255,0.04)"
              borderRadius={24}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.08)"
              p={20}
            >
              {/* Tab Switcher */}
              <XStack mb={20}>
                {(["login", "register"] as const).map((t) => (
                  <YStack
                    key={t}
                    flex={1}
                    alignItems="center"
                    onPress={() => setTab(t)}
                    pb={10}
                    cursor="pointer"
                  >
                    <Text
                      fontSize={16}
                      fontWeight={tab === t ? "700" : "500"}
                      color={
                        tab === t ? "white" : "rgba(255,255,255,0.4)"
                      }
                      mb={8}
                    >
                      {t === "login" ? "Login" : "Register"}
                    </Text>
                    <YStack
                      height={2}
                      width="60%"
                      backgroundColor={tab === t ? PURPLE : "transparent"}
                      borderRadius={1}
                    />
                  </YStack>
                ))}
              </XStack>

              <YStack gap={16}>
                {/* Name (register only) */}
                {tab === "register" && (
                  <YStack gap={6}>
                    <Text
                      fontSize={11}
                      fontWeight="600"
                      color="rgba(255,255,255,0.4)"
                      letterSpacing={1.5}
                    >
                      FULL NAME
                    </Text>
                    <XStack
                      height={52}
                      backgroundColor={INPUT_BG}
                      borderRadius={12}
                      borderWidth={1}
                      borderColor={INPUT_BORDER}
                      alignItems="center"
                      paddingHorizontal={14}
                      gap={10}
                    >
                      <User size={18} color={ICON_COLOR} />
                      <Input
                        flex={1}
                        placeholder="Your name"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={name}
                        onChangeText={setName}
                        color="white"
                        backgroundColor="transparent"
                        borderWidth={0}
                        focusStyle={{ borderWidth: 0 }}
                        height={50}
                        fontSize={15}
                      />
                    </XStack>
                  </YStack>
                )}

                {/* Email */}
                <YStack gap={6}>
                  <Text
                    fontSize={11}
                    fontWeight="600"
                    color="rgba(255,255,255,0.4)"
                    letterSpacing={1.5}
                  >
                    EMAIL ADDRESS
                  </Text>
                  <XStack
                    height={52}
                    backgroundColor={INPUT_BG}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor={INPUT_BORDER}
                    alignItems="center"
                    paddingHorizontal={14}
                    gap={10}
                  >
                    <Mail size={18} color={ICON_COLOR} />
                    <Input
                      flex={1}
                      placeholder="name@example.com"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      color="white"
                      backgroundColor="transparent"
                      borderWidth={0}
                      focusStyle={{ borderWidth: 0 }}
                      height={50}
                      fontSize={15}
                    />
                  </XStack>
                </YStack>

                {/* Password */}
                <YStack gap={6}>
                  <Text
                    fontSize={11}
                    fontWeight="600"
                    color="rgba(255,255,255,0.4)"
                    letterSpacing={1.5}
                  >
                    PASSWORD
                  </Text>
                  <XStack
                    height={52}
                    backgroundColor={INPUT_BG}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor={INPUT_BORDER}
                    alignItems="center"
                    paddingHorizontal={14}
                    gap={10}
                  >
                    <Lock size={18} color={ICON_COLOR} />
                    <Input
                      flex={1}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      color="white"
                      backgroundColor="transparent"
                      borderWidth={0}
                      focusStyle={{ borderWidth: 0 }}
                      height={50}
                      fontSize={15}
                    />
                    <XStack
                      width={36}
                      height={36}
                      alignItems="center"
                      justifyContent="center"
                      onPress={() => setShowPassword(!showPassword)}
                      cursor="pointer"
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={ICON_COLOR} />
                      ) : (
                        <Eye size={18} color={ICON_COLOR} />
                      )}
                    </XStack>
                  </XStack>
                </YStack>

                {/* Submit */}
                <Button
                  onPress={tab === "login" ? login : register}
                  height={54}
                  backgroundColor={PURPLE}
                  borderRadius={14}
                  pressStyle={{ backgroundColor: PURPLE_PRESS }}
                  mt={4}
                  disabled={loading}
                  opacity={loading ? 0.7 : 1}
                >
                  <Text color="white" fontSize={17} fontWeight="700">
                    {loading
                      ? "Please wait…"
                      : tab === "login"
                      ? "Sign In"
                      : "Create Account"}
                  </Text>
                </Button>
              </YStack>
            </YStack>

            {/* Terms */}
            <YStack mt={24} alignItems="center">
              <Text
                color="rgba(255,255,255,0.35)"
                fontSize={13}
                textAlign="center"
                lineHeight={20}
              >
                By signing in, you agree to our{" "}
                <Text color="white" fontWeight="700" fontSize={13}>
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text color="white" fontWeight="700" fontSize={13}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
