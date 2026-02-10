import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '@/assets/images/IMG-20230807-WA0009_(1).png'

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary/90"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.1, 1],
                opacity: [0, 1, 1]
              }}
              transition={{ 
                duration: 1.2,
                times: [0, 0.6, 1],
                ease: "easeOut"
              }}
              className="relative"
            >
              <motion.img
                src={logo}
                alt="S&S Messebau"
                className="h-32 w-auto md:h-40 object-contain drop-shadow-2xl"
                animate={{ 
                  filter: [
                    'brightness(1)',
                    'brightness(1.2)',
                    'brightness(1)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ 
                duration: 2,
                delay: 0.3,
                ease: "easeInOut"
              }}
              className="absolute -bottom-8 left-0 right-0 mx-auto h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  ease: "easeInOut"
                }}
                className="h-full w-1/2 bg-white rounded-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <p className="text-white/90 text-sm font-medium tracking-wider">
                Messestände, die verkaufen
              </p>
            </motion.div>
          </div>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
