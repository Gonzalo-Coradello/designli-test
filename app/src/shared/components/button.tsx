import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/hooks/use-theme'
import { Radius, Spacing } from '@/shared/theme'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  accessibilityHint?: string
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme()
  const isDisabled = disabled || loading

  const variantStyles = {
    primary: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      textColor: theme.onPrimary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: theme.primary,
      textColor: theme.primary,
      borderWidth: 1,
    },
    danger: {
      backgroundColor: 'transparent',
      borderColor: theme.danger,
      textColor: theme.danger,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: theme.backgroundElement,
      borderColor: 'transparent',
      textColor: theme.link,
      borderWidth: 0,
    },
  }[variant]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth,
          opacity: pressed || isDisabled ? 0.85 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} />
      ) : (
        <ThemedText type="smallBold" style={{ color: variantStyles.textColor }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
})
