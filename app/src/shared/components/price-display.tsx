import { ThemedText } from '@/components/themed-text'
import { formatPrice } from '@/shared/utils/format-price'

interface PriceDisplayProps {
  price?: number | null
  showPlaceholder?: boolean
  type?: 'smallBold' | 'display'
}

export function PriceDisplay({
  price,
  showPlaceholder = false,
  type = 'smallBold',
}: PriceDisplayProps) {
  if (showPlaceholder || price == null) {
    return <ThemedText type={type}>—</ThemedText>
  }

  return <ThemedText type={type}>{formatPrice(price)}</ThemedText>
}
