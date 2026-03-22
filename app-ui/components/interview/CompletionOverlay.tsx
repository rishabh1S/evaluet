import { YStack, XStack, Text, Button } from "tamagui";
import { CheckCircle, ArrowRight } from "@tamagui/lucide-icons";

type Props = {
  onBack: () => void;
};

export default function CompletionOverlay({ onBack }: Props) {
  return (
    <YStack
      position="absolute"
      top={0}
      bottom={0}
      left={0}
      right={0}
      backgroundColor="rgba(6,11,20,0.92)"
      alignItems="center"
      justifyContent="center"
      zIndex={999}
    >
      <YStack
        backgroundColor="rgba(255,255,255,0.05)"
        borderColor="rgba(255,255,255,0.1)"
        borderWidth={1}
        borderRadius={24}
        padding={32}
        alignItems="center"
        width="82%"
        gap={20}
      >
        {/* Icon */}
        <YStack
          width={72}
          height={72}
          borderRadius={36}
          backgroundColor="rgba(99,102,241,0.15)"
          borderWidth={1.5}
          borderColor="#6366F1"
          alignItems="center"
          justifyContent="center"
        >
          <CheckCircle size={34} color="#6366F1" />
        </YStack>

        {/* Text */}
        <YStack alignItems="center" gap={8}>
          <Text color="white" fontSize={22} fontWeight="800">
            Interview Complete
          </Text>
          <Text
            color="rgba(255,255,255,0.45)"
            fontSize={14}
            textAlign="center"
            lineHeight={22}
          >
            Your report will be emailed to you shortly.
          </Text>
        </YStack>

        {/* Button */}
        <Button
          onPress={onBack}
          width="100%"
          height={52}
          backgroundColor="#6366F1"
          borderRadius={14}
          pressStyle={{ backgroundColor: "#4F52D9" }}
          mt={4}
        >
          <XStack gap={8} alignItems="center">
            <Text color="white" fontSize={16} fontWeight="700">
              Back to Home
            </Text>
            <ArrowRight size={18} color="white" />
          </XStack>
        </Button>
      </YStack>
    </YStack>
  );
}
