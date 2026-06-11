export type LogLevel = "info" | "warn" | "error";

export interface LogPayload {
  service: string;
  type: string;
  requestId?: string | null;
  [key: string]: unknown;
}

const writeLog = (level: LogLevel, payload: LogPayload): void => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      ...payload,
    }),
  );
};

export const logInfo = (payload: LogPayload): void => writeLog("info", payload);
export const logWarn = (payload: LogPayload): void => writeLog("warn", payload);
export const logError = (payload: LogPayload): void => writeLog("error", payload);

export const logEvent = (
  service: string,
  level: LogLevel,
  type: string,
  requestId: string | null,
  extra?: Record<string, unknown>,
): void => {
  writeLog(level, {
    service,
    type,
    requestId,
    ...(extra ?? {}),
  });
};
