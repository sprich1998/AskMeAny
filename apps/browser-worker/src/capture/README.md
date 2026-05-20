# `src/capture`

Capture engine (lives in browser-worker for V1).

- Assign action IDs and timestamps
- Correlate click/input → network within time window (e.g. 0–1500ms)
- DOM before/after diff
- Rule-based intent naming + confidence
- Persist via backend API or Postgres

**Example rule:** request within 1500ms of click + same frame initiator + DOM mutation after response ⇒ likely caused by that click.
