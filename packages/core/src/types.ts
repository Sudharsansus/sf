export type Brand<T, B extends string> = T & { readonly __brand: B }
export type Paginated<T> = { data: T[]; page: number; limit: number; hasMore: boolean }
export type Awaitable<T> = T | Promise<T>
