import { motion } from 'framer-motion'

export default function GlowButton({ children, onClick, disabled, className = '' }) {
  return (
    <motion.button
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
      className={`
        px-8 py-4 rounded-lg font-bold text-lg
        bg-gradient-to-r from-green-glow to-blue-accent
        text-space shadow-lg
        border border-green-glow/30
        hover:shadow-2xl transition-all duration-300
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)'
      }}
    >
      {children}
    </motion.button>
  )
}
