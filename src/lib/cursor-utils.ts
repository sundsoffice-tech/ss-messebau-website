/**
 * Utility functions for cursor effects
 */

/**
 * Checks if the current device is a mobile/touch device
 * @returns true if the device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia('(pointer: coarse)').matches
  )
}

/**
 * Checks if the user prefers reduced motion
 * @returns true if prefers-reduced-motion is enabled, false otherwise
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Checks if cursor effects should be disabled
 * @returns true if effects should be disabled, false otherwise
 */
export function shouldDisableCursorEffects(): boolean {
  return isMobileDevice() || prefersReducedMotion()
}
