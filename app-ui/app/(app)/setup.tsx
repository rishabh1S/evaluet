import {
  YStack,
  XStack,
  Text,
  Input,
  TextArea,
  Button,
} from "tamagui";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Briefcase,
  FileText,
  CheckCircle,
  Trash2,
  Play,
} from "@tamagui/lucide-icons";
import * as DocumentPicker from "expo-document-picker";
import { API_BASE } from "../../lib/env";
import { authFetch } from "lib/auth";
import { useInterviewers } from "lib/hooks/useInterviewers";
import { Interviewer, useInterviewerStore } from "lib/store/interviewerStore";
import {
  InterviewerCarousel,
  InterviewerInfoSheet,
} from "components/landing";
import { SafeAreaView } from "react-native-safe-area-context";

const PURPLE = "#6366F1";
const PURPLE_PRESS = "#4F52D9";
const INPUT_BG = "rgba(255,255,255,0.06)";
const INPUT_BORDER = "rgba(255,255,255,0.1)";
const LEVELS = ["Intern", "Associate", "Senior", "Lead", "Manager"];

export default function SetupScreen() {
  const router = useRouter();
  const [jobRole, setJobRole] = useState("");
  const [jobLevel, setJobLevel] = useState("Senior");
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] =
    useState<Interviewer | null>(null);
  const [infoInterviewer, setInfoInterviewer] = useState<Interviewer | null>(
    null
  );
  const {
    data: interviewers = [],
    isLoading: interviewersLoading,
    isError: interviewersError,
  } = useInterviewers();
  const setGlobalInterviewer = useInterviewerStore((s) => s.setInterviewer);

  useEffect(() => {
    if (!selectedInterviewer && interviewers.length > 0) {
      setSelectedInterviewer(interviewers[0]);
    }
  }, [interviewers, selectedInterviewer]);

  const pickResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (!result.canceled) setResume(result.assets[0]);
  };

  const startInterview = async () => {
    if (!jobRole || !jobLevel || !jobDesc || !resume || !selectedInterviewer) {
      alert("Please fill all fields and upload a resume");
      return;
    }
    setGlobalInterviewer(selectedInterviewer);
    setLoading(true);
    const form = new FormData();
    form.append("resume", {
      uri: resume.uri,
      name: resume.name,
      type: "application/pdf",
    } as any);
    form.append("job_role", jobRole);
    form.append("job_level", jobLevel);
    form.append("job_desc", jobDesc);
    form.append("interviewer_id", selectedInterviewer.id);

    try {
      const res = await authFetch(`${API_BASE}/api/interview/init`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      router.navigate(`/interview/${data.session_id}` as any);
    } catch (err: any) {
      console.error("Init interview failed:", err);
      alert(err.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#060b14", "#0B1220", "#0F172A"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 48 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Header ── */}
            <YStack px={24} pt={16} pb={24} gap={12}>
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

              <YStack gap={6}>
                <Text color="white" fontSize={32} fontWeight="800">
                  Setup Interview
                </Text>
                <Text
                  color="rgba(255,255,255,0.4)"
                  fontSize={14}
                  lineHeight={22}
                >
                  Customize your AI session to get the most relevant feedback
                  for your career goals.
                </Text>
              </YStack>
            </YStack>

            {/* ── Form Card ── */}
            <YStack
              mx={24}
              backgroundColor="rgba(255,255,255,0.04)"
              borderRadius={20}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.08)"
              padding={20}
              gap={22}
            >
              {/* Job Role */}
              <YStack gap={8}>
                <Text
                  fontSize={11}
                  fontWeight="600"
                  color="rgba(255,255,255,0.4)"
                  letterSpacing={1.5}
                >
                  JOB ROLE
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
                  <Briefcase size={18} color="rgba(255,255,255,0.3)" />
                  <Input
                    flex={1}
                    placeholder="e.g. Senior Product Designer"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={jobRole}
                    onChangeText={setJobRole}
                    color="white"
                    backgroundColor="transparent"
                    borderWidth={0}
                    focusStyle={{ borderWidth: 0 }}
                    height={50}
                    fontSize={15}
                  />
                </XStack>
              </YStack>

              {/* Job Level */}
              <YStack gap={10}>
                <Text
                  fontSize={11}
                  fontWeight="600"
                  color="rgba(255,255,255,0.4)"
                  letterSpacing={1.5}
                >
                  JOB LEVEL
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {LEVELS.map((level) => {
                    const active = jobLevel === level;
                    return (
                      <YStack
                        key={level}
                        paddingHorizontal={16}
                        paddingVertical={9}
                        borderRadius={20}
                        borderWidth={1}
                        backgroundColor={
                          active ? PURPLE : "rgba(255,255,255,0.06)"
                        }
                        borderColor={
                          active ? PURPLE : "rgba(255,255,255,0.12)"
                        }
                        onPress={() => setJobLevel(level)}
                        cursor="pointer"
                        pressStyle={{ opacity: 0.7 }}
                      >
                        <Text
                          color={active ? "white" : "rgba(255,255,255,0.55)"}
                          fontSize={14}
                          fontWeight={active ? "600" : "400"}
                        >
                          {level}
                        </Text>
                      </YStack>
                    );
                  })}
                </ScrollView>
              </YStack>

              {/* Choose Interviewer */}
              <YStack gap={10}>
                <Text
                  fontSize={11}
                  fontWeight="600"
                  color="rgba(255,255,255,0.4)"
                  letterSpacing={1.5}
                >
                  CHOOSE INTERVIEWER
                </Text>
                <InterviewerCarousel
                  interviewers={interviewers}
                  selected={selectedInterviewer}
                  onSelect={setSelectedInterviewer}
                  onInfo={setInfoInterviewer}
                  loading={interviewersLoading}
                  error={interviewersError}
                />
              </YStack>

              {/* Job Description */}
              <YStack gap={8}>
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text
                    fontSize={11}
                    fontWeight="600"
                    color="rgba(255,255,255,0.4)"
                    letterSpacing={1.5}
                  >
                    JOB DESCRIPTION
                  </Text>
                  <Text
                    fontSize={11}
                    color="rgba(255,255,255,0.3)"
                  >
                    {jobDesc.length} / 2000
                  </Text>
                </XStack>
                <YStack
                  backgroundColor={INPUT_BG}
                  borderRadius={12}
                  borderWidth={1}
                  borderColor={INPUT_BORDER}
                  padding={14}
                >
                  <TextArea
                    placeholder="Paste the job description here to tailor questions..."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={jobDesc}
                    onChangeText={(t) =>
                      setJobDesc(t.slice(0, 2000))
                    }
                    color="white"
                    backgroundColor="transparent"
                    borderWidth={0}
                    focusStyle={{ borderWidth: 0 }}
                    fontSize={15}
                    multiline
                    minHeight={120}
                    maxLength={2000}
                  />
                </YStack>
              </YStack>

              {/* Resume Upload */}
              <YStack gap={8}>
                <Text
                  fontSize={11}
                  fontWeight="600"
                  color="rgba(255,255,255,0.4)"
                  letterSpacing={1.5}
                >
                  UPLOAD RESUME
                </Text>

                {resume ? (
                  <XStack
                    height={56}
                    backgroundColor={INPUT_BG}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor="rgba(34,197,94,0.3)"
                    alignItems="center"
                    paddingHorizontal={14}
                    gap={10}
                  >
                    <FileText size={20} color="rgba(255,255,255,0.4)" />
                    <YStack flex={1} gap={2}>
                      <Text
                        color="white"
                        fontSize={14}
                        fontWeight="600"
                        numberOfLines={1}
                      >
                        {resume.name}
                      </Text>
                      <Text
                        color="rgba(255,255,255,0.35)"
                        fontSize={11}
                      >
                        Uploaded just now
                      </Text>
                    </YStack>
                    <CheckCircle size={20} color="#22c55e" />
                    <YStack
                      onPress={() => setResume(null)}
                      cursor="pointer"
                      ml={4}
                    >
                      <Trash2 size={18} color="rgba(255,255,255,0.35)" />
                    </YStack>
                  </XStack>
                ) : (
                  <XStack
                    height={56}
                    backgroundColor={INPUT_BG}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor={INPUT_BORDER}
                    alignItems="center"
                    paddingHorizontal={14}
                    gap={10}
                    onPress={pickResume}
                    cursor="pointer"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <FileText size={20} color="rgba(255,255,255,0.35)" />
                    <Text
                      color="rgba(255,255,255,0.45)"
                      fontSize={15}
                    >
                      Upload Resume (PDF)
                    </Text>
                  </XStack>
                )}
              </YStack>
            </YStack>

            {/* ── Start Button ── */}
            <YStack px={24} mt={24} gap={10}>
              <Button
                onPress={startInterview}
                height={56}
                backgroundColor={PURPLE}
                borderRadius={16}
                pressStyle={{ backgroundColor: PURPLE_PRESS }}
                disabled={loading}
                opacity={loading ? 0.7 : 1}
              >
                <XStack gap={10} alignItems="center">
                  <Play size={18} color="white" fill="white" />
                  <Text color="white" fontSize={17} fontWeight="700">
                    {loading ? "Starting…" : "Start Interview"}
                  </Text>
                </XStack>
              </Button>
              <Text
                textAlign="center"
                color="rgba(255,255,255,0.25)"
                fontSize={11}
                fontWeight="600"
                letterSpacing={1}
              >
                ESTIMATED DURATION: 15–20 MINS
              </Text>
            </YStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <InterviewerInfoSheet
        interviewer={infoInterviewer}
        onClose={() => setInfoInterviewer(null)}
      />
    </LinearGradient>
  );
}
