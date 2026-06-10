import { showAppAlert } from '../shared/alert/show-app-alert'
import { useAlertModalStore } from '../shared/alert/alert-modal.store'

const initialState = {
  visible: false,
  title: '',
  message: undefined as string | undefined,
  buttons: [{ text: 'OK', style: 'default' as const }],
}

describe('useAlertModalStore', () => {
  beforeEach(() => {
    useAlertModalStore.setState(initialState)
  })

  it('shows alert with title, message, and buttons', () => {
    useAlertModalStore.getState().showAlert({
      title: 'Delete Alert',
      message: 'Are you sure?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ],
    })

    const state = useAlertModalStore.getState()
    expect(state.visible).toBe(true)
    expect(state.title).toBe('Delete Alert')
    expect(state.message).toBe('Are you sure?')
    expect(state.buttons).toHaveLength(2)
  })

  it('defaults to one OK button when buttons are omitted', () => {
    showAppAlert('Price Alert', 'A stock alert was triggered')

    const state = useAlertModalStore.getState()
    expect(state.visible).toBe(true)
    expect(state.title).toBe('Price Alert')
    expect(state.message).toBe('A stock alert was triggered')
    expect(state.buttons).toEqual([{ text: 'OK', style: 'default' }])
  })

  it('hideAlert clears visible state', () => {
    showAppAlert('Sign Out', 'Are you sure?')
    useAlertModalStore.getState().hideAlert()

    expect(useAlertModalStore.getState().visible).toBe(false)
  })

  it('pressButton hides the modal before invoking the handler', () => {
    const onPress = jest.fn()
    let visibleWhenPressed = true

    useAlertModalStore.getState().showAlert({
      title: 'Sign Out',
      message: 'Are you sure?',
      buttons: [{ text: 'Sign Out', style: 'destructive', onPress }],
    })

    useAlertModalStore.getState().pressButton(0)

    visibleWhenPressed = useAlertModalStore.getState().visible
    expect(visibleWhenPressed).toBe(false)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('replaces an existing alert when a new one is shown', () => {
    showAppAlert('First', 'First message')
    showAppAlert('Second', 'Second message')

    const state = useAlertModalStore.getState()
    expect(state.visible).toBe(true)
    expect(state.title).toBe('Second')
    expect(state.message).toBe('Second message')
  })
})
