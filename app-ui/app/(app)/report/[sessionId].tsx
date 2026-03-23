import { useState } from "react";
import { ScrollView, YStack, XStack, Text, Button, Spinner } from "tamagui";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, Alert, View, Linking } from "react-native";
import {
  ChevronLeft,
  CheckCircle,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Award,
  Download,
} from "@tamagui/lucide-icons";
import Svg, { Circle } from "react-native-svg";
import { useReport } from "lib/hooks/useReport";
import { getValidToken } from "lib/auth";
import { API_BASE } from "lib/env";

/* ── Circular score ring ── */

const RING_SIZE = 140;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({ score }: { score: number }) {
  const offset = CIRCUMFERENCE * (1 - score / 100);
  return (
    <View
      style={{
        width: RING_SIZE,
        height: RING_SIZE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="#22c55e"
          strokeWidth={10}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <YStack alignItems="center" gap={2}>
        <Text color="white" fontSize={38} fontWeight="800" lineHeight={42}>
          {score}
        </Text>
        <Text
          color="rgba(255,255,255,0.4)"
          fontSize={11}
          fontWeight="600"
          letterSpacing={1.5}
        >
          SCORE
        </Text>
      </YStack>
    </View>
  );
}

/* ── Hiring decision badge ── */

const DECISION_STYLES: Record<string, { color: string; bg: string }> = {
  "Strong Hire": { color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  Hire: { color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  Maybe: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  "No Hire": { color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
};

function HiringBadge({ decision }: { decision: string }) {
  const style = DECISION_STYLES[decision] ?? DECISION_STYLES["Maybe"];
  return (
    <XStack
      backgroundColor={style.bg as any}
      borderRadius={24}
      paddingHorizontal={16}
      paddingVertical={8}
      alignItems="center"
      gap={8}
    >
      <Award size={16} color={style.color as any} />
      <Text color={style.color as any} fontSize={14} fontWeight="700">
        {decision}
      </Text>
    </XStack>
  );
}

/* ── Skill labels ── */

const SKILL_MAP = [
  { key: "technical_knowledge" as const, label: "Technical Knowledge" },
  { key: "communication" as const, label: "Communication" },
  { key: "problem_solving" as const, label: "Problem Solving" },
  { key: "confidence" as const, label: "Confidence" },
];

/* ── Format date ── */

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ── Main screen ── */

export default function ReportScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data, isLoading, error } = useReport(sessionId ?? "");
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!sessionId) return;
    setDownloading(true);
    try {
      const token = await getValidToken();
      const url = `${API_BASE}/api/interview/report/${sessionId}/pdf?token=${token}`;
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not download the report.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#060b14", "#0B1220", "#0F172A"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Spinner size="large" color="white" />
          <Text color="rgba(255,255,255,0.5)" fontSize={14} mt={16}>
            Loading report...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error || !data) {
    return (
      <LinearGradient
        colors={["#060b14", "#0B1220", "#0F172A"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <XStack px={16} pt={12} pb={4} alignItems="center" gap={12}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <ChevronLeft size={26} color="white" />
            </Pressable>
            <Text color="white" fontSize={18} fontWeight="700">
              Interview Performance
            </Text>
          </XStack>
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            px={32}
          >
            <Text
              color="rgba(255,255,255,0.5)"
              fontSize={15}
              textAlign="center"
            >
              Report is not available yet. It may still be generating — please
              check back shortly.
            </Text>
          </YStack>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const skills = SKILL_MAP.map((s) => ({
    label: s.label,
    pct: data.skill_scores?.[s.key] ?? 0,
  }));

  return (
    <LinearGradient
      colors={["#060b14", "#0B1220", "#0F172A"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <XStack px={16} pt={12} pb={4} alignItems="center" gap={12}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={26} color="white" />
          </Pressable>
          <Text color="white" fontSize={18} fontWeight="700">
            Interview Performance
          </Text>
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          <YStack gap={24} px={20} pt={24}>
            {/* Score ring + hiring badge + role */}
            <YStack alignItems="center" gap={16}>
              <ScoreRing score={data.score} />
              <HiringBadge decision={data.hiring_decision} />
              <YStack alignItems="center" gap={6}>
                <Text color="white" fontSize={24} fontWeight="800">
                  {data.job_role}
                </Text>
                <Text color="rgba(255,255,255,0.4)" fontSize={13}>
                  {formatDate(data.created_at)}
                  {data.interviewer_name
                    ? ` \u2022 ${data.interviewer_name}`
                    : ""}
                </Text>
              </YStack>
            </YStack>

            {/* Skill Breakdown */}
            <YStack gap={12}>
              <Text color="white" fontSize={17} fontWeight="700">
                Skill Breakdown
              </Text>
              <YStack
                backgroundColor="rgba(255,255,255,0.05)"
                borderRadius={16}
                borderWidth={1}
                borderColor="rgba(255,255,255,0.08)"
                padding={16}
                gap={16}
              >
                {skills.map((skill) => (
                  <YStack key={skill.label} gap={8}>
                    <XStack
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text color="white" fontSize={14} fontWeight="600">
                        {skill.label}
                      </Text>
                      <Text
                        color="rgba(255,255,255,0.5)"
                        fontSize={13}
                        fontWeight="600"
                      >
                        {skill.pct}%
                      </Text>
                    </XStack>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        borderRadius: 3,
                      }}
                    >
                      <View
                        style={{
                          height: 6,
                          width: `${skill.pct}%`,
                          backgroundColor: "#6366F1",
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </YStack>
                ))}
              </YStack>
            </YStack>

            {/* Strengths */}
            <YStack
              backgroundColor="rgba(255,255,255,0.05)"
              borderRadius={16}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.08)"
              borderLeftWidth={3}
              borderLeftColor="#22c55e"
              padding={16}
              gap={12}
            >
              <XStack alignItems="center" gap={8}>
                <CheckCircle size={18} color="#22c55e" />
                <Text color="white" fontSize={15} fontWeight="700">
                  Strengths
                </Text>
              </XStack>
              <YStack gap={8}>
                {data.strengths.map((s, i) => (
                  <XStack key={i} gap={8} alignItems="flex-start">
                    <Text color="#22c55e" fontSize={14} lineHeight={20}>
                      {"\u2022"}
                    </Text>
                    <Text
                      color="rgba(255,255,255,0.75)"
                      fontSize={14}
                      lineHeight={20}
                      flex={1}
                    >
                      {s}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>

            {/* Improvements */}
            <YStack
              backgroundColor="rgba(255,255,255,0.05)"
              borderRadius={16}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.08)"
              borderLeftWidth={3}
              borderLeftColor="#f59e0b"
              padding={16}
              gap={12}
            >
              <XStack alignItems="center" gap={8}>
                <TrendingUp size={18} color="#f59e0b" />
                <Text color="white" fontSize={15} fontWeight="700">
                  Improvements
                </Text>
              </XStack>
              <YStack gap={8}>
                {data.improvements.map((s, i) => (
                  <XStack key={i} gap={8} alignItems="flex-start">
                    <Text color="#f59e0b" fontSize={14} lineHeight={20}>
                      {"\u2022"}
                    </Text>
                    <Text
                      color="rgba(255,255,255,0.75)"
                      fontSize={14}
                      lineHeight={20}
                      flex={1}
                    >
                      {s}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>

            {/* Final Verdict */}
            {data.final_verdict ? (
              <YStack
                backgroundColor="rgba(255,255,255,0.05)"
                borderRadius={16}
                borderWidth={1}
                borderColor="rgba(255,255,255,0.08)"
                padding={16}
                gap={10}
              >
                <Text color="white" fontSize={15} fontWeight="700">
                  Final Verdict
                </Text>
                <Text
                  color="rgba(255,255,255,0.7)"
                  fontSize={14}
                  lineHeight={22}
                >
                  {data.final_verdict}
                </Text>
              </YStack>
            ) : null}

            {/* Full Transcript */}
            <YStack gap={14}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="white" fontSize={17} fontWeight="700">
                  Full Transcript
                </Text>
                <Pressable onPress={() => setTranscriptOpen((v) => !v)}>
                  <XStack alignItems="center" gap={4}>
                    <Text color="#6366F1" fontSize={13} fontWeight="600">
                      {transcriptOpen ? "Collapse" : "Expand"}
                    </Text>
                    {transcriptOpen ? (
                      <ChevronUp size={14} color="#6366F1" />
                    ) : (
                      <ChevronDown size={14} color="#6366F1" />
                    )}
                  </XStack>
                </Pressable>
              </XStack>

              {transcriptOpen && (
                <YStack gap={12}>
                  {data.transcript.map((msg, i) => {
                    const isAi = msg.role === "ai";
                    return (
                      <YStack
                        key={i}
                        alignItems={isAi ? "flex-start" : "flex-end"}
                        gap={4}
                      >
                        <YStack
                          backgroundColor={
                            isAi ? "rgba(255,255,255,0.06)" : "#6366F1"
                          }
                          borderRadius={14}
                          padding={14}
                          maxWidth="85%"
                        >
                          <Text
                            color={isAi ? "rgba(255,255,255,0.85)" : "white"}
                            fontSize={14}
                            lineHeight={21}
                          >
                            {msg.text}
                          </Text>
                        </YStack>
                        <Text
                          color="rgba(255,255,255,0.3)"
                          fontSize={10}
                          fontWeight="600"
                          letterSpacing={0.8}
                          px={4}
                        >
                          {isAi ? "INTERVIEWER" : "YOU"}
                        </Text>
                      </YStack>
                    );
                  })}
                </YStack>
              )}
            </YStack>

            {/* Download PDF */}
            <Button
              height={54}
              backgroundColor="rgba(255,255,255,0.04)"
              borderRadius={16}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.15)"
              pressStyle={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              onPress={handleDownloadPdf}
              disabled={downloading}
              icon={
                downloading ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <Download size={18} color="white" />
                )
              }
            >
              <Text color="white" fontSize={16} fontWeight="600">
                {downloading ? "Downloading..." : "Download PDF Report"}
              </Text>
            </Button>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
