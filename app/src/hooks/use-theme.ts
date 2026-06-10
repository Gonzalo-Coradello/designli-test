import { Colors, type ThemePalette } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export function useTheme(): ThemePalette {
  const scheme = useColorScheme()
  const theme = scheme === 'unspecified' ? 'light' : scheme

  return {
    ...Colors[theme],
    isDark: theme === 'dark',
  }
}
