export function tap(duration = 5): void {
  try {
    navigator.vibrate?.(duration);
  } catch {
    /* no haptics */
  }
}