"use client";

import { getVncEmbedUrl } from "@/lib/vnc-config";

export function VncViewer() {
  return (
    <iframe
      title="Remote browser"
      src={getVncEmbedUrl()}
      className="h-full min-h-[400px] w-full border-0 bg-black"
      allow="clipboard-read; clipboard-write"
    />
  );
}
