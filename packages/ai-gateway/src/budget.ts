import type { KV } from '@isaii/cache'
import { keys } from '@isaii/cache'

/** Daily platform-wide spend cap and per-user hourly cap, tracked in Redis. */
export class SpendGuard {
  constructor(private kv: KV, private opts: { dailyLimitUsd: number; now?: () => Date }) {}

  private day() { return (this.opts.now?.() ?? new Date()).toISOString().slice(0, 10) }
  private hour() { return Math.floor((this.opts.now?.() ?? new Date()).getTime() / 3_600_000) }

  async globalOk(): Promise<boolean> {
    return Number((await this.kv.get(keys.globalCost(this.day()))) ?? 0) < this.opts.dailyLimitUsd
  }
  async userOk(userId: string, hourlyLimitUsd: number): Promise<boolean> {
    return Number((await this.kv.get(keys.userHourCost(userId, this.hour()))) ?? 0) < hourlyLimitUsd
  }
  async track(costUsd: number, userId?: string) {
    const g = keys.globalCost(this.day())
    await this.kv.incrbyfloat(g, costUsd)
    await this.kv.expire(g, 2 * 86_400)
    if (userId) {
      const u = keys.userHourCost(userId, this.hour())
      await this.kv.incrbyfloat(u, costUsd)
      await this.kv.expire(u, 7_200)
    }
  }
}
