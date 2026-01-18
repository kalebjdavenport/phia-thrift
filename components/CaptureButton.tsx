import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CaptureButton({ onPress, disabled }: CaptureButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={animatedStyle}
      className="h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white"
    >
      <Animated.View className="h-[56px] w-[56px] rounded-full bg-white" />
    </AnimatedPressable>
  );
}
