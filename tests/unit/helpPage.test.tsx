import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HelpPage from '../../src/pages/HelpPage'

describe('HelpPage', () => {
  it('renders FAQ sections in plain language and WhatsApp links', () => {
    render(<MemoryRouter><HelpPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Help' })).toBeInTheDocument()
    expect(screen.getByText(/received the email/)).toBeInTheDocument()
    expect(screen.getByText(/Code not working/)).toBeInTheDocument()
    expect(screen.getByText(/Entered the wrong email/)).toBeInTheDocument()
    expect(screen.getByText(/Can I use the same card twice/)).toBeInTheDocument()
    expect(screen.getByText(/2 years as required by UK GDPR/)).toBeInTheDocument()
    const waLinks = screen.getAllByText(/WhatsApp/)
    expect(waLinks.length).toBeGreaterThanOrEqual(1)
    expect(waLinks[0].closest('a')?.getAttribute('href')).toContain('wa.me')
  })
  it('has back to redeem link', () => {
    render(<MemoryRouter><HelpPage /></MemoryRouter>)
    expect(screen.getByText('Back to Redeem').closest('a')?.getAttribute('href')).toBe('/')
  })
})
