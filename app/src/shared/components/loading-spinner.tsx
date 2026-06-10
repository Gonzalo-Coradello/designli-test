import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/hooks/use-theme'
import { Spacing } from '@/shared/theme'

interface LoadingSpinnerProps {
  message?: string
  fullScreen?: boolean
  size?: 'small' | 'large'
  style?: StyleProp<ViewStyle>
}

export function LoadingSpinner({
  message,
  fullScreen = false,
  size = 'large',
  style,
}: LoadingSpinnerProps) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        style,
      ]}>
      <ActivityIndicator size={size} color={theme.text} />
      {message ? (
        <ThemedText type="small" style={styles.message}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    opacity: 0.7,
    textAlign: 'center',
  },
})
