import { zodResolver } from '@hookform/resolvers/zod'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/hooks/use-theme'
import { Button, Card, Input, ScreenHeader } from '@/shared/components'
import {
  WATCHLIST_SYMBOLS,
  type WatchlistSymbol,
} from '@/shared/constants/stocks'
import { Radius, Spacing } from '@/shared/theme'
import { useCreateAlert } from '../hooks/use-alerts'

const createAlertSchema = z.object({
  symbol: z.enum(WATCHLIST_SYMBOLS),
  targetPrice: z
    .string()
    .min(1, 'Target price is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: 'Enter a valid price greater than 0',
    }),
})

type CreateAlertFormValues = z.infer<typeof createAlertSchema>

function isWatchlistSymbol(symbol: string): symbol is WatchlistSymbol {
  return (WATCHLIST_SYMBOLS as readonly string[]).includes(symbol)
}

export default function CreateAlertScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { symbol: prefillSymbol } = useLocalSearchParams<{ symbol?: string }>()
  const createMutation = useCreateAlert()

  const defaultSymbol = prefillSymbol?.toUpperCase()
  const initialSymbol = defaultSymbol && isWatchlistSymbol(defaultSymbol)
    ? defaultSymbol
    : WATCHLIST_SYMBOLS[0]

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAlertFormValues>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      symbol: initialSymbol,
      targetPrice: '',
    },
  })

  const selectedSymbol = watch('symbol')

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(
      {
        symbol: values.symbol,
        targetPrice: Number(values.targetPrice),
      },
      {
        onSuccess: () => {
          router.back()
        },
      },
    )
  })

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <ScreenHeader
              title="Create Alert"
              subtitle="Get notified when the stock price goes above your target."
            />

            <Card style={styles.form}>
              <ThemedText type="smallBold">Symbol</ThemedText>
              <View style={styles.symbolGrid}>
                {WATCHLIST_SYMBOLS.map((symbol) => {
                  const isSelected = selectedSymbol === symbol
                  return (
                    <Pressable
                      key={symbol}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${symbol}`}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() =>
                        setValue('symbol', symbol, { shouldValidate: true })
                      }
                      style={[
                        styles.symbolChip,
                        {
                          borderColor: theme.backgroundSelected,
                          backgroundColor: isSelected
                            ? theme.text
                            : theme.backgroundElement,
                        },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={{
                          color: isSelected ? theme.background : theme.text,
                        }}>
                        {symbol}
                      </ThemedText>
                    </Pressable>
                  )
                })}
              </View>
              {errors.symbol ? (
                <ThemedText type="small" style={{ color: theme.danger }}>
                  {errors.symbol.message}
                </ThemedText>
              ) : null}

              <Controller
                control={control}
                name="targetPrice"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Target Price (USD)"
                    keyboardType="decimal-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="e.g. 200.00"
                    value={value}
                    error={errors.targetPrice?.message}
                  />
                )}
              />

              {createMutation.error ? (
                <ThemedText type="small" style={{ color: theme.danger }}>
                  Failed to create alert. Please try again.
                </ThemedText>
              ) : null}

              <Button
                label="Create Alert"
                loading={createMutation.isPending}
                disabled={createMutation.isPending}
                onPress={onSubmit}
                style={styles.button}
              />
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  form: {
    gap: Spacing.two,
  },
  symbolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  symbolChip: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 44,
    justifyContent: 'center',
  },
  button: {
    marginTop: Spacing.two,
  },
})
