import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose: () => void
  isVisible: boolean
}

export default function Toast({ type, message, onClose, isVisible }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-kura-green" />,
    error: <XCircle className="w-5 h-5 text-kura-accent2" />,
    warning: <AlertCircle className="w-5 h-5 text-kura-amber" />,
    info: <Info className="w-5 h-5 text-kura-accent" />
  }

  const bgColors = {
    success: 'bg-kura-green/10 border-kura-green/50',
    error: 'bg-kura-accent2/10 border-kura-accent2/50',
    warning: 'bg-kura-amber/10 border-kura-amber/50',
    info: 'bg-kura-accent/10 border-kura-accent/50'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border ${bgColors[type]} bg-kura-surface shadow-lg max-w-md`}
        >
          <div className="flex items-center flex-1">
            {icons[type]}
            <span className="ml-3 text-white">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
