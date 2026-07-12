# Environment Variables

## Root `.env`

Used by Docker Compose for local orchestration.

```env
POSTGRES_DB=fundflow
POSTGRES_USER=fundflow
POSTGRES_PASSWORD=fundflow_dev_password
POSTGRES_PORT=5432
API_PORT=8000
WEB_PORT=3000
```

## Frontend `apps/web/.env.local`

```env
NEXT_PUBLIC_APP_NAME=FundFlow AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Only `NEXT_PUBLIC_*` values are available in the browser. Do not put secrets in frontend environment files.

## Backend `apps/api/.env`

```env
APP_NAME=FundFlow AI
APP_ENV=local
API_V1_PREFIX=/api/v1
BACKEND_CORS_ORIGINS=http://localhost:3000

DATABASE_URL=postgresql+psycopg://fundflow:fundflow_dev_password@localhost:5432/fundflow
ALEMBIC_DATABASE_URL=postgresql+psycopg://fundflow:fundflow_dev_password@localhost:5432/fundflow

JWT_SECRET_KEY=replace_with_a_32_plus_character_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAMESITE=lax

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

OPENAI_API_KEY=
OPENAI_MODEL=

S3_ENDPOINT_URL=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
```

Use strong secret values outside local development.
