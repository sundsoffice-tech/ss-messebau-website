/**
 * S&S Messebau – localStorage-based key-value adapter.
 * Provides a simple async KV interface backed by localStorage
 * for Hostinger-compatible static hosting (no server-side KV needed).
 */

const KV_PREFIX = 'ss_kv_'

export const kvAdapter = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(KV_PREFIX + key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    try {
      localStorage.setItem(KV_PREFIX + key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to set KV value:', error)
      throw error
    }
  },

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(KV_PREFIX + key)
    } catch (error) {
      console.error('Failed to delete KV value:', error)
      throw error
    }
  },

  async keys(): Promise<string[]> {
    try {
      const allKeys = Object.keys(localStorage)
      return allKeys
        .filter(key => key.startsWith(KV_PREFIX))
        .map(key => key.slice(KV_PREFIX.length))
    } catch {
      return []
    }
  }
}
