import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { getCaptchaConfig } from '../../src/api/captcha'
import Turnstile from '../../src/components/Turnstile'

// 直接 mock captcha API，控制返回值，绕过 mock 分支和 fetch
vi.mock('../../src/api/captcha', () => ({
  getCaptchaConfig: vi.fn(),
  getCaptchaTestToken: vi.fn(),
}))
const mockedGet = getCaptchaConfig as unknown as ReturnType<typeof vi.fn>

describe('Turnstile', () => {
  it('renders dev bypass when captcha none', async () => {
    mockedGet.mockResolvedValue({ captcha_type: 'none', site_key: '', enabled: false })
    const onVerify = vi.fn()
    render(<Turnstile onVerify={onVerify} />)
    expect(await screen.findByText(/Dev mode: human verification bypassed/)).toBeInTheDocument()
    expect(onVerify).toHaveBeenCalledWith('')
  })
  it('bypasses when sitekey missing', async () => {
    mockedGet.mockResolvedValue({ captcha_type: 'turnstile', site_key: '', enabled: true })
    const onVerify = vi.fn()
    render(<Turnstile onVerify={onVerify} />)
    await act(async () => { await new Promise(r => setTimeout(r, 20)) })
    expect(onVerify).toHaveBeenCalledWith('')
  })
  it('renders widget and verifies when sitekey present', async () => {
    mockedGet.mockResolvedValue({ captcha_type: 'turnstile', site_key: '1x00000000000000000000AA', enabled: true })
    let fire: ((t: string) => void) | undefined
    const mockRender = vi.fn((_el, opts) => { fire = opts.callback; return 'widget-1' })
    ;(window as unknown as { turnstile: unknown }).turnstile = { render: mockRender, reset: vi.fn() }
    const onVerify = vi.fn()
    render(<Turnstile onVerify={onVerify} />)
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })
    expect(mockRender).toHaveBeenCalled()
    act(() => { fire?.('fake-token') })
    expect(onVerify).toHaveBeenCalledWith('fake-token')
    delete (window as unknown as { turnstile: unknown }).turnstile
  })
})
