import { create } from 'zustand'

export type AlertButtonStyle = 'default' | 'cancel' | 'destructive'

export type AlertButton = {
  text: string
  style?: AlertButtonStyle
  onPress?: () => void | Promise<void>
}

export type AlertOptions = {
  title: string
  message?: string
  buttons?: AlertButton[]
}

const DEFAULT_BUTTONS: AlertButton[] = [{ text: 'OK', style: 'default' }]

interface AlertModalState {
  visible: boolean
  title: string
  message?: string
  buttons: AlertButton[]
  showAlert: (options: AlertOptions) => void
  hideAlert: () => void
  pressButton: (index: number) => void
}

const initialState = {
  visible: false,
  title: '',
  message: undefined as string | undefined,
  buttons: DEFAULT_BUTTONS,
}

export const useAlertModalStore = create<AlertModalState>((set, get) => ({
  ...initialState,

  showAlert: ({ title, message, buttons }) => {
    set({
      visible: true,
      title,
      message,
      buttons: buttons?.length ? buttons : DEFAULT_BUTTONS,
    })
  },

  hideAlert: () => {
    set({ visible: false })
  },

  pressButton: (index) => {
    const button = get().buttons[index]
    get().hideAlert()
    void button?.onPress?.()
  },
}))
