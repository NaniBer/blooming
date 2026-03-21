import { render } from '@testing-library/react'

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Clear localStorage before each test
export const clearLocalStorage = () => {
  localStorageMock.clear()
}

// Helper to render with authentication context
export function renderWithAuth(ui: React.ReactElement) {
  return render(ui)
}
