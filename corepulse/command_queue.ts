import { execCommand } from "./execCommand"

export interface ShellTask {
  id: string
  command: string
  description?: string
  retries?: number
}

export interface ShellResult {
  taskId: string
  output?: string
  error?: string
  executedAt: number
  durationMs?: number
  attempt: number
}

export class ShellTaskRunner {
  private tasks: ShellTask[] = []

  /**
   * Schedule a shell task for execution.
   */
  scheduleTask(task: ShellTask): void {
    this.tasks.push({ ...task, retries: task.retries ?? 0 })
  }

  /**
   * Execute all scheduled tasks in sequence.
   */
  async runAll(): Promise<ShellResult[]> {
    const results: ShellResult[] = []
    for (const task of this.tasks) {
      let attempt = 0
      let success = false
      let lastError: any = null
      const start = Date.now()

      while (attempt <= (task.retries ?? 0) && !success) {
        attempt++
        try {
          const output = await execCommand(task.command)
          const duration = Date.now() - start
          results.push({
            taskId: task.id,
            output,
            executedAt: start,
            durationMs: duration,
            attempt,
          })
          success = true
        } catch (err: any) {
          lastError = err
          if (attempt > (task.retries ?? 0)) {
            const duration = Date.now() - start
            results.push({
              taskId: task.id,
              error: lastError.message,
              executedAt: start,
              durationMs: duration,
              attempt,
            })
          }
        }
      }
    }
    this.tasks = []
    return results
  }

  /**
   * Get the number of scheduled tasks.
   */
  count(): number {
    return this.tasks.length
  }

  /**
   * Remove a task by its ID.
   */
  removeTask(id: string): void {
    this.tasks = this.tasks.filter(t => t.id !== id)
  }

  /**
   * Clear all tasks without executing them.
   */
  clear(): void {
    this.tasks = []
  }
}
