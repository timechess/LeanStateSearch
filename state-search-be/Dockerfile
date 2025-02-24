FROM python:3.12.7-slim


RUN apt-get update && \
  apt-get install --no-install-suggests --no-install-recommends --yes pipx

ENV PATH="/root/.local/bin:${PATH}"
ENV MODEL_NAME_OR_PATH="/code/model/"

RUN pipx install poetry

RUN mkdir -p /code

WORKDIR /code

COPY . /code

RUN poetry install  --no-interaction --no-ansi

RUN poetry run prisma generate

CMD ["poetry", "run", "python", "main.py"]