import { Agent } from './types'

// Mock authentication functions - in production these would use Supabase Auth
export async function authenticateAgent(agentId: string, password: string): Promise<Agent | null> {
  // Mock authentication - in production this would validate against database
  if (agentId === 'AG-0001' && password === 'password123') {
    return {
      id: 'agent-001',
      user_id: 'user-001',
      agent_id: agentId,
      full_name: 'James Mwangi',
      station_code: 'KE-047-290-0001',
      tiktok_url: 'https://www.tiktok.com/@agent001',
      youtube_url: 'https://www.youtube.com/channel/agent001',
      platform_url: 'https://platform.example.com/agent001',
      status: 'active',
      phone: '+254712345678',
      email: 'james.mwangi@agent.com',
      verification_status: 'fully_verified',
      created_at: new Date().toISOString()
    }
  }
  return null
}

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  // Mock admin authentication
  return username === 'admin' && password === 'admin123'
}

export function getAgentFromToken(token: string): Agent | null {
  // Mock token validation - in production this would decode and validate JWT
  if (token === 'mock-agent-token') {
    return {
      id: 'agent-001',
      user_id: 'user-001',
      agent_id: 'AG-0001',
      full_name: 'James Mwangi',
      station_code: 'KE-047-290-0001',
      tiktok_url: 'https://www.tiktok.com/@agent001',
      youtube_url: 'https://www.youtube.com/channel/agent001',
      platform_url: 'https://platform.example.com/agent001',
      status: 'active',
      phone: '+254712345678',
      email: 'james.mwangi@agent.com',
      verification_status: 'fully_verified',
      created_at: new Date().toISOString()
    }
  }
  return null
}

export function validateAdminToken(token: string): boolean {
  // Mock admin token validation
  return token === 'mock-admin-token'
}

export function isAgentActive(agent: Agent): boolean {
  return agent.status === 'active'
}

export function isAgentVerified(agent: Agent): boolean {
  return agent.verification_status === 'fully_verified'
}
