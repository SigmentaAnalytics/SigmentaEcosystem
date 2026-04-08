/**
 * Simple task executor: registers and runs tasks by name.
 */
type Handler = (params: any) => Promise<any>

interface Task {
  id: string
  type: string
  params: any
  retries?: number
}

interface ExecutionResult {
  id: string
  result?: any
  error?: string
  attempts: number
  startedAt: number
  finishedAt: number
}

export class ExecutionEngine {
  private handlers: Record<string, Handler> = {}
  private queue: Task[] = []

  register(type: string, handler: Handler): void {
    if (this.handlers[type]) {
      throw new Error(`Handler for ${type} is already registered`)
    }
    this.handlers[type] = handler
  }

  unregister(type: string): void {
    delete this.handlers[type]
  }

  enqueue(id: string, type: string, params: any, retries: number = 0): void {
    if (!this.handlers[type]) throw new Error(`No handler for ${type}`)
    this.queue.push({ id, type, params, retries })
  }

  async runAll(): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = []
    while (this.queue.length) {
      const task = this.queue.shift()!
      let attempts = 0
      let success = false
      let lastError: string | undefined
      const start = Date.now()

      while (attempts <= (task.retries ?? 0) && !success) {
        attempts++
        try {
          const data = await this.handlers[task.type](task.params)
          results.push({
            id: task.id,
            result: data,
            attempts,
            startedAt: start,
            finishedAt: Date.now(),
          })
          success = true
        } catch (err: any) {
          lastError = err.message
          if (attempts > (task.retries ?? 0)) {
            results.push({
              id: task.id,
              error: lastError,
              attempts,
              startedAt: start,
              finishedAt: Date.now(),
            })
          }
        }
      }
    }
    return results
  }

  clear(): void {
    this.queue = []
  }

  getQueueSize(): number {
    return this.queue.length
  }
}
