import { describe, it, expect } from 'vitest'
import { redeemSchema } from '../../src/lib/validation'
describe('redeemSchema single Email', () => {
  const valid = { email: 'zhilin.zhang@v2power.io', token: 'V2PTEST1234', consent: true }
  it('accepts valid single email', () => {
    expect(redeemSchema.safeParse(valid).success).toBe(true)
  })
  it('lowercases email', () => {
    const r = redeemSchema.safeParse({ ...valid, email: 'Zhilin.Zhang@V2POWER.IO' })
    expect(r.success && r.data.email).toBe('zhilin.zhang@v2power.io')
  })
  it('rejects invalid email', () => {
    expect(redeemSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false)
  })
  it('rejects empty token', () => {
    expect(redeemSchema.safeParse({ ...valid, token: '' }).success).toBe(false)
  })
  it('normalizes token', () => {
    const r = redeemSchema.safeParse({ ...valid, token: ' v2p-test 1234 ' })
    expect(r.success && r.data.token).toBe('V2PTEST1234')
  })
  it('requires consent', () => {
    expect(redeemSchema.safeParse({ ...valid, consent: false }).success).toBe(false)
  })
  it('allows missing captcha_token', () => {
    expect(redeemSchema.safeParse(valid).success).toBe(true)
  })
})
