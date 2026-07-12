# FundFlow AI

Production-oriented monorepo scaffold for FundFlow AI, an AI-powered fundraising operating system for founders, investors, and admins.

This repository intentionally contains architecture, configuration, dependency manifests, and placeholders only. Product feature code has not been implemented yet.

## Folder Structure

```text
.
├── apps/
│   ├── web/                  # Next.js 15 frontend
│   └── api/                  # FastAPI backend
├── packages/
│   ├── config/               # Shared runtime/config contracts
│   ├── types/                # Shared TypeScript types
│   └── eslint-config/        # Shared lint configuration
├── infra/
│   ├── docker/               # App Dockerfiles
│   ├── postgres/             # Database init/config assets
│   └── nginx/                # Optional reverse-proxy assets
├── scripts/                  # Local automation scripts
└── docs/                     # Architecture and setup notes
```

## File Structure

See [docs/architecture.md](C:/Users/adars/OneDrive/Documents/Fundflow%20AI/docs/architecture.md) for the complete intended structure and ownership boundaries.

## Dependency List

### Frontend

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui-compatible Radix primitives
- TanStack React Query
- Zustand
- Axios
- React Hook Form
- Zod
- Lucide React
- class-variance-authority
- clsx
- tailwind-merge

### Backend

- FastAPI
- Uvicorn
- PostgreSQL driver via psycopg
- SQLAlchemy
- Alembic
- Pydantic Settings
- python-jose for JWT
- passlib and bcrypt for password hashing
- Authlib and HTTPX for OAuth flows
- boto3 for S3-compatible object storage
- OpenAI SDK
- pytest and pytest-asyncio

## Installation Commands

```powershell
# Install frontend workspace dependencies
npm install

# Create backend virtual environment
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Return to repo root
cd ..\..
```

## Environment Variables

Copy the templates before running services:

```powershell
Copy-Item .env.example .env
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/api/.env.example apps/api/.env
```

Required values are documented in [docs/environment.md](C:/Users/adars/OneDrive/Documents/Fundflow%20AI/docs/environment.md).

## Docker Setup

```powershell
# Build and run local stack
docker compose up --build

# Run database migrations once backend migration files exist
docker compose exec api alembic upgrade head

# Stop services
docker compose down
```

Services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

