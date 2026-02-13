/**
 * Enhanced interactive cursor effects for world-class user experience
 * 
 * Features:
 * - Custom cursor with dot and ring
 * - Animated particle trail
 * - Glow effect on interactive elements
 * - Magnetic pull effect (available via hook)
 * - Mix-blend-difference for visibility
 * - Respects accessibility preferences
 * - Mobile-aware (disabled on touch devices)
 * 
 * Components:
 * - CustomCursor: Main cursor with dot, ring, and trail
 * - CursorGlow: Subtle glow around interactive elements
 * 
 * Hooks:
 * - useMagneticCursor: Add magnetic pull to specific elements
 * 
 * Usage in App.tsx:
 * ```tsx
 * <CustomCursor isVisible={true} />
 * <CursorGlow />
 * ```
 * 
 * CSS in index.css:
 * - Hides default cursor on desktop with fine pointer
 * - Keeps text cursor for inputs
 * - Respects prefers-reduced-motion
 */

export {}
