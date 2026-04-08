import { exec } from "child_process"

/**
 * Execute a shell command and return stdout or throw on error.
 * @param command Shell command to run (e.g., "ls -la")
 * @param timeoutMs Optional timeout in milliseconds
 */
export function execCommand(command: string, timeoutMs: number = 30_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = exec(command, { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Command failed: ${stderr || error.message}`))
      }
      if (stderr && stderr.trim().length > 0) {
        console.warn(`Warning: ${stderr.trim()}`)
      }
      resolve(stdout.trim())
    })

    if (!proc) {
      return reject(new Error("Failed to start process"))
    }

    proc.on("exit", (code) => {
      if (code !== 0) {
        console.debug(`Process exited with code: ${code}`)
      }
    })

    proc.on("close", (code, signal) => {
      if (signal) {
        console.debug(`Process terminated with signal: ${signal}`)
      }
    })
  })
}

/**
 * Run multiple commands sequentially and return results as array.
 * @param commands Array of shell commands
 */
export async function execCommandsSequential(commands: string[], timeoutMs: number = 30_000): Promise<string[]> {
  const results: string[] = []
  for (const cmd of commands) {
    const output = await execCommand(cmd, timeoutMs)
    results.push(output)
  }
  return results
}

/**
 * Check if a specific binary exists on the system (e.g., "git", "node").
 * @param binary Binary name to check
 */
export async function checkBinaryExists(binary: string): Promise<boolean> {
  try {
    await execCommand(`which ${binary}`)
    return true
  } catch {
    return false
  }
}
