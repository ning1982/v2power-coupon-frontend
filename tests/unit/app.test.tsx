import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/App'

describe('App routing', () => {
  it('renders redeem page at /', async () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(await screen.findByText("Enter your details")).toBeInTheDocument()
  })
  it('renders help page at /help', async () => {
    window.history.pushState({}, '', '/help')
    render(<App />)
    expect(await screen.findByText('Help & FAQ')).toBeInTheDocument()
  })
})
