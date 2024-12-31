.PHONY: fmt lint dev-fe start-be build-fe init-service proto clean

FRONTEND = lean-state-search
BACKEND = state-search-be

fmt:
	(fd -e nix -X nixfmt {} \; -X alejandra -q {})
	(cd protos && buf format -w)
	(cd ${FRONTEND} && prettier . -w )
	(cd ${BACKEND} && ruff format .)

lint:
	(cd ${BACKEND} && ruff check .)
	(cd protos && buf lint)
	(cd ${FRONTEND} && pnpm lint)

dev-fe:
	(cd ${FRONTEND} && pnpm run dev)

start-be:
	(cd ${BACKEND} && poetry run main)

build-fe:
	(cd ${FRONTEND} && docker build -t ${FRONTEND}:latest .)

init-service:
	(cd scripts && docker compose up --wait)
	(./scripts/init-pg.sh)

proto:
	(cd protos && buf generate)
	(cd ${FRONTEND} && pnpm i && rm -rf lib/gen && pnpm exec buf generate ../protos/state_search/v1/state_search.proto)

clean:
	(cd scripts/ && docker-compose down && docker-compose rm -f)