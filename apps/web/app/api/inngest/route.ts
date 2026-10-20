import { serve } from 'inngest/next'
import { inngest } from '@isaii/queue'
import { episodeFunctions } from '@isaii/domain-episodes/functions'

// Each step runs in its own invocation. Heavy media work runs in apps/worker-media.
export const maxDuration = 300

export const { GET, POST, PUT } = serve({ client: inngest, functions: episodeFunctions })
