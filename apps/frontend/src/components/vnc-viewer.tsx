"use client";

import { useEffect, useRef } from "react";

type VncViewerProps = {
  vncUrl: string;
};

export function VncViewer({ vncUrl }: VncViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rfb: { disconnect: () => void } | null = null;
    let cancelled = false;

    void import("@novnc/novnc").then((module) => {
      if (cancelled || !containerRef.current) {
        return;
      }

      const RFB = module.default as new (
        target: HTMLElement,
        url: string
      ) => { disconnect: () => void };

      rfb = new RFB(containerRef.current, vncUrl);
    });

    return () => {
      cancelled = true;
      rfb?.disconnect();
    };
  }, [vncUrl]);

  return <div ref={containerRef} className="h-full min-h-[400px] w-full bg-black" />;
}
