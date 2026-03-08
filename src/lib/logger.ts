/**
 * Factory logger for the VV Realtor application.
 *
 * Creates scoped logger instances with consistent formatting
 * and environment-aware log levels.
 *
 * @example
 * ```ts
 * import { createLogger } from "@/lib/logger";
 *
 * const log = createLogger("auth");
 *
 * log.info("User signed in", { userId: "abc123" });
 * // → [INFO] [auth] User signed in { userId: "abc123" }
 *
 * log.error("Failed to create session", error);
 * // → [ERROR] [auth] Failed to create session Error: ...
 * ```
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return "warn";
  }
  return "debug";
}

function shouldLog(level: LogLevel): boolean {
  const minLevel = getMinLevel();
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

export interface Logger {
  /** Log debug-level messages. Silent in production. */
  debug: (message: string, ...args: unknown[]) => void;
  /** Log informational messages. Silent in production. */
  info: (message: string, ...args: unknown[]) => void;
  /** Log warnings. Always active. */
  warn: (message: string, ...args: unknown[]) => void;
  /** Log errors. Always active. */
  error: (message: string, ...args: unknown[]) => void;
}

/**
 * Creates a scoped logger instance for a given module.
 *
 * @param scope - A short identifier for the module (e.g., "api", "auth", "db")
 * @returns A Logger object with debug, info, warn, and error methods.
 *
 * Log level behavior by environment:
 * - **development / test**: All levels (debug, info, warn, error)
 * - **production**: Only warn and error
 */
export function createLogger(scope: string): Logger {
  const prefix = `[${scope}]`;

  return {
    debug(message: string, ...args: unknown[]) {
      if (shouldLog("debug")) {
        console.debug(`[DEBUG] ${prefix}`, message, ...args);
      }
    },
    info(message: string, ...args: unknown[]) {
      if (shouldLog("info")) {
        console.info(`[INFO] ${prefix}`, message, ...args);
      }
    },
    warn(message: string, ...args: unknown[]) {
      if (shouldLog("warn")) {
        console.warn(`[WARN] ${prefix}`, message, ...args);
      }
    },
    error(message: string, ...args: unknown[]) {
      if (shouldLog("error")) {
        console.error(`[ERROR] ${prefix}`, message, ...args);
      }
    },
  };
}
