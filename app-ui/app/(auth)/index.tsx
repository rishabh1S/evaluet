import { YStack, XStack, Text, Button } from "tamagui";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BrainCircuit, Sparkles, ArrowRight } from "@tamagui/lucide-icons";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SLIDE_HEIGHT = Math.min(SCREEN_H * 0.62, 520);

const SLIDES = [
  {
    title: "Practice with AI\ninterviewers",
    subtitle:
      "Sharpen your skills with personalized mock interviews tailored to your target role.",
  },
  {
    title: "Get real-time\nfeedback",
    subtitle:
      "Receive instant analysis on your answers with detailed performance scoring.",
  },
  {
    title: "Track your\nprogress",
    subtitle:
      "Monitor your improvement across sessions and identify growth areas.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  return (
    <LinearGradient
      colors={["#080D18", "#0C1220", "#08101E"]}
      style={{ flex: 1 }}
    >
      <YStack flex={1}>
        {/* Carousel */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ height: SLIDE_HEIGHT }}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_W
            );
            setActiveIndex(idx);
          }}
        >
          {SLIDES.map((slide, i) => (
            <YStack
              key={i}
              width={SCREEN_W}
              height={SLIDE_HEIGHT}
              px={24}
              pt={56}
              alignItems="center"
            >
              {/* Visual Card */}
              <YStack
                width="100%"
                height={240}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={24}
                borderWidth={1}
                borderColor="rgba(255,255,255,0.08)"
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                {/* AI Coach Active Badge */}
                <XStack
                  position="absolute"
                  top={-18}
                  right={12}
                  backgroundColor="rgba(12,18,32,0.98)"
                  borderRadius={20}
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.1)"
                  paddingHorizontal={12}
                  paddingVertical={8}
                  alignItems="center"
                  gap={6}
                >
                  <Sparkles size={13} color="#818CF8" />
                  <Text
                    color="#818CF8"
                    fontSize={11}
                    fontWeight="600"
                    letterSpacing={1.5}
                  >
                    AI COACH ACTIVE
                  </Text>
                </XStack>

                {/* AI Visual */}
                <YStack alignItems="center" gap={20}>
                  <BrainCircuit size={72} color="#9FA4E4" />
                  <XStack gap={10} alignItems="flex-end">
                    <YStack
                      width={10}
                      height={30}
                      backgroundColor="#6366F1"
                      borderRadius={5}
                    />
                    <YStack
                      width={10}
                      height={52}
                      backgroundColor="#818CF8"
                      borderRadius={5}
                    />
                    <YStack
                      width={10}
                      height={36}
                      backgroundColor="rgba(99,102,241,0.6)"
                      borderRadius={5}
                    />
                  </XStack>
                </YStack>
              </YStack>

              {/* Text Content */}
              <YStack mt={28} alignItems="center" gap={12} px={8}>
                <Text
                  fontSize={34}
                  fontWeight="800"
                  color="white"
                  textAlign="center"
                  lineHeight={44}
                >
                  {slide.title}
                </Text>
                <Text
                  fontSize={16}
                  color="rgba(255,255,255,0.5)"
                  textAlign="center"
                  lineHeight={26}
                >
                  {slide.subtitle}
                </Text>
              </YStack>
            </YStack>
          ))}
        </ScrollView>

        {/* Bottom Section */}
        <YStack flex={1} px={24} pb={44} justifyContent="flex-end">
          {/* Pagination Dots */}
          <XStack justifyContent="center" gap={8} mb={28}>
            {SLIDES.map((_, i) => (
              <YStack
                key={i}
                height={6}
                width={i === activeIndex ? 28 : 8}
                backgroundColor={
                  i === activeIndex ? "#6366F1" : "rgba(255,255,255,0.2)"
                }
                borderRadius={3}
              />
            ))}
          </XStack>

          {/* Get Started */}
          <Button
            onPress={() => router.push("/(auth)/login?tab=register")}
            height={56}
            backgroundColor="#6366F1"
            borderRadius={16}
            pressStyle={{ backgroundColor: "#4F52D9" }}
            mb={12}
          >
            <XStack gap={8} alignItems="center">
              <Text color="white" fontSize={17} fontWeight="700">
                Get Started
              </Text>
              <ArrowRight size={18} color="white" />
            </XStack>
          </Button>

          {/* Already have account */}
          <Button
            onPress={() => router.push("/(auth)/login")}
            height={44}
            backgroundColor="transparent"
            borderWidth={0}
            pressStyle={{ backgroundColor: "transparent", opacity: 0.7 }}
          >
            <Text color="rgba(255,255,255,0.6)" fontSize={15}>
              I already have an account
            </Text>
          </Button>
        </YStack>
      </YStack>
    </LinearGradient>
  );
}
