import { lazyEnv } from './load'
import { apiSchema, webSchema, workerSchema } from './schemas'

export { loadEnv, lazyEnv, EnvError } from './load'
export * from './schemas'

export const webEnv = lazyEnv(webSchema)
export const workerEnv = lazyEnv(workerSchema)
export const apiEnv = lazyEnv(apiSchema)
