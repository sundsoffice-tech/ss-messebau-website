import { useState, useEffect, useCallback } from 'react'

type SetterFn<T> = (prev: T) => T

// Shared prefix with local-storage-adapter
const KV_PREFIX = 'ss_kv_'

/**
 * React hook for persistent key-value storage backed by localStorage.
 * Used for client-side state persistence (e.g. form drafts, chat history).
 */
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | SetterFn<T>) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(`${KV_PREFIX}${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(`${KV_PREFIX}${key}`, JSON.stringify(storedValue))
    } catch {
      // localStorage might be full or unavailable
    }
  }, [key, storedValue])

  const setValue = useCallback((value: T | SetterFn<T>) => {
    setStoredValue((prev) => {
      const newValue = typeof value === 'function' ? (value as SetterFn<T>)(prev) : value
      return newValue
    })
  }, [])

  return [storedValue, setValue]
}
