# Infrastructure

Data layer and persistence config — not application code.

| Path | Purpose |
|------|---------|
| [`postgres/`](postgres/) | SQL migrations and init scripts |
| [`volumes/`](volumes/) | Notes for local Docker named volumes |

Infra services run as containers via [`docker/standalone/`](../docker/standalone/) or [`docker/compose/stack/`](../docker/compose/stack/).
