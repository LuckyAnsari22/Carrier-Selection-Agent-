import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import * as mock from './mockData'

const API_BASE = '/api'
const USE_MOCKS = true // Fast toggle for prototype demo

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Carriers endpoint
export const getCarriers = () => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_CARRIERS })
  return client.get('/carriers')
}

// Score endpoint
export const scoreCarriers = (carriers, priorities, lane = 'Mumbai → Delhi') => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_RANKINGS })
  return client.post('/score', { carriers, priorities, lane })
}

// Stream ticket endpoint
export const createStreamTicket = (carriers, priorities, lane = 'Mumbai → Delhi') => {
  if (USE_MOCKS) return Promise.resolve({ data: { ticket_id: 'mock-ticket-123' } })
  return client.post('/score/ticket', { carriers, priorities, lane })
}

// Stream endpoint (SSE)
export const streamAnalysis = (ticketId) => {
  if (USE_MOCKS) return 'mock-stream-url'
  const isLocal = window.location.hostname === 'localhost'
  const base = isLocal ? 'http://localhost:8000/api' : '/api'
  return `${base}/score/stream?ticket_id=${ticketId}`
}

// Explain endpoint
export const explainScore = (carrierId) => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_EXPLANATION })
  return client.get(`/explain/${carrierId}`)
}

// Research endpoint
export const researchCarrier = (carrierId) => {
  if (USE_MOCKS) return Promise.resolve({ data: { summary: "Mock research for " + carrierId } })
  return client.get(`/research/${carrierId}`)
}

// Scenario Simulation
export const runSimulation = (data) => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_WHATIF })
  return client.post('/whatif/', data)
}

// Award Strategy
export const runAwardStrategy = (data) => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_AWARD_STRATEGY })
  return client.post('/award_strategy/', data)
}

// Financial Audit
export const runFinancialAudit = (data) => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_FINANCIAL_HEALTH })
  return client.post('/financial_health/', data)
}

// Executive Summary
export const runExecutiveSummary = (data) => {
  if (USE_MOCKS) return Promise.resolve({ data: { summary: mock.MOCK_SUMMARY } })
  return client.post('/summary/', data)
}

// QBR Scorecard
export const runQBR = (data) => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_QBR })
  return client.post('/qbr/', data)
}

// Bid Normalization
export const runNormalization = (data) => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_NORMALIZATION })
  return client.post('/normalize/', data)
}

// MLOps Feedback
export const runFeedbackAnalysis = () => {
  if (USE_MOCKS) return Promise.resolve({ data: mock.MOCK_FEEDBACK })
  return client.get('/feedback/analysis')
}

export const submitFeedback = (data) => {
  if (USE_MOCKS) return Promise.resolve({ data: { status: 'success' } })
  return client.post('/feedback/', data)
}

// Hooks for React Query
export const useCarrierScores = (carriers, priorities) => {
  return useQuery({
    queryKey: ['scores', carriers, priorities],
    queryFn: () => scoreCarriers(carriers, priorities),
  })
}

export const useCarrierExplanation = (carrierId) => {
  return useQuery({
    queryKey: ['explain', carrierId],
    queryFn: () => explainScore(carrierId),
    enabled: !!carrierId,
  })
}

export const useCarrierResearch = (carrierId) => {
  return useQuery({
    queryKey: ['research', carrierId],
    queryFn: () => researchCarrier(carrierId),
    enabled: !!carrierId,
  })
}

export default client
