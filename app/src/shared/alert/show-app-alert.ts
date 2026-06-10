import {
  type AlertButton,
  useAlertModalStore,
} from './alert-modal.store'

export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
) {
  useAlertModalStore.getState().showAlert({ title, message, buttons })
}
