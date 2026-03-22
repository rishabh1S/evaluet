import { YStack, Text, Button } from "tamagui";
import { ShieldPlus } from "@tamagui/lucide-icons";

type Props = {
  onPress: () => void;
};

export function NewInterviewCard({ onPress }: Props) {
  return (
    <YStack px={24}>
      <YStack
        backgroundColor="rgba(255,255,255,0.05)"
        borderRadius={20}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.08)"
        padding={28}
        alignItems="center"
        gap={14}
      >
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
            Start a new session to refine your skills{"\n"}and master your
            career trajectory.
          </Text>
        </YStack>

        <Button
          onPress={onPress}
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
  );
}
