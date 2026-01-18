import { Pressable, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';

interface IconButtonProps extends PressableProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  className?: string;
}

export function IconButton({
  icon: Icon,
  size = 24,
  color = '#fff',
  className,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      className={cn(
        'items-center justify-center rounded-full p-2 active:opacity-60',
        className
      )}
      {...props}
    >
      <Icon size={size} color={color} />
    </Pressable>
  );
}
