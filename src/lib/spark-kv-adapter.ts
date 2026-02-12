/**
 * localStorage-based adapter for window.spark.kv API
 * Provides the same interface as @github/spark's KV storage
 */

const KV_PREFIX = 'spark_kv_'

export const sparkKVAdapter = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(KV_PREFIX + key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  async set(key: string, value: any): Promise<void> {
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

// Create a global spark object that mimics the original API
if (typeof window !== 'undefined') {
  (window as any).spark = {
    kv: sparkKVAdapter,
    // Stub for LLM functionality - returns a helpful message
    llm: async (prompt: string) => {
      console.warn('window.spark.llm is not available in this environment')
      return 'Entschuldigung, die KI-Funktion ist derzeit nicht verfügbar. Bitte nutzen Sie das Kontaktformular oder rufen Sie uns direkt an.'
    },
    // Stub for user authentication - returns null
    user: async () => {
      console.warn('window.spark.user is not available in this environment')
      return null
    }
  }
}
