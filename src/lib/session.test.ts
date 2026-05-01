import test from 'node:test'
import assert from 'node:assert/strict'
import { createMockSession, parseSession, serializeSession } from './session'

test('parseSession returns the original session when cookie value is valid', () => {
  const session = createMockSession({
    id: 'agent-001',
    email: 'agent@kuralive.ke',
    role: 'agent',
  })

  const parsed = parseSession(serializeSession(session))

  assert.deepEqual(parsed, session)
})

test('parseSession rejects expired sessions', () => {
  const raw = encodeURIComponent(JSON.stringify({
    user: {
      id: 'admin-001',
      email: 'admin@kuralive.ke',
      role: 'admin',
    },
    expires_at: Date.now() - 1,
  }))

  assert.equal(parseSession(raw), null)
})

test('parseSession rejects malformed cookies', () => {
  assert.equal(parseSession('%7Bnot-json'), null)
  assert.equal(parseSession(null), null)
})
