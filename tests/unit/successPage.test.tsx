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
  it('shows voucher sent with masked email and wait guidance', () => {
    renderWithState({ email: 'zhilin.zhang@v2power.io', masked: 'z***g@v2power.io' })
    expect(screen.getByText(/Voucher sent/)).toBeInTheDocument()
    expect(screen.getByText('z***g@v2power.io')).toBeInTheDocument()
    expect(screen.getByText(/Arrives in ~30 seconds/)).toBeInTheDocument()
    expect(screen.getByText('Open email app')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp support')).toBeInTheDocument()
  })
  it('masks email automatically if masked not provided', () => {
    renderWithState({ email: 'ab@v2power.io' })
    expect(screen.getByText('a***@v2power.io')).toBeInTheDocument()
  })
  it('shows privacy-safe fallback when no state (no URL leak)', () => {
    renderWithState(null)
    expect(screen.getByText(/Voucher session expired/)).toBeInTheDocument()
    expect(screen.getByText(/never stored in the page link/)).toBeInTheDocument()
    expect(screen.getByText(/Back to Redeem/)).toBeInTheDocument()
  })
  it('renders not-received tips', () => {
    renderWithState({ email: 'a@b.com' })
    expect(screen.getByText(/Check your spam folder/)).toBeInTheDocument()
  })
})
