#!/usr/bin/env bash
set -eu -o pipefail

docker exec -i -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
  state-search-db \
    psql -U postgres -h 127.0.0.1 < ./scripts/init-pg.sql

