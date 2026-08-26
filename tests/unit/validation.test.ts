import { describe, it, expect } from 'vitest'
import { redeemSchema } from '../../src/lib/validation'
describe('redeemSchema double Email', () => {
  const valid = { email: 'zhilin.zhang@v2power.io', confirmedEmail: 'zhilin.zhang@v2power.io', token: 'V2P-TEST1234', consent: true }
  it('accepts valid double email', () => {
    expect(redeemSchema.safeParse(valid).success).toBe(true)
  })
  it('lowercases email', () => {
    const r = redeemSchema.safeParse({ ...valid, email: 'Zhilin.Zhang@V2POWER.IO', confirmedEmail: 'zhilin.zhang@v2power.io' })
    // email lowercased, but mismatch triggers refine -> should fail if only one lowercased?
    // Use both lowercased variants
    const r2 = redeemSchema.safeParse({ ...valid, email: 'Zhilin.Zhang@V2POWER.IO', confirmedEmail: 'ZHILIN.ZHANG@V2POWER.IO' })
    expect(r2.success && r2.data.email).toBe('zhilin.zhang@v2power.io')
  })
  it('rejects invalid email', () => {
    expect(redeemSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false)
  })
  it('rejects mismatched confirmedEmail', () => {
    expect(redeemSchema.safeParse({ ...valid, confirmedEmail: 'other@v2power.io' }).success).toBe(false)
  })
  it('rejects empty token', () => {
    expect(redeemSchema.safeParse({ ...valid, token: '' }).success).toBe(false)
  })
  it('normalizes token (keeps hyphen, strips whitespace)', () => {
    const r = redeemSchema.safeParse({ ...valid, token: ' v2p-test 1234 ' })
    expect(r.success && r.data.token).toBe('V2P-TEST1234')
  })
  it('requires consent', () => {
    expect(redeemSchema.safeParse({ ...valid, consent: false }).success).toBe(false)
  })
  it('allows missing captcha_token', () => {
    expect(redeemSchema.safeParse(valid).success).toBe(true)
  })
})