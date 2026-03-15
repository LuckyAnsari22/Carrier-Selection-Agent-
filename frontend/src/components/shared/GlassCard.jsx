import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', glow = false, glowColor = '#00FF88', ...props }) {
  return (
    <motion.div
      {...props}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl border border-white/8 bg-navy/80 backdrop-blur-xl
        ${glow ? 'shadow-lg' : ''}
        ${className}
      `}
      style={glow ? { boxShadow: `0 0 20px ${glowColor}22, 0 0 40px ${glowColor}11` } : {}}
    >
      {children}
    </motion.div>
  )
}
