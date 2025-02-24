#!/usr/bin/env bash
set -eu -o pipefail

docker exec -i -e POSTGRES_PASSWORD=vgASaJGlnZ6uZ9VNAJtat0CSczn2v0NAKHDYPrOtZWaD5XFbos8cc72cTj6s \
  state-search-db \
    psql -U postgres -h 127.0.0.1 < ./scripts/init-pg.sql

