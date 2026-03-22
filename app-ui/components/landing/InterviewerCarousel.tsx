import {
  ScrollView,
  XStack,
  Card,
  YStack,
  Avatar,
  Text,
  Button,
} from "tamagui";
import { Info } from "@tamagui/lucide-icons";
import { InterviewerSkeleton } from "./InterviewerSkeleton";
import { Interviewer } from "lib/store/interviewerStore";

type Props = {
  interviewers: Interviewer[];
  selected: Interviewer | null;
  onSelect: (i: Interviewer) => void;
  onInfo: (i: Interviewer) => void;
  loading: boolean;
  error: boolean;
};

export function InterviewerCarousel({
  interviewers,
  selected,
  onSelect,
  onInfo,
  loading,
  error,
}: Readonly<Props>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} pr="$3">
      <XStack gap="$3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <InterviewerSkeleton key={i} />
          ))}
        {error && <Text color="$red10">Failed to load interviewers</Text>}
        {interviewers.map((interviewer: any) => {
          const isSelected = selected?.id === interviewer.id;

          return (
            <Card
              key={interviewer.id}
              onPress={() => onSelect(interviewer)}
              p="$3"
              position="relative"
              bg={
                isSelected ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.05)"
              }
              borderColor={isSelected ? "#4F52D9" : "rgba(255,255,255,0.15)"}
              borderWidth={1}
              pressStyle={{ scale: 0.97 }}
            >
              {/* Info Button */}
              <Button
                zIndex={999}
                size="$2.5"
                circular
                position="absolute"
                top="$-1.5"
                right="$-1.5"
                chromeless
                onPress={(e) => {
                  e.stopPropagation();
                  onInfo(interviewer);
                }}
              >
                <Info size={16} />
              </Button>
              <YStack gap="$2">
                {/* Avatar */}
                <Avatar circular size="$6">
                  <Avatar.Image
                    accessibilityLabel="Cam"
                    src={interviewer.profile_image_url}
                  />
                  <Avatar.Fallback
                    backgroundColor="$black9"
                    items="center"
                    justify="center"
                  >
                    <Text fontWeight="700" fontSize="$8">{interviewer.name.charAt(0)}</Text>
                  </Avatar.Fallback>
                </Avatar>

                <Text fontSize={15} fontWeight="600" textAlign="center">
                  {interviewer.name}
                </Text>
              </YStack>
            </Card>
          );
        })}
      </XStack>
    </ScrollView>
  );
}
