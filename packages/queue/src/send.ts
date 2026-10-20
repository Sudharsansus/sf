import { inngest } from './client'
import { EVENTS, type EventData, type EventName } from './events'

export type Sender = (e: { name: string; data: unknown }) => Promise<unknown>

/** Validate the payload against its contract, then enqueue. */
export async function sendEvent<N extends EventName>(name: N, data: EventData<N>, sender: Sender = e => inngest.send(e as never)) {
  const parsed = EVENTS[name].parse(data)
  return sender({ name, data: parsed })
}
