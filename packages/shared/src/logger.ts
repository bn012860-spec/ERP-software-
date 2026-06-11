export type LogLevel = "info" | "warn" | "error";

export const logEvent = (
  service: string,
  level: LogLevel,
  type: string,
  requestId: string | null,
  extra?: Record<string, unknown>,
): void => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service,
      level,
      type,
      requestId,
      ...extra,
    }),
  );
};
