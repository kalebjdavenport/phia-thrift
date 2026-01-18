import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkPermissionAndRedirect();
  }, []);

  async function checkPermissionAndRedirect() {
    const { status } = await Camera.getCameraPermissionsAsync();

    if (status === 'granted') {
      router.replace('/camera');
    } else {
      router.replace('/primer');
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-muted">Loading...</Text>
    </View>
  );
}
