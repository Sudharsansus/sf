import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'isaii' })

export type GenerateRequested = {
  episodeId: string
  userId: string
  topic: string
  language: string
  duration: string
  credits: number
}

export type ProduceRequested = {
  episodeId: string
  userId: string
  selectedAngle: string
  durationLabel: string
  selectedSpeaker: string
  lockKey: string
  voiceA?: string
  voiceB?: string
  /** Produce the script as saved in the editor, without refining it. */
  useExistingScript?: boolean
}
