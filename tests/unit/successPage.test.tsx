import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SuccessPage from '../../src/pages/SuccessPage'

function renderWithState(state: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/success', state } as never]}>
      <Routes><Route path="/success" element={<SuccessPage />} /></Routes>
    </MemoryRouter>
  )
}

describe('SuccessPage', () => {
  it('shows voucher sent with masked email from history.state', () => {
    renderWithState({ email: 'zhilin.zhang@v2power.io', masked: 'z***g@v2power.io' })
    expect(screen.getByText(/Voucher Sent!/)).toBeInTheDocument()
    expect(screen.getByText('z***g@v2power.io')).toBeInTheDocument()
    expect(screen.getByText(/Please redeem in App Wallet/)).toBeInTheDocument()
    expect(screen.getByText(/WhatsApp Support/)).toBeInTheDocument()
  })
  it('masks email automatically if masked not provided', () => {
    renderWithState({ email: 'ab@v2power.io' })
    expect(screen.getByText('a***@v2power.io')).toBeInTheDocument()
  })
  it('shows privacy-safe fallback when no state (no URL leak)', () => {
    renderWithState(null)
    expect(screen.getByText(/No email in session/)).toBeInTheDocument()
    expect(screen.getByText(/avoid URL privacy leak/)).toBeInTheDocument()
    expect(screen.getByText(/Go to Redeem/)).toBeInTheDocument()
  })
  it('renders not-received tips', () => {
    renderWithState({ email: 'a@b.com' })
    expect(screen.getByText(/Check your spam/)).toBeInTheDocument()
  })
})
