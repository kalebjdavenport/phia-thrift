import { Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CaptureButton({ onPress, disabled, loading }: CaptureButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    if (!disabled && !loading) {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    }
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={animatedStyle}
      className={`h-[72px] w-[72px] items-center justify-center rounded-full border-4 ${
        isDisabled ? 'border-gray-500' : 'border-white'
      }`}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <Animated.View
          className={`h-[56px] w-[56px] rounded-full ${
            isDisabled ? 'bg-gray-500' : 'bg-white'
          }`}
        />
      )}
    </AnimatedPressable>
  );
}
