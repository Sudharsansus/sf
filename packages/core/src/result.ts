export type Ok<T> = { ok: true; value: T }
export type Err<E> = { ok: false; error: E }
export type Result<T, E = Error> = Ok<T> | Err<E>

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })

/** Run an async function and capture a thrown error as a Result. */
export async function tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    return ok(await fn())
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)))
  }
}

export function unwrap<T, E>(r: Result<T, E>): T {
  if (r.ok === true) return (r as Ok<T>).value
  const { error } = r as Err<E>
  throw error instanceof Error ? error : new Error(String(error))
}
