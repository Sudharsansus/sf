import { defineConfig } from 'vitest/config'

/** Shared Vitest preset for React packages/apps (jsdom + Testing Library). */
export function reactConfig(overrides = {}) {
  return defineConfig({
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      coverage: { provider: 'v8', reporter: ['text', 'lcov'], include: ['src/**'] },
      ...overrides,
    },
  })
}
export default reactConfig()
