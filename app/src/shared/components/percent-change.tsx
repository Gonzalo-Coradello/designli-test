import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/hooks/use-theme'

interface PercentChangeProps {
  value: number
  type?: 'small' | 'smallBold'
}

export function PercentChange({ value, type = 'small' }: PercentChangeProps) {
  const theme = useTheme()
  const isPositive = value >= 0

  return (
    <ThemedText
      type={type}
      style={{ color: isPositive ? theme.priceUp : theme.priceDown }}>
      {isPositive ? '+' : ''}
      {value.toFixed(2)}%
    </ThemedText>
  )
}
