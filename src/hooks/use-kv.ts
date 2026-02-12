import { useState, useEffect, useCallback } from 'react'

type SetterFn<T> = (prev: T) => T

// Shared prefix with spark-kv-adapter
const KV_PREFIX = 'spark_kv_'

/**
 * A localStorage-based replacement for @github/spark's useKV hook.
 * Provides persistent key-value storage with the same API signature.
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
