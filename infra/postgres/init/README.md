# Postgres init

Scripts run on **first container start** when mounted to `/docker-entrypoint-initdb.d/`.

Use for extensions (`uuid-ossp`, `pgcrypto`) and default roles — keep schema in [`migrations/`](../migrations/).
