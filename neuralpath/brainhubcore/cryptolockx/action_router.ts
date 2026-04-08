import type { BaseAction, ActionResponse } from "./base_action_types"
import { z } from "zod"

interface AgentContext {
  apiEndpoint: string
  apiKey: string
  network?: string
  timeoutMs?: number
}

/**
 * Core Agent: routes calls to registered actions.
 */
export class Agent {
  private actions = new Map<string, BaseAction<any, any, AgentContext>>()

  register<S, R>(action: BaseAction<S, R, AgentContext>): void {
    if (this.actions.has(action.id)) {
      throw new Error(`Action with id "${action.id}" is already registered`)
    }
    this.actions.set(action.id, action)
  }

  unregister(actionId: string): void {
    this.actions.delete(actionId)
  }

  listActionIds(): string[] {
    return Array.from(this.actions.keys())
  }

  async invoke<R>(
    actionId: string,
    payload: unknown,
    ctx: AgentContext
  ): Promise<ActionResponse<R>> {
    const action = this.actions.get(actionId)
    if (!action) {
      throw new Error(`Unknown action "${actionId}"`)
    }

    const parsed = action.input.safeParse(payload)
    if (!parsed.success) {
      return {
        notice: "Invalid payload",
        data: undefined,
        timestamp: Date.now(),
        success: false,
      }
    }

    return action.execute({ payload: parsed.data, context: ctx }) as Promise<ActionResponse<R>>
  }
}
