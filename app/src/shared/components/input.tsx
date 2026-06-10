import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/hooks/use-theme'
import { Radius, Spacing } from '@/shared/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: StyleProp<ViewStyle>
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  accessibilityLabel,
  ...textInputProps
}: InputProps) {
  const theme = useTheme()

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <ThemedText type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: error ? theme.danger : theme.backgroundSelected,
            backgroundColor: theme.backgroundElement,
          },
          style,
        ]}
        {...textInputProps}
      />
      {error ? (
        <ThemedText
          type="small"
          style={[styles.error, { color: theme.danger }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.half,
  },
  label: {
    marginBottom: Spacing.half,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  error: {},
})
