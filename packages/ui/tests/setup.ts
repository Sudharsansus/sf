import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

// jsdom lacks these browser APIs the landing sections use.
class IO { observe() {} unobserve() {} disconnect() {} takeRecords() { return [] } }
vi.stubGlobal('IntersectionObserver', IO)
Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) })
vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })))
