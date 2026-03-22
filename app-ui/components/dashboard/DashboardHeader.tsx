import { XStack, YStack, Text } from "tamagui";

type Props = {
  firstName: string;
  initials: string;
  onAvatarPress: () => void;
};

export function DashboardHeader({ firstName, initials, onAvatarPress }: Props) {
  return (
    <XStack
      px={24}
      pt={16}
      pb={24}
      alignItems="center"
      justifyContent="space-between"
    >
      <YStack width={44} />

      <YStack alignItems="center" gap={3}>
        <Text color="white" fontSize={22} fontWeight="800">
          Welcome back, {firstName}
        </Text>
        <Text color="rgba(255,255,255,0.4)" fontSize={13}>
          Ready for your next breakthrough?
        </Text>
      </YStack>

      <YStack
        width={44}
        height={44}
        borderRadius={22}
        backgroundColor="#6366F1"
        alignItems="center"
        justifyContent="center"
        onPress={onAvatarPress}
        cursor="pointer"
      >
        <Text color="white" fontSize={15} fontWeight="700">
          {initials}
        </Text>
      </YStack>
    </XStack>
  );
}
