/* ─── Cross-platform confirm ───────────────────────────────────────────────
 *
 * `Alert.alert` does not exist on React Native Web. It is not merely styled
 * differently — the buttons array is ignored and the callback never fires, so
 * any action gated behind a confirmation dialog silently does nothing there.
 *
 * That is how "sign out" ended up dead on the web app and the PWA: the button
 * was wired correctly, the dialog just never appeared and `onPress` was never
 * called. Anything destructive must go through here instead.
 * ------------------------------------------------------------------------ */

import { Alert, Platform } from 'react-native';

export interface ConfirmOptions {
  title: string;
  message?: string;
  /** Label for the confirming action. */
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export function confirm({
  title,
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    // window.confirm is synchronous and blocking, but it is the only dialog
    // guaranteed to exist in every browser, and this path runs rarely.
    const ok =
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm(message ? `${title}\n\n${message}` : title)
        : true;
    return Promise.resolve(ok);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}

/** Informational message, same platform split. */
export function notify(title: string, message = ''): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    return;
  }
  Alert.alert(title, message);
}
