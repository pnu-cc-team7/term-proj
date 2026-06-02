import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    // 기본 Vite 템플릿에 있는 텍스트 중 하나를 확인 (프로젝트 초기 상태 가정)
    expect(screen.getByText(/Gourmet Social/i) || screen.getByText(/Vite/i)).toBeDefined()
  })
})
