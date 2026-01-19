import { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Zap, ZapOff, SwitchCamera, Image } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { IconButton } from '@/components/ui/IconButton';
import { CaptureButton } from '@/components/CaptureButton';
import { ResultsSheet } from '@/components/ResultsSheet';
import { useCamera } from '@/hooks/useCamera';
import { useIdentification } from '@/hooks/useIdentification';

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { cameraRef, facing, flash, isCapturing, toggleFacing, toggleFlash, capture } = useCamera();
  const { identify, reset, isLoading, result, error } = useIdentification();
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function handleCapture() {
    const processed = await capture();
    if (processed) {
      setImageUri(processed.uri);
      await identify(processed.base64, processed.uri);
      bottomSheetRef.current?.snapToIndex(0);
    }
  }

  function handleRetry() {
    bottomSheetRef.current?.close();
    reset();
    setImageUri(null);
    handleCapture();
  }

  function handleCloseSheet() {
    bottomSheetRef.current?.close();
    reset();
    setImageUri(null);
  }

  function handleClose() {
    router.replace('/primer');
  }

  function handleGallery() {
    // TODO: Open image picker
  }

  const showLoading = isCapturing || isLoading;

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

        {/* Bottom Bar - hidden during loading */}
        {!showLoading && (
          <View
            className="absolute bottom-0 left-0 right-0 bg-black/80"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="flex-row items-center justify-around py-4">
              <IconButton
                icon={Image}
                onPress={handleGallery}
                size={28}
              />
              <CaptureButton
                onPress={handleCapture}
              />
              <IconButton
                icon={SwitchCamera}
                onPress={toggleFacing}
                size={28}
              />
            </View>
          </View>
        )}

        {showLoading && (
          <View className="absolute inset-0 items-center justify-center bg-black">
            <View className="items-center px-8 py-6">
              <Text className="text-lg font-semibold text-white">
                {isCapturing ? 'Capturing...' : 'Analyzing clothing...'}
              </Text>
              <Text className="mt-2 text-sm text-gray-400">
                Please wait
              </Text>
            </View>
          </View>
        )}

        <ResultsSheet
          ref={bottomSheetRef}
          result={result}
          error={error}
          imageUri={imageUri}
          onClose={handleCloseSheet}
          onRetry={handleRetry}
        />
      </View>
    </GestureHandlerRootView>
  );
}
