import { useRef } from 'react';
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
  const { identify, reset, isLoading, result } = useIdentification();

  async function handleCapture() {
    const processed = await capture();
    if (processed) {
      await identify(processed.base64, processed.uri);
      bottomSheetRef.current?.snapToIndex(0);
    }
  }

  function handleCloseSheet() {
    bottomSheetRef.current?.close();
    reset();
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

        {/* Bottom Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-black/80"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-center justify-around py-4">
            <IconButton icon={Image} onPress={handleGallery} size={28} />
            <CaptureButton onPress={handleCapture} disabled={showLoading} />
            <IconButton icon={SwitchCamera} onPress={toggleFacing} size={28} />
          </View>
        </View>

        {showLoading && (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <Text className="text-lg text-white">
              {isCapturing ? 'Capturing...' : 'Identifying...'}
            </Text>
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
