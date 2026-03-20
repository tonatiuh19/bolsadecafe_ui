type LogLevel = "info" | "warn" | "error" | "debug";

const isDev = import.meta.env.DEV;

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (!isDev && level === "debug") return;

  const prefix = `[BDC:${level.toUpperCase()}]`;
  switch (level) {
    case "error":
      console.error(prefix, message, ...args);
      break;
    case "warn":
      console.warn(prefix, message, ...args);
      break;
    case "debug":
      console.debug(prefix, message, ...args);
      break;
    default:
      console.log(prefix, message, ...args);
  }
}

export const logger = {
  info: (message: string, ...args: unknown[]) => log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) =>
    log("error", message, ...args),
  debug: (message: string, ...args: unknown[]) =>
    log("debug", message, ...args),
};
