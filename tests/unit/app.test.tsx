import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/App'

describe('App routing', () => {
  it('renders redeem page at /coupon/', async () => {
    window.history.pushState({}, '', '/coupon/')
    render(<App />)
    expect(await screen.findByPlaceholderText('you@example.com')).toBeInTheDocument()
  })
  it('renders help page at /coupon/help', async () => {
    window.history.pushState({}, '', '/coupon/help')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Help' })).toBeInTheDocument()
  })
})
