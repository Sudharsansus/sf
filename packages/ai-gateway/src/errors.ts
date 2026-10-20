import { AppError, ErrorCode } from '@isaii/core'

export class AIRefusalError extends AppError {
  constructor(task: string) { super(ErrorCode.UNPROCESSABLE, `The AI declined this ${task} request. Try rephrasing the topic.`) }
}
export class AIOutputError extends AppError {
  constructor(task: string, reason: string) { super(ErrorCode.UPSTREAM, `AI ${task} output was unusable: ${reason}`, { expose: false }) }
}
export class AIBudgetError extends AppError {
  constructor(message: string) { super(ErrorCode.UNAVAILABLE, message) }
}
