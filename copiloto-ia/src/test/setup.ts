import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Suppress framer-motion animation warnings in tests
vi.mock('framer-motion', () => {
  const React = require('react')
  const forwardRef = React.forwardRef

  const createMotionComponent = (tag: string) =>
    forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, ...props }: any, ref: any) =>
      React.createElement(tag, { ...props, ref }, children)
    )

  return {
    motion: {
      div: createMotionComponent('div'),
      button: createMotionComponent('button'),
      span: createMotionComponent('span'),
    },
    AnimatePresence: ({ children }: any) => children,
  }
})

// Suppress Next.js image optimization warnings
Object.defineProperty(global, 'Image', {
  writable: true,
  value: class MockImage {
    onload: (() => void) | null = null
    src = ''
  },
})
