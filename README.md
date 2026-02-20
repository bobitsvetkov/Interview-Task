# CSV Data Ingestion Pipeline - Take Home Assignment

Full-stack application for uploading, processing, and visualizing CSV sales data. Built with FastAPI, React, and PostgreSQL.

## Prerequisites

- **Docker & Docker Compose** — runs the database, backend, and frontend
- **Sample CSV** — use the included `sales_data_sample.csv` or any CSV with matching columns (ORDERNUMBER, SALES, ORDERDATE, STATUS, PRODUCTLINE, CUSTOMERNAME, COUNTRY, DEALSIZE, etc.)

## Setup

1. Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Generate a secure JWT secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

2. Start all services:

```bash
docker compose up --build
```

3. Access the app:

| Service  | URL                                    |
|----------|----------------------------------------|
| Frontend | http://localhost:3000                   |
| Backend  | http://localhost:8000                   |
| API Docs | http://localhost:8000/docs (Swagger UI) |

## Testing

Activate the backend virtual environment first, then run both frontend and backend tests:

```bash
# Linux / macOS
source backend/venv/bin/activate

# Windows
backend\venv\Scripts\activate
```

```bash
npm test
```

- **Frontend** — Vitest (component unit tests + API call mock)
- **Backend** — pytest (ETL unit tests + API integration tests, requires Docker to be running)

## API Endpoints

Authentication is cookie-based. All `/api` endpoints except register and login require a valid session.

### Auth

| Method | Path             | Description          |
|--------|------------------|----------------------|
| POST   | `/api/register`  | Register |
| POST   | `/api/login`     | Sign in              |
| POST   | `/api/logout`    | Sign out             |
| GET    | `/api/me`        | Current user info    |

### Datasets

| Method | Path                            | Description                                      |
|--------|---------------------------------|--------------------------------------------------|
| POST   | `/api/upload`                   | Upload a CSV file              |
| GET    | `/api/datasets`                 | List all datasets for the current user            |
| GET    | `/api/datasets/:id`             | Dataset detail with paginated records & aggregates|
| GET    | `/api/datasets/:id/status`      | Poll processing status                           |
| GET    | `/api/datasets/:id/export`      | Download dataset as CSV                          |

## Assumptions

- **No refresh token** — The brief mentioned JWT auth for `/api/register` and `/api/login` so users only see their own data. Since session refresh tokens were not specified, I used HTTP-only cookie-based sessions which provide the same user isolation with simpler client-side logic.
- **No file size or rate limit** — As it wasn't mentioned in the instructions I haven't implemented such security fixes, which would otherwise be a must.
- **No delete functionality** — As with the previous assumption I haven't implemented a delete functionality as I didn't see it on the instructions.
