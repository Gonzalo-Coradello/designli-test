import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import {
  type AlertButton,
  type AlertButtonStyle,
  useAlertModalStore,
} from '@/shared/alert/alert-modal.store'
import { MaxContentWidth, Radius, Spacing } from '@/shared/theme'
import { Button } from './button'

function getButtonVariant(style: AlertButtonStyle | undefined) {
  switch (style) {
    case 'cancel':
      return 'secondary' as const
    case 'destructive':
      return 'danger' as const
    default:
      return 'primary' as const
  }
}

interface AlertModalProps {
  visible: boolean
  title: string
  message?: string
  buttons: AlertButton[]
  onDismiss: () => void
  onPressButton: (index: number) => void
}

export function AlertModal({
  visible,
  title,
  message,
  buttons,
  onDismiss,
  onPressButton,
}: AlertModalProps) {
  const isSingleButton = buttons.length === 1

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      accessibilityViewIsModal
      onRequestClose={onDismiss}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
        style={styles.backdrop}
        onPress={onDismiss}>
        <Pressable style={styles.panelWrapper} onPress={() => {}}>
          <ThemedView type="backgroundElement" style={styles.panel}>
            <ThemedText type="heading">{title}</ThemedText>
            {message ? (
              <ThemedText type="small" themeColor="textSecondary">
                {message}
              </ThemedText>
            ) : null}
            <View
              style={[
                styles.actions,
                isSingleButton && styles.actionsSingle,
              ]}>
              {buttons.map((button, index) => (
                <Button
                  key={`${button.text}-${index}`}
                  label={button.text}
                  variant={getButtonVariant(button.style)}
                  onPress={() => onPressButton(index)}
                  style={isSingleButton ? styles.singleButton : styles.actionButton}
                />
              ))}
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export function AlertModalHost() {
  const { visible, title, message, buttons, hideAlert, pressButton } =
    useAlertModalStore()

  return (
    <AlertModal
      visible={visible}
      title={title}
      message={message}
      buttons={buttons}
      onDismiss={hideAlert}
      onPressButton={pressButton}
    />
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: Spacing.four,
  },
  panelWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  panel: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionsSingle: {
    flexDirection: 'column',
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: Spacing.two,
  },
  singleButton: {
    minHeight: 44,
    paddingVertical: Spacing.two,
  },
})
