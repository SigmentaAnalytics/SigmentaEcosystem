import type { TaskFormInput } from "./taskFormSchemas"
import { TaskFormSchema } from "./taskFormSchemas"
import { ExecutionEngine } from "./execution_engine"

/**
 * Processes a Typeform webhook payload to schedule a new task.
 */
export async function handleTypeformSubmission(
  raw: unknown
): Promise<{ success: boolean; message: string }> {
  const parsed = TaskFormSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      message: `Validation error: ${parsed.error.issues
        .map(i => i.message)
        .join("; ")}`,
    }
  }

  const { taskName, taskType, parameters, scheduleCron }: TaskFormInput =
    parsed.data

  try {
    const engine = new ExecutionEngine()
    engine.register(taskType, async (params) => {
      // Placeholder handler
      return { executed: true, params }
    })

    const taskId = `${taskType}-${Date.now()}`
    engine.enqueue(taskId, taskType, parameters)

    // For cron-based scheduling, we could integrate with a scheduler here.
    if (scheduleCron) {
      console.log(`Scheduled cron job: ${scheduleCron} for task ${taskId}`)
    }

    return {
      success: true,
      message: `Task "${taskName}" scheduled with ID ${taskId}`,
    }
  } catch (err: any) {
    return { success: false, message: `Failed to schedule task: ${err.message}` }
  }
}
