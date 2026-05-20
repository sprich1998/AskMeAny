"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecentSessions } from "@/components/recent-sessions";
import type { InteractionSearchHit } from "@/lib/api-client";

const urlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Enter a valid URL (e.g. https://example.com)" }
    ),
});

export function SessionLauncher() {
  const router = useRouter();
  const [url, setUrl] = useState("https://");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InteractionSearchHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    const parsed = urlSchema.safeParse({ url: url.trim() });
    if (!parsed.success) {
      setFieldError(parsed.error.errors[0]?.message ?? "Invalid URL");
      return;
    }

    setLoading(true);
    try {
      const session = await apiClient.createSession(parsed.data.url);
      router.push(`/session/${session.id}`);
    } catch {
      setError("Failed to create session. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start-url">Start URL</Label>
          <Input
            id="start-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          {fieldError && (
            <p className="text-sm text-destructive">{fieldError}</p>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting session…
            </>
          ) : (
            "Start session"
          )}
        </Button>
      </form>
      <div className="space-y-3 rounded-lg border border-border p-4">
        <Label htmlFor="interaction-search">Search past interactions</Label>
        <div className="flex gap-2">
          <Input
            id="interaction-search"
            placeholder="e.g. search client by id"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={searchLoading || searchQuery.trim().length === 0}
            onClick={async () => {
              setSearchLoading(true);
              setSearchError(null);
              try {
                const results = await apiClient.searchInteractions(searchQuery.trim(), 5);
                setSearchResults(results);
              } catch {
                setSearchError("Search unavailable (is Ollama running?)");
                setSearchResults([]);
              } finally {
                setSearchLoading(false);
              }
            }}
          >
            {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
        {searchError && <p className="text-sm text-destructive">{searchError}</p>}
        {searchResults.length > 0 && (
          <ul className="space-y-2 text-sm">
            {searchResults.map((hit) => (
              <li key={hit.action_id} className="rounded border border-border px-3 py-2">
                <p className="font-medium">{hit.inferred_intent ?? hit.label ?? "interaction"}</p>
                <p className="text-xs text-muted-foreground">
                  {hit.request_method} {hit.request_url} · score {hit.score.toFixed(3)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <RecentSessions />
    </div>
  );
}
