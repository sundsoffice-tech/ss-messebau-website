import { it, expect } from 'vitest'

// Rotprobe für .github/workflows/pruefen.yml: Dieser PR wird nicht gemergt.
it('Rotprobe: absichtlich rot', () => {
  expect(1).toBe(2)
})
