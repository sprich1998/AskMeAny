# Packages

Shared libraries consumed by `apps/*`. Not deployed as their own containers.

| Package | Purpose |
|---------|---------|
| [`shared/`](shared/) | TypeScript types, Zod schemas, constants |

Import from apps via workspace package name (e.g. `@teachmeany/shared`) once `package.json` workspaces are configured.
