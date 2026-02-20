# CSV Data Ingestion Pipeline - Take Home Assignment

Full-stack application for uploading, processing, and visualizing CSV sales data. Built with FastAPI, React, and PostgreSQL.

## Prerequisites

- **Docker Desktop** — runs the database, backend, and frontend containers
- **Python 3.12+** and **Node.js 22+** — needed for running test command
- **Sample CSV File** — use the included `sales_data_sample.csv` file located at the project root. You can upload it via the upload button once you are authenticated and get redirected to the dashboard page.

## Setup

1. Copy the example environment file and generate a JWT secret:

```bash
cp .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Paste the generated value into `.env` as `JWT_SECRET`.

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

Tests require Python, Node.js, and Docker to be running (for the PostgreSQL database).

1. Install dependencies:

```bash
# Backend
cd backend
python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

2. Run all tests:

```bash
npm test
```

- **Frontend** — Vitest (component unit tests + API call mocks)
- **Backend** — pytest (ETL unit tests + API integration tests)

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
