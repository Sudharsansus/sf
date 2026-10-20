import type { EventData } from '@isaii/queue'

export { inngest } from '@isaii/queue'
export type GenerateRequested = EventData<'episode/generate.requested'>
export type ProduceRequested = EventData<'episode/produce.requested'>
