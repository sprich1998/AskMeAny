export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const apiUrl = getApiBaseUrl();
  const wsBase = apiUrl.replace(/^http/, "ws");
  return `${wsBase}/ws`;
}

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ data: T; status: number }> {
  const url = `${getApiBaseUrl()}${path}`;
  const hasBody = init?.body != null && init.body !== "";
  const headers = new Headers(init?.headers);

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    try {
      const body = (await response.json()) as { error?: string; code?: string };
      if (typeof body.error === "string") message = body.error;
      if (typeof body.code === "string") code = body.code;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(message, response.status, code);
  }

  const status = response.status;
  if (status === 204 || response.headers.get("content-length") === "0") {
    return { data: undefined as T, status };
  }

  const text = await response.text();
  if (!text) {
    return { data: undefined as T, status };
  }

  return { data: JSON.parse(text) as T, status };
}
