import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '@/assets/images/IMG-20230807-WA0009_(1).png'

    const timer = setTimeout(() =
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
          ex

    return () => clearTimeout(timer)
  }, [])

  return (
                durat
      {isLoading && (
              class
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary/90"
        >
                }}
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
              />
                src={logo}
                alt="S&S Messebau"
                className="h-32 w-auto md:h-40 object-contain drop-shadow-2xl"
            >
                  filter: [
            </motion.div>
                    'brightness(1.2)',
                    'brightness(1)'
                  ]
          >
                transition={{
                  duration: 2,
                  repeat: Infinity,
}
                }}

            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ 
                duration: 2,

                ease: "easeInOut"
































          >








