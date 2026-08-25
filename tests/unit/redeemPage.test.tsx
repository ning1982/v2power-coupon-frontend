import React from "react"
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RedeemPage from '../../src/pages/RedeemPage'

function renderRedeem(initialUrl = '/') {
  return render(<MemoryRouter initialEntries={[initialUrl]}><RedeemPage /></MemoryRouter>)
}

const EMAIL_PH = 'you@example.com'
const TOKEN_PH = 'e.g. V2P-KHWMYLOQ'

describe('RedeemPage English', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders email field, CTA and trust microcopy', async () => {
    renderRedeem('/')
    expect(screen.getByPlaceholderText(EMAIL_PH)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send my voucher/ })).toBeInTheDocument()
    expect(await screen.findByText(/No marketing spam/)).toBeInTheDocument()
  })

  it('shows token chip (read-only) when ?t= provided', () => {
    renderRedeem('/?t=V2P-TEST1234')
    expect(screen.getByText('V2P-TEST1234')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(TOKEN_PH)).toBeNull()
  })

  it('shows token input when no token in URL', () => {
    renderRedeem('/')
    expect(screen.getByPlaceholderText(TOKEN_PH)).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    renderRedeem('/')
    fireEvent.click(screen.getByRole('button', { name: /Send my voucher/ }))
    expect(await screen.findByText(/Please enter a valid email address/)).toBeInTheDocument()
  })

  it('requires GDPR consent', async () => {
    renderRedeem('/?t=V2P-KHWMYLOQ')
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(EMAIL_PH), 'zhilin.zhang@v2power.io')
    fireEvent.click(screen.getByRole('button', { name: /Send my voucher/ }))
    expect(await screen.findByText(/Please tick the box/)).toBeInTheDocument()
  })

  it('submits and sends correct payload with confirmed_email', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: 0, data: { email_sent: true, email: 'z***g@v2power.io', message: 'ok' } }))
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    renderRedeem('/?t=V2P-KHWMYLOQ')
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(EMAIL_PH), 'zhilin.zhang@v2power.io')
    await user.click(screen.getByLabelText(/I agree to the Privacy Policy/))
    await user.click(screen.getByRole('button', { name: /Send my voucher/ }))
    // .env 关闭 VITE_MOCK 后，captcha/config 也会走 fetch，因此断言"redeem 被调用过一次"
    // 而非"fetch 总共只调一次"
    await waitFor(() => {
      const redeemCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/coupon/redeem'))
      expect(redeemCalls).toHaveLength(1)
    })
    const redeemCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('/coupon/redeem'))!
    const body = JSON.parse((redeemCall[1] as RequestInit).body as string)
    expect(body.email).toBe('zhilin.zhang@v2power.io')
    expect(body.confirmed_email).toBe('zhilin.zhang@v2power.io')
    expect(body.token).toBe('V2P-KHWMYLOQ')
    expect(body.captcha_token).toBe('')
  })

  it('shows already redeemed error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: 102, msg: '该Token已被兑换' }))
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    renderRedeem('/?t=V2P-KHWMYLOQ')
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(EMAIL_PH), 'a@b.com')
    await user.click(screen.getByLabelText(/I agree to the Privacy Policy/))
    await user.click(screen.getByRole('button', { name: /Send my voucher/ }))
    expect(await screen.findByText(/already been redeemed/)).toBeInTheDocument()
  })

  it('shows invalid token error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: 101, msg: 'Token不存在' }))
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    renderRedeem('/?t=BADBADBAD')
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(EMAIL_PH), 'a@b.com')
    await user.click(screen.getByLabelText(/I agree to the Privacy Policy/))
    await user.click(screen.getByRole('button', { name: /Send my voucher/ }))
    expect(await screen.findByText(/Invalid Token/)).toBeInTheDocument()
  })
})
