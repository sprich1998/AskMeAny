const DEFAULT_VNC_BASE_URL = "http://localhost:6080";

export function getVncBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_VNC_BASE_URL?.trim();
  if (!configured) {
    return DEFAULT_VNC_BASE_URL;
  }
  return configured.replace(/\/$/, "");
}

export function getVncEmbedUrl(): string {
  const params = new URLSearchParams({
    autoconnect: "true",
    resize: "scale",
    reconnect: "true",
  });
  return `${getVncBaseUrl()}/vnc.html?${params.toString()}`;
}
