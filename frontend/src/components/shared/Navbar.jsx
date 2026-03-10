import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { path: '/', label: 'Portal', icon: '🏠' },
  { path: '/dashboard', label: 'Monitor', icon: '📊' },
  { path: '/normalize', label: 'Bids', icon: '📋' },
  { path: '/whatif', label: 'Simulate', icon: '🧪' },
  { path: '/summary', label: 'Briefing', icon: '📑' },
  { path: '/feedback-loop', label: 'MLOps', icon: '📈' },
  { path: '/financial-health', label: 'Audit', icon: '🏦' },
  { path: '/award-strategy', label: 'Portfolio', icon: '💎' },
  { path: '/qbr', label: 'QBR', icon: '🗓️' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl"
    >
      <div className="glass-card bg-black/40 backdrop-blur-2xl border-white/5 px-8 py-3 flex items-center justify-between shadow-2xl">

        {/* Brand Group */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative w-10 h-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-glow/50 via-blue-accent/50 to-purple-500/50 blur-md opacity-40 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-white">
              C
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter leading-none">CARRIER<span className="text-green-glow">IQ</span></span>
            <span className="font-mono text-[8px] text-white/30 tracking-[0.3em] uppercase mt-1">Intelligence v3</span>
          </div>
        </Link>

        {/* Navigation Map */}
        <div className="hidden lg:flex items-center gap-2 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  relative px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all duration-300
                  ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-xl z-0"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="opacity-50 text-xs">{link.icon}</span>
                  {link.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-6">
          <div className="w-px h-6 bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Global Status</span>
            <span className="text-[10px] font-bold text-green-glow animate-pulse">● SECURE</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-green-glow transition-colors"
          >
            Terminal
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}
