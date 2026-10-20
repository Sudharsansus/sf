import { defineConfig } from 'vitest/config'

/** Shared Vitest preset for Node packages. Coverage gates: see README. */
export function nodeConfig(overrides = {}) {
  return defineConfig({
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
      passWithNoTests: false,
      coverage: { provider: 'v8', reporter: ['text', 'lcov'], include: ['src/**'], thresholds: { lines: 70, functions: 70, branches: 60 } },
      ...overrides,
    },
  })
}
export default nodeConfig()
