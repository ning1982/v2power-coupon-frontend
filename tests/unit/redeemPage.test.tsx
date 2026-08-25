import React from "react"
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RedeemPage from '../../src/pages/RedeemPage'

function renderRedeem(initialUrl = '/') {
  window.history.pushState({}, '', initialUrl)
  return render(<MemoryRouter initialEntries={[initialUrl]}><RedeemPage /></MemoryRouter>)
}

const TOKEN_PH = 'e.g. V2P-KHWMYLOQ'
const EMAIL_PH = 'you@example.com'
const SUBMIT_LABEL = 'Send My Voucher'

describe('RedeemPage English', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })
  it('renders single email and paste hint', () => {
    renderRedeem('/')
    expect(screen.getByText("Enter your details")).toBeInTheDocument()
    expect(screen.getByText(/V2POWER.*CHARGING VOUCHER/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(EMAIL_PH)).toBeInTheDocument()
    expect(screen.queryByText(/Confirm Email/)).toBeNull()
    expect(screen.getAllByText(/Paste supported/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Dev mode: human verification bypassed/)).toBeInTheDocument()
  })
  it('prefills token from ?t= query', () => {
    renderRedeem('/?t=V2P-TEST1234')
    const tokenInput = screen.getByPlaceholderText(TOKEN_PH) as HTMLInputElement
    expect(tokenInput.value).toBe('V2P-TEST1234')
  })
  it('prefills token from ?token= query alias', () => {
    renderRedeem('/?token=V2P-ALIAS999')
    expect((screen.getByPlaceholderText(TOKEN_PH) as HTMLInputElement).value).toBe('V2P-ALIAS999')
  })
  it('shows validation error when submitting empty form', async () => {
    renderRedeem('/')
    fireEvent.click(screen.getByRole('button', { name: /Send My Voucher/ }))
    expect(await screen.findByText(/Please enter a valid email address/)).toBeInTheDocument()
  })
  it('requires GDPR consent', async () => {
    renderRedeem('/')
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(EMAIL_PH), 'zhilin.zhang@v2power.io')
    await user.type(screen.getByPlaceholderText(TOKEN_PH), 'V2PTEST1234')
    fireEvent.click(screen.getByRole('button', { name: /Send My Voucher/ }))
    expect(await screen.findByText(/Please agree to the Privacy Policy/)).toBeInTheDocument()
  })
  it('keeps raw token input value pre-submit (normalize on submit only)', async () => {
    renderRedeem('/')
    const tokenInput = screen.getByPlaceholderText(TOKEN_PH) as HTMLInputElement
    const user = userEvent.setup()
    await user.clear(tokenInput)
    await user.type(tokenInput, ' v2p-test 1234 ')
    expect(tokenInput.value).toBe(' v2p-test 1234 ')
  })
  it('submits and sends correct payload with confirmed_email', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: 0, data: { email_sent: true, email: 'z***g@v2power.io', message: 'ok' } })) 
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    renderRedeem('/')
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(EMAIL_PH), 'zhilin.zhang@v2power.io')
    await user.type(screen.getByPlaceholderText(TOKEN_PH), 'V2PTEST1234')
    await user.click(screen.getByLabelText(/I agree to the Privacy Policy/))
    await user.click(screen.getByRole('button', { name: /Send My Voucher/ }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)
    expect(body.email).toBe('zhilin.zhang@v2power.io')
    expect(body.confirmed_email).toBe('zhilin.zhang@v2power.io')
    expect(body.token).toBe('V2PTEST1234')
    expect(body.captcha_token).toBe('')
  })
  it('shows E102 already redeemed global error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: 102, msg: '该Token已被兑换' }))
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    renderRedeem('/')
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(EMAIL_PH), 'a@b.com')
    await user.type(screen.getByPlaceholderText(TOKEN_PH), 'V2PTEST1234')
    await user.click(screen.getByLabelText(/I agree to the Privacy Policy/))
    await user.click(screen.getByRole('button', { name: /Send My Voucher/ }))
    expect(await screen.findByText(/already been redeemed/)).toBeInTheDocument()
  })
  it('shows E101 invalid token error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ code: 101, msg: 'Token不存在' }))
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    renderRedeem('/')
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(EMAIL_PH), 'a@b.com')
    await user.type(screen.getByPlaceholderText(TOKEN_PH), 'BADBADBAD')
    await user.click(screen.getByLabelText(/I agree to the Privacy Policy/))
    await user.click(screen.getByRole('button', { name: /Send My Voucher/ }))
    expect(await screen.findByText(/Invalid Token/)).toBeInTheDocument()
  })
})
