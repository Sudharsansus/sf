import type { KV } from '@isaii/cache'
import type { Database } from '@isaii/db'
import type { Sender } from '@isaii/queue'

/** Everything the episode domain needs from the outside world — injected, so tests use fakes. */
export type EpisodeDeps = {
  db: Database
  kv: KV
  /** Queue sender (Inngest in production, a spy in tests). */
  send?: Sender
  now?: () => Date
  /** Platform-wide daily AI spend cap. */
  dailyBudgetUsd?: number
}
