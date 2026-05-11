import test from 'node:test'
import assert from 'node:assert/strict'
import { canRoleAccessPath, getDefaultRouteForRole, resolveAuthorizedRoute } from './access'

test('default route matches role workspace', () => {
  assert.equal(getDefaultRouteForRole('agent'), '/agent')
  assert.equal(getDefaultRouteForRole('admin'), '/admin')
})

test('agent cannot access admin workspaces except the shared command centre', () => {
  assert.equal(canRoleAccessPath('agent', '/admin'), false)
  assert.equal(canRoleAccessPath('agent', '/dashboard'), true)
  assert.equal(canRoleAccessPath('agent', '/agent-registration'), false)
})

test('admin cannot access agent workspace', () => {
  assert.equal(canRoleAccessPath('admin', '/agent'), false)
})

test('shared routes stay accessible to both roles', () => {
  assert.equal(canRoleAccessPath('agent', '/results'), true)
  assert.equal(canRoleAccessPath('admin', '/map-view'), true)
})

test('requested route is sanitized by role', () => {
  assert.equal(resolveAuthorizedRoute('agent', '/dashboard'), '/dashboard')
  assert.equal(resolveAuthorizedRoute('admin', '/agent'), '/admin')
  assert.equal(resolveAuthorizedRoute('admin', '/dashboard'), '/dashboard')
})
