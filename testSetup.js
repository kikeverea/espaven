import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

/* jsdom ships no matchMedia, and the sidebar asks for it to tell mobile from desktop */
window.matchMedia = window.matchMedia || (query => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
}))

afterEach(() => {
  cleanup()
})