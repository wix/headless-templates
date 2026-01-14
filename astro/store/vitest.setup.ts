import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

const originalWarn = console.warn
const originalError = console.error


const UNWANTED_WARNINGS = [
  'Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`',
]

console.warn = (...args) => {
  if (typeof args[0] === 'string' && UNWANTED_WARNINGS.some(warning => args[0].includes(warning))) {
    return
  }
  originalWarn.call(console, ...args)
}

console.error = (...args) => {
  if (typeof args[0] === 'string' && UNWANTED_WARNINGS.some(warning => args[0].includes(warning))) {
    return
  }
  originalError.call(console, ...args)
}
configure({ 
  testIdAttribute: 'data-testid',
})

// Make React's act available globally for testing-library
global.IS_REACT_ACT_ENVIRONMENT = true