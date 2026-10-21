import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { upsertUserOnSignIn, type Database } from '@isaii/db'
import { createTestDb } from '@isaii/db/testing'
import { createShow, deleteShow, getShow, listShows, updateShow } from '../src'

let db: Database, close: () => Promise<void>
beforeAll(async () => ({ db, close } = await createTestDb()), 120_000)
afterAll(() => close())

describe('shows', () => {
  it('creates with a slug, scopes to owner, updates and deletes', async () => {
    const a = await upsertUserOnSignIn(db, { email: 'show@x.in' }, 0)
    const b = await upsertUserOnSignIn(db, { email: 'other@x.in' }, 0)
    const show = await createShow(db, a.id, { name: 'ಕಾಫಿ ಕಥೆಗಳು', language: 'kn', hosts: [{ id: 'A', name: 'Shreya', voiceId: 'v1', personality: '' }], style: {} })
    expect(show.rssSlug).toMatch(/^ಕಾಫಿ-ಕಥೆಗಳು-/)
    expect(await listShows(db, a.id)).toHaveLength(1)
    await expect(getShow(db, b.id, show.id)).rejects.toThrow('not found')
    expect((await updateShow(db, a.id, show.id, { name: 'Coffee Stories' })).name).toBe('Coffee Stories')
    await deleteShow(db, a.id, show.id)
    expect(await listShows(db, a.id)).toHaveLength(0)
  })
  it('validates input', async () => {
    const a = await upsertUserOnSignIn(db, { email: 'v@x.in' }, 0)
    await expect(createShow(db, a.id, { name: 'x', language: 'en', hosts: [], style: {} })).rejects.toThrow()
    await expect(createShow(db, a.id, { name: 'Good', language: 'zz', hosts: [{ id: 'A', name: 'A', voiceId: 'v', personality: '' }], style: {} })).rejects.toThrow()
  })
})
