import { useState } from "react";
import { ScrollView, YStack, XStack, Text, Button } from "tamagui";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, Alert, View } from "react-native";
import { ChevronLeft, CheckCircle, TrendingUp, ChevronUp, ChevronDown } from "@tamagui/lucide-icons";
import Svg, { Circle } from "react-native-svg";

/* ── Hardcoded report data ── */

const REPORT = {
  score: 85,
  role: "Senior Product Designer",
  date: "May 24, 2024",
  interviewer: "AI Mentor Alex",
  skills: [
    { label: "Technical Knowledge", pct: 92 },
    { label: "Communication", pct: 78 },
    { label: "Problem Solving", pct: 88 },
    { label: "Confidence", pct: 82 },
  ],
  strengths: [
    "Exceptional depth in explaining system design tradeoffs.",
    "Maintained strong eye contact and professional posture.",
  ],
  improvements: [
    "Refining answer length to avoid overly long technical tangents.",
    "Providing more concrete metrics for past project impacts.",
  ],
  transcript: [
    { role: "ai", text: "Can you describe a time you had to handle a major technical failure in production?" },
    { role: "user", text: "Last year, our primary database node failed during a peak sale event. I coordinated with the DevOps team to implement our failover protocol while keeping stakeholders informed about the estimated recovery time." },
    { role: "ai", text: "That's a solid high-level overview. What specific technical steps did you take to prevent this from recurring?" },
    { role: "user", text: "We implemented automated health checks with PagerDuty alerts, set up read replicas in a different availability zone, and added a runbook for the team." },
    { role: "ai", text: "Good. How did you prioritize communication vs. hands-on technical work during the incident?" },
    { role: "user", text: "I delegated the technical recovery to my senior engineer while I handled stakeholder communication, then synced every 15 minutes to ensure we stayed aligned on ETAs." },
  ],
};

/* ── Circular score ring ── */

const RING_SIZE = 140;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({ score }: { score: number }) {
  const offset = CIRCUMFERENCE * (1 - score / 100);
  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" }}>
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
        <Text color="rgba(255,255,255,0.4)" fontSize={11} fontWeight="600" letterSpacing={1.5}>
          SCORE
        </Text>
      </YStack>
    </View>
  );
}

/* ── Main screen ── */

export default function ReportScreen() {
  const router = useRouter();
  const [transcriptOpen, setTranscriptOpen] = useState(true);

  return (
    <LinearGradient colors={["#060b14", "#0B1220", "#0F172A"]} style={{ flex: 1 }}>
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
            {/* Score ring + role */}
            <YStack alignItems="center" gap={16}>
              <ScoreRing score={REPORT.score} />
              <YStack alignItems="center" gap={6}>
                <Text color="white" fontSize={24} fontWeight="800">
                  {REPORT.role}
                </Text>
                <Text color="rgba(255,255,255,0.4)" fontSize={13}>
                  {REPORT.date} • {REPORT.interviewer}
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
                {REPORT.skills.map((skill) => (
                  <YStack key={skill.label} gap={8}>
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text color="white" fontSize={14} fontWeight="600">
                        {skill.label}
                      </Text>
                      <Text color="rgba(255,255,255,0.5)" fontSize={13} fontWeight="600">
                        {skill.pct}%
                      </Text>
                    </XStack>
                    {/* Track */}
                    <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                      {/* Fill */}
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
                {REPORT.strengths.map((s, i) => (
                  <XStack key={i} gap={8} alignItems="flex-start">
                    <Text color="#22c55e" fontSize={14} lineHeight={20}>•</Text>
                    <Text color="rgba(255,255,255,0.75)" fontSize={14} lineHeight={20} flex={1}>
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
                {REPORT.improvements.map((s, i) => (
                  <XStack key={i} gap={8} alignItems="flex-start">
                    <Text color="#f59e0b" fontSize={14} lineHeight={20}>•</Text>
                    <Text color="rgba(255,255,255,0.75)" fontSize={14} lineHeight={20} flex={1}>
                      {s}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>

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
                    {transcriptOpen
                      ? <ChevronUp size={14} color="#6366F1" />
                      : <ChevronDown size={14} color="#6366F1" />
                    }
                  </XStack>
                </Pressable>
              </XStack>

              {transcriptOpen && (
                <YStack gap={12}>
                  {REPORT.transcript.map((msg, i) => {
                    const isAi = msg.role === "ai";
                    return (
                      <YStack key={i} alignItems={isAi ? "flex-start" : "flex-end"} gap={4}>
                        <YStack
                          backgroundColor={isAi ? "rgba(255,255,255,0.06)" : "#6366F1"}
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
                          {isAi ? "AI MENTOR" : "YOU"}
                        </Text>
                      </YStack>
                    );
                  })}
                </YStack>
              )}
            </YStack>

            <Button
                height={54}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={16}
                borderWidth={1}
                borderColor="rgba(255,255,255,0.15)"
                pressStyle={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                onPress={() =>
                  Alert.alert("Coming soon", "PDF export will be available in a future update.")
                }
              >
                <Text color="white" fontSize={16} fontWeight="600">
                  Download PDF Report
                </Text>
              </Button>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
