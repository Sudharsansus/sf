import { getServerSession } from 'next-auth'
import { AppError, ErrorCode } from '@isaii/core'
import { findUserByEmail, getDb, type User } from '@isaii/db'
import { authOptions } from './auth'

export const getSession = () => getServerSession(authOptions)

/** The signed-in user, freshly loaded (credits/plan are always current). */
export async function requireUser(): Promise<User> {
  const session = await getSession()
  const email = session?.user?.email
  if (!email) throw new AppError(ErrorCode.UNAUTHORIZED, 'Sign in to continue')
  const user = await findUserByEmail(getDb(), email)
  if (!user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Account not found')
  return user
}
