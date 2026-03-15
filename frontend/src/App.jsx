import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import BidNormalization from './pages/BidNormalization'
import WhatIfSimulator from './pages/WhatIfSimulator'
import ExecutiveSummary from './pages/ExecutiveSummary'
import FeedbackLoop from './pages/FeedbackLoop'
import FinancialHealth from './pages/FinancialHealth'
import AwardStrategy from './pages/AwardStrategy'
import QBRScorecard from './pages/QBRScorecard'
import RiskIntel from './pages/RiskIntel'
import Pipeline from './pages/Pipeline'
import Navbar from './components/shared/Navbar'

const queryClient = new QueryClient()


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="bg-space min-h-screen text-white font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/normalize" element={<BidNormalization />} />
            <Route path="/whatif" element={<WhatIfSimulator />} />
            <Route path="/summary" element={<ExecutiveSummary />} />
            <Route path="/feedback-loop" element={<FeedbackLoop />} />
            <Route path="/financial-health" element={<FinancialHealth />} />
            <Route path="/award-strategy" element={<AwardStrategy />} />
            <Route path="/qbr" element={<QBRScorecard />} />
            <Route path="/risk-research" element={<RiskIntel />} />
            <Route path="/pipeline" element={<Pipeline />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
