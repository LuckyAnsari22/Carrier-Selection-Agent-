import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

const API_BASE = '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Carriers endpoint
export const getCarriers = () => client.get('/carriers')

// Score endpoint
export const scoreCarriers = (carriers, priorities, lane = 'Mumbai → Delhi') =>
  client.post('/score', { carriers, priorities, lane })

// Stream ticket endpoint (to avoid 431 errors with large JSON in GET)
export const createStreamTicket = (carriers, priorities, lane = 'Mumbai → Delhi') =>
  client.post('/score/ticket', { carriers, priorities, lane })

// Stream endpoint (SSE) - Bypassing proxy for localhost helps on SSE stability
export const streamAnalysis = (ticketId) => {
  const isLocal = window.location.hostname === 'localhost'
  const base = isLocal ? 'http://localhost:8000/api' : '/api'
  return `${base}/score/stream?ticket_id=${ticketId}`
}

// Explain endpoint
export const explainScore = (carrierId) =>
  client.get(`/explain/${carrierId}`)

// Research endpoint
export const researchCarrier = (carrierId) =>
  client.get(`/research/${carrierId}`)

// Feedback endpoint
export const submitFeedback = (data) =>
  client.post('/feedback', data)

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
