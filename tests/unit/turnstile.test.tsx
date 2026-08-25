import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import Turnstile from '../../src/components/Turnstile'

describe('Turnstile', () => {
  it('renders dev bypass when VITE_CAPTCHA=none', () => {
    const onVerify = vi.fn()
    render(<Turnstile onVerify={onVerify} />)
    expect(screen.getByText(/Dev mode: human verification bypassed/)).toBeInTheDocument()
    expect(onVerify).toHaveBeenCalledWith('')
  })
  it('shows error when sitekey missing in real mode', async () => {
    vi.stubEnv('VITE_CAPTCHA', 'turnstile')
    vi.stubEnv('VITE_TURNSTILE_SITEKEY', '')
    const onVerify = vi.fn()
    render(<Turnstile onVerify={onVerify} />)
    expect(screen.getByText(/Turnstile failed to load/)).toBeInTheDocument()
    vi.unstubAllEnvs()
  })
  it('shows verifying then verified when sitekey present (mocked widget)', async () => {
    vi.stubEnv('VITE_CAPTCHA', 'turnstile')
    vi.stubEnv('VITE_TURNSTILE_SITEKEY', '1x00000000000000000000AA')
    const mockRender = vi.fn((el, opts) => {
      setTimeout(() => opts.callback('fake-token'), 0)
      return 'widget-1'
    })
    ;(window as unknown as { turnstile: unknown }).turnstile = { render: mockRender, reset: vi.fn() }
    const onVerify = vi.fn()
    render(<Turnstile onVerify={onVerify} />)
    expect(screen.getByText(/Verifying/)).toBeInTheDocument()
    await act(async () => { await new Promise(r => setTimeout(r, 20)) })
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(onVerify).toHaveBeenCalledWith('fake-token')
    delete (window as unknown as { turnstile: unknown }).turnstile
    vi.unstubAllEnvs()
  })
})
