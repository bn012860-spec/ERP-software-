import { Request, Response } from "express";

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

class ProxyRequestError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export const forwardRequest = async (
  req: Request,
  res: Response,
  targetBaseUrl: string,
  pathPrefixToStrip: string,
): Promise<void> => {
  const targetPath = req.originalUrl.replace(pathPrefixToStrip, "") || "/";
  const url = new URL(targetPath, targetBaseUrl);

  const outboundHeaders = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (!hopByHopHeaders.has(key.toLowerCase()) && typeof value === "string") {
      outboundHeaders.set(key, value);
    }
  });

  if (req.user) {
    outboundHeaders.set("x-user-id", req.user.userId);
    outboundHeaders.set("x-user-role", req.user.role);
  }

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => abortController.abort(), 5000);

  let upstreamResponse: globalThis.Response;

  try {
    upstreamResponse = await fetch(url, {
      method,
      headers: outboundHeaders,
      body: hasBody ? JSON.stringify(req.body) : undefined,
      signal: abortController.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new ProxyRequestError("Upstream service timeout", 504);
    }

    throw new ProxyRequestError("Failed to reach upstream service", 502);
  } finally {
    clearTimeout(timeoutHandle);
  }

  res.status(upstreamResponse.status);

  upstreamResponse.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });

  const bodyText = await upstreamResponse.text();
  res.send(bodyText);
};

export const normalizeGatewayError = (err: unknown, res: Response): Response => {
  const status =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
      ? (err as { status: number }).status
      : 500;

  const message =
    err instanceof Error && err.message.length > 0
      ? err.message
      : "Internal server error";

  return res.status(status).json({ error: message });
};
