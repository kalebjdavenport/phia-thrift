import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon } from 'lucide-react-native';
import { Camera } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function Primer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function handleEnableCamera() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      router.replace('/camera');
    }
  }

  function handleMaybeLater() {
    // Stay on primer screen - user can try again
  }

  return (
    <View
      className="flex-1 items-center justify-center bg-white px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="items-center">
        <View className="mb-8 h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <CameraIcon size={40} color="#000" />
        </View>

        <Text className="mb-3 text-center text-2xl font-bold text-primary">
          Enable Camera Access
        </Text>

        <Text className="mb-10 text-center text-base text-muted">
          Take photos to identify clothing
        </Text>

        <Button
          onPress={handleEnableCamera}
          size="lg"
          className="mb-4 w-full"
        >
          Enable Camera
        </Button>

        <Pressable onPress={handleMaybeLater} className="p-2 active:opacity-60">
          <Text className="text-base text-muted">Maybe Later</Text>
        </Pressable>
      </View>
    </View>
  );
}
