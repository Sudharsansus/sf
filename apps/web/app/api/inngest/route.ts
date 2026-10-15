import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { functions } from '@/lib/inngest/functions'

// Each Inngest step runs in its own invocation of this route.
export const maxDuration = 300

export const { GET, POST, PUT } = serve({ client: inngest, functions })
