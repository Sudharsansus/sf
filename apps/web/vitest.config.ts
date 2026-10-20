import { reactConfig } from '@isaii/config/vitest/react'
import { fileURLToPath } from 'node:url'

export default reactConfig({
  alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
})
