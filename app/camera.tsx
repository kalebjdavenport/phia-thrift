import { useRef, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { CameraView, type CameraType } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Zap, ZapOff, SwitchCamera, Image } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { IconButton } from '@/components/ui/IconButton';
import { CaptureButton } from '@/components/CaptureButton';
import { ResultsSheet } from '@/components/ResultsSheet';
import { identifyClothing } from '@/lib/api/openai';
import type { IdentificationResponse } from '@/lib/schemas';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState<IdentificationResponse | null>(null);

  const toggleFlash = useCallback(() => setFlash((f) => !f), []);
  const toggleFacing = useCallback(
    () => setFacing((f) => (f === 'back' ? 'front' : 'back')),
    []
  );

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (photo?.base64) {
        const identification = await identifyClothing(photo.base64);
        setResult(identification);
        bottomSheetRef.current?.snapToIndex(0);
      }
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setCapturing(false);
    }
  }

  function handleCloseSheet() {
    bottomSheetRef.current?.close();
    setResult(null);
  }

  function handleClose() {
    router.replace('/primer');
  }

  function handleGallery() {
    // TODO: Open image picker
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-black">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          flash={flash ? 'on' : 'off'}
        />

        {/* Top Bar */}
        <View
          className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          <IconButton icon={X} onPress={handleClose} size={28} />
          <IconButton
            icon={flash ? Zap : ZapOff}
            onPress={toggleFlash}
            size={24}
          />
        </View>

        {/* Bottom Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-black/80"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-center justify-around py-4">
            <IconButton icon={Image} onPress={handleGallery} size={28} />
            <CaptureButton onPress={handleCapture} disabled={capturing} />
            <IconButton icon={SwitchCamera} onPress={toggleFacing} size={28} />
          </View>
        </View>

        {capturing && (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <Text className="text-lg text-white">Identifying...</Text>
          </View>
        )}

        <ResultsSheet
          ref={bottomSheetRef}
          result={result}
          onClose={handleCloseSheet}
        />
      </View>
    </GestureHandlerRootView>
  );
}
