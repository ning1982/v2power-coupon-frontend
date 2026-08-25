import { describe, it, expect } from 'vitest'
import { mapApiError, maskEmail } from '../../src/lib/errorMap'
describe('mapApiError English', () => {
  it('E101 invalid token', () => expect(mapApiError('Token不存在').code).toBe('E101'))
  it('E102 redeemed', () => expect(mapApiError('该Token已被兑换').text).toContain('already been redeemed'))
  it('E004 verification', () => expect(mapApiError('人机验证失败').code).toBe('E004'))
  it('E500 mail failed', () => expect(mapApiError('邮件发送失败，请稍后重试').code).toBe('E500'))
  it('E201 rate limit', () => expect(mapApiError('频繁').code).toBe('E201'))
  it('E201 keyword 限流', () => expect(mapApiError('限流').code).toBe('E201'))
  it('fallback E500', () => expect(mapApiError('').code).toBe('E500'))
  it('fallback with message', () => expect(mapApiError('unknown boom').text).toContain('unknown boom'))
})
describe('maskEmail', () => {
  it('masks middle chars', () => expect(maskEmail('zhilin.zhang@v2power.io')).toBe('z***g@v2power.io'))
  it('short local', () => expect(maskEmail('ab@v2power.io')).toBe('a***@v2power.io'))
  it('single char', () => expect(maskEmail('a@v2power.io')).toBe('a***@v2power.io'))
  it('invalid email no domain', () => expect(maskEmail('bad')).toBe('bad'))
})
