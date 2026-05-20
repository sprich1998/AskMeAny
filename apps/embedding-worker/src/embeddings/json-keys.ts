export function extractTopLevelKeys(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return extractTopLevelKeys(JSON.parse(value) as unknown);
    } catch {
      return null;
    }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value as Record<string, unknown>);
    return keys.length > 0 ? keys.join(", ") : null;
  }

  return null;
}
