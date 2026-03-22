import { Sheet, YStack, Text, Avatar, Button } from "tamagui";
import { X } from "@tamagui/lucide-icons";

export function InterviewerInfoSheet({ interviewer, onClose }: any) {
  return (
    <Sheet
      modal
      open={!!interviewer}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      snapPoints={[70]}
      dismissOnSnapToBottom
      animation="medium"
      zIndex={100_000}
    >
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.6)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />

      <Sheet.Frame
        p="$5" gap="$4"
        backgroundColor="#0D1424"
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        borderTopWidth={1}
        borderColor="rgba(255,255,255,0.08)"
      >
        {interviewer && (
          <>
            {/* Close button */}
            <Button
              size="$3"
              circular
              alignSelf="flex-end"
              onPress={() => onClose()}
              backgroundColor="rgba(255,255,255,0.08)"
              pressStyle={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <X size={16} color="rgba(255,255,255,0.7)" />
            </Button>

            <YStack gap="$4" alignItems="center">
              <Avatar circular size="$15">
                <Avatar.Image src={interviewer.profile_image_url} />
                <Avatar.Fallback
                  backgroundColor="#6366F1"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontWeight="700" fontSize="$8">
                    {interviewer.name.charAt(0)}
                  </Text>
                </Avatar.Fallback>
              </Avatar>

              <Text color="white" fontSize="$8" fontWeight="700">
                {interviewer.name}
              </Text>

              {interviewer.description && (
                <Text
                  color="rgba(255,255,255,0.6)"
                  textAlign="center"
                  fontSize={15}
                  lineHeight={22}
                >
                  {interviewer.description}
                </Text>
              )}

              {interviewer.focus_areas && (
                <YStack gap="$2" alignItems="center">
                  <Text color="rgba(255,255,255,0.5)" fontWeight="600" fontSize={12} letterSpacing={1}>
                    FOCUS AREAS
                  </Text>
                  <Text color="rgba(255,255,255,0.7)" textAlign="center" fontSize={14}>
                    {interviewer.focus_areas}
                  </Text>
                </YStack>
              )}
            </YStack>
          </>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
