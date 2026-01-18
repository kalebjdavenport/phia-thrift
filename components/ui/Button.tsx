import { Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: string;
  className?: string;
}

const variantStyles = {
  primary: 'bg-primary active:bg-secondary',
  secondary: 'bg-transparent border border-primary active:bg-gray-100',
  ghost: 'bg-transparent active:opacity-60',
};

const textVariantStyles = {
  primary: 'text-white',
  secondary: 'text-primary',
  ghost: 'text-muted',
};

const sizeStyles = {
  sm: 'px-4 py-2 rounded-lg',
  md: 'px-6 py-3 rounded-xl',
  lg: 'px-8 py-4 rounded-xl',
};

const textSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      <Text
        className={cn(
          'text-center font-semibold',
          textVariantStyles[variant],
          textSizeStyles[size]
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}
