import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { normalizeToken, redeem } from '../../src/api/coupon'

describe('normalizeToken', () => {
  it('uppercases and strips', () => expect(normalizeToken(' v2p-test-1234 ')).toBe('V2PTEST1234'))
  it('removes non-alphanum', () => expect(normalizeToken('V2P-TEST_1234!')).toBe('V2PTEST1234'))
  it('truncates 64', () => expect(normalizeToken('a'.repeat(100)).length).toBe(64))
  it('handles empty', () => expect(normalizeToken('')).toBe(''))
  it('handles mixed separators', () => expect(normalizeToken('V2P_ TEST-1234')).toBe('V2PTEST1234'))
})

describe('redeem API', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })
  it('posts to /api/coupon/redeem with correct payload', async () => {
    const json = { code: 0, data: { email_sent: true, email: 'a@b.com', message: 'ok' } }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(json)) } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    const payload = { email: 'a@b.com', confirmed_email: 'a@b.com', token: 'V2PTEST1234', captcha_token: '' }
    const p = redeem(payload)
    vi.runAllTimers()
    const res = await p
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/coupon/redeem')
    expect((opts as RequestInit).method).toBe('POST')
    expect(JSON.parse((opts as RequestInit).body as string)).toEqual(payload)
    expect(res.code).toBe(0)
  })
  it('returns error code from backend', async () => {
    const json = { code: 400, msg: 'Token不存在' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(json)) } as unknown as Response))
    const res = await redeem({ email: 'x@y.com', confirmed_email: 'x@y.com', token: 'BAD', captcha_token: '' })
    expect(res.msg).toContain('Token')
  })
  it('clears timeout on success', async () => {
    const json = { code: 0, data: { email_sent: true, email: 'a@b.com', message: 'ok' } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(json)) } as unknown as Response))
    const clearSpy = vi.spyOn(global, 'clearTimeout')
    await redeem({ email: 'a@b.com', confirmed_email: 'a@b.com', token: 'V2PTEST1234' })
    expect(clearSpy).toHaveBeenCalled()
  })
})
