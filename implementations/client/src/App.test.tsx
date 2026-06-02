import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    // 개선된 UI 구조에 맞춰 유연한 매칭 사용 (Gourmet · Social 또는 Pick Your Plate 확인)
    expect(screen.getByText(/Pick Your Plate/i)).toBeDefined()
    expect(screen.getByText(/Gourmet/i)).toBeDefined()
  })
})
