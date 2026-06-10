import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'expo-router'
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
import { Button, Input } from '@/shared/components'
import { Spacing } from '@/shared/theme'
import { useRegisterMutation } from '../hooks/use-auth'

const registerSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterScreen() {
  const theme = useTheme()
  const registerMutation = useRegisterMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values)
  })

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={styles.title}>
              Create Account
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Register to start tracking stocks
            </ThemedText>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Email"
                    value={value}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Password"
                    secureTextEntry
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />

              {registerMutation.error ? (
                <ThemedText type="small" style={{ color: theme.danger }}>
                  Could not create account. Email may already be in use.
                </ThemedText>
              ) : null}

              <Button
                label="Create Account"
                loading={registerMutation.isPending}
                disabled={registerMutation.isPending}
                onPress={onSubmit}
                style={styles.button}
              />
            </View>

            <Link href="/(auth)/login" asChild>
              <Pressable accessibilityRole="link">
                <ThemedText type="linkPrimary" style={styles.link}>
                  Already have an account? Sign in
                </ThemedText>
              </Pressable>
            </Link>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  form: {
    gap: Spacing.two,
  },
  button: {
    marginTop: Spacing.two,
  },
  link: {
    textAlign: 'center',
    marginTop: Spacing.three,
  },
})
