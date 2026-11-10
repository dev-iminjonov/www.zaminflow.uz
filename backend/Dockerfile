FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY app ./app
RUN pip install --no-cache-dir .

COPY . .

ENV PYTHONPATH=/app
EXPOSE 8080

CMD ["python", "-m", "app.bootstrap"]
