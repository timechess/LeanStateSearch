FROM python:3.12.7-slim


# RUN apt-get update && \
#   apt-get install --no-install-suggests --no-install-recommends --yes pipx

ENV PATH="/root/.local/bin:${PATH}"
ENV MODEL_NAME_OR_PATH="/code/model/"

# RUN pipx install poetry
RUN pip install uv

RUN mkdir -p /code

WORKDIR /code

COPY pyproject.toml /code
COPY uv.lock /code

RUN uv sync --no-install-project

COPY . /code

RUN uv run prisma generate

ENV MODE="docker"
ENV BACKEND_PORT="7720"

CMD ["uv", "run", "python", "main.py"]