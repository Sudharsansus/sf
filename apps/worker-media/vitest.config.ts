import { nodeConfig } from '@isaii/config/vitest/node'
// Inngest rejects unsigned requests outside dev mode — tests run as dev.
export default nodeConfig({ env: { INNGEST_DEV: '1' } })
