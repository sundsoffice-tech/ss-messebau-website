import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '@/assets/images/IMG-20230807-WA0009_(1).png'

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Use requestIdleCallback for non-blocking dismissal
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => setIsLoading(false), { timeout: 200 })
    } else {
      const timer = setTimeout(() => setIsLoading(false), 150)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary/90"
          style={{ contain: 'layout style paint' }}
        >
          <div className="flex flex-col items-center gap-8">
            <img
              src={logo}
              alt="S&S Messebau"
              width="160"
              height="160"
              className="h-32 w-auto md:h-40 object-contain drop-shadow-2xl"
            />
            <div className="h-1 bg-white/30 rounded-full overflow-hidden max-w-xs w-full">
              <div className="h-full w-1/3 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
