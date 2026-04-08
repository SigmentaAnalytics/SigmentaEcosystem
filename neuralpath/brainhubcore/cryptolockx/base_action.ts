import { z } from "zod"

/**
 * Base types for any flow action.
 */
export type ActionSchema = z.ZodObject<z.ZodRawShape>

export interface ActionResponse<T> {
  notice: string
  data?: T
  timestamp?: number
  success?: boolean
}

export interface BaseAction<
  S extends ActionSchema,
  R,
  Ctx = unknown
> {
  id: string
  summary: string
  description?: string
  input: S
  execute(args: { payload: z.infer<S>; context: Ctx }): Promise<ActionResponse<R>>
}

/**
 * Utility to create a standardized success response.
 */
export function createSuccessResponse<T>(data: T, notice: string = "Action executed successfully"): ActionResponse<T> {
  return {
    notice,
    data,
    timestamp: Date.now(),
    success: true,
  }
}

/**
 * Utility to create a standardized error response.
 */
export function createErrorResponse(notice: string): ActionResponse<null> {
  return {
    notice,
    data: null,
    timestamp: Date.now(),
    success: false,
  }
}
