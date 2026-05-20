type JsonViewerProps = {
  value: unknown;
  className?: string;
};

function highlightJson(json: string): React.ReactNode {
  const parts = json.split(
    /("(?:\\.|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g
  );
  return parts.map((part, i) => {
    if (!part) return null;
    if (/^"/.test(part)) {
      if (/:$/.test(part)) {
        return (
          <span key={i} className="text-sky-300">
            {part}
          </span>
        );
      }
      return (
        <span key={i} className="text-emerald-300">
          {part}
        </span>
      );
    }
    if (/true|false/.test(part)) {
      return (
        <span key={i} className="text-amber-300">
          {part}
        </span>
      );
    }
    if (/null/.test(part)) {
      return (
        <span key={i} className="text-muted-foreground">
          {part}
        </span>
      );
    }
    if (/^-?\d/.test(part)) {
      return (
        <span key={i} className="text-violet-300">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function JsonViewer({ value, className = "" }: JsonViewerProps) {
  if (value === null || value === undefined) {
    return (
      <pre className={`text-sm text-muted-foreground ${className}`}>null</pre>
    );
  }

  const json =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);

  return (
    <pre
      className={`overflow-auto rounded-md bg-muted/40 p-3 text-xs font-mono leading-relaxed ${className}`}
    >
      <code>{highlightJson(json)}</code>
    </pre>
  );
}
