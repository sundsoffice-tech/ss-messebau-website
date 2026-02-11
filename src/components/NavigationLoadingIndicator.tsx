import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROGRESS_INCREMENT_MAX = 30
const PROGRESS_COMPLETE_THRESHOLD = 90
const PROGRESS_INTERVAL_MS = 200
const NAVIGATION_COMPLETE_DELAY_MS = 600
const FADE_OUT_DELAY_MS = 400

/**
 * Navigation loading indicator - shows during page transitions
 */
export function NavigationLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let progressInterval: NodeJS.Timeout
    let resetTimeout: NodeJS.Timeout

    const handleHashChange = () => {
      setIsLoading(true)
      setProgress(0)

      // Simulate progress
      let currentProgress = 0
      progressInterval = setInterval(() => {
        currentProgress += Math.random() * PROGRESS_INCREMENT_MAX
        if (currentProgress > PROGRESS_COMPLETE_THRESHOLD) {
          clearInterval(progressInterval)
          currentProgress = PROGRESS_COMPLETE_THRESHOLD
        }
        setProgress(currentProgress)
      }, PROGRESS_INTERVAL_MS)

      // Complete after navigation
      resetTimeout = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setIsLoading(false)
          setProgress(0)
        }, FADE_OUT_DELAY_MS)
      }, NAVIGATION_COMPLETE_DELAY_MS)
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      clearInterval(progressInterval)
      clearTimeout(resetTimeout)
    }
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-[100] origin-left"
          style={{ transformOrigin: '0 50%' }}
        />
      )}
    </AnimatePresence>
  )
}
