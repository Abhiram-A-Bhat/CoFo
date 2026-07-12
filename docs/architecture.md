# FundFlow AI Architecture

## Goals

- Keep frontend, backend, shared packages, and infrastructure concerns isolated.
- Make product domains easy to add without reshaping the repo.
- Keep configuration explicit and environment-driven.
- Support local Docker development and hosted deployment targets such as Vercel and Railway.

## Monorepo Layout

```text
apps/
├── web/
│   ├── src/
│   │   ├── app/              # Next.js App Router route groups
│   │   │   ├── (auth)/       # Authentication routes
│   │   │   └── (dashboard)/  # Authenticated product routes
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui generated components
│   │   │   └── layout/       # Shell, nav, page layout components
│   │   ├── features/         # Domain modules such as founders, investors, CRM
│   │   ├── hooks/            # Shared React hooks
│   │   ├── lib/
│   │   │   ├── api/          # API client and request helpers
│   │   │   ├── auth/         # Frontend auth helpers
│   │   │   ├── config/       # Browser-safe config access
│   │   │   ├── query/        # React Query client setup
│   │   │   └── utils/        # Shared frontend utilities
│   │   ├── store/            # Zustand stores
│   │   └── styles/           # Global styles and Tailwind entrypoints
│   ├── public/               # Static assets
│   └── components.json       # shadcn/ui configuration
└── api/
    ├── alembic/
    │   └── versions/         # Database migrations
    ├── app/
    │   ├── api/v1/           # Versioned HTTP routers
    │   ├── core/             # Settings, security, logging
    │   ├── db/               # Engine, session, base metadata
    │   ├── models/           # SQLAlchemy models
    │   ├── repositories/     # Persistence boundaries
    │   ├── schemas/          # Pydantic request/response schemas
    │   ├── services/         # Business logic and external integrations
    │   ├── websockets/       # Realtime channels
    │   └── workers/          # Background job entrypoints
    └── tests/
        ├── unit/
        └── integration/
```

## Suggested Domain Modules

Add these under `apps/web/src/features/` and mirrored backend modules as implementation begins:

- `auth`
- `founders`
- `investors`
- `startups`
- `fundability`
- `pitch-decks`
- `matching`
- `discovery`
- `crm`
- `conversations`
- `admin`

## Backend Layering

- `api`: HTTP and WebSocket protocol boundary.
- `schemas`: validation and serialization contracts.
- `services`: orchestration, business rules, AI calls, storage calls.
- `repositories`: database reads/writes.
- `models`: database persistence shape.
- `core`: cross-cutting infrastructure such as settings, auth, logging, and security.

## Frontend Layering

- `app`: route composition only.
- `features`: domain-specific screens, components, hooks, and API adapters.
- `components/ui`: shadcn/ui generated primitives.
- `components/layout`: reusable app chrome.
- `lib/api`: HTTP client, request typing, token attachment.
- `lib/query`: React Query provider and cache conventions.
- `store`: small global client state only.

## Deployment Shape

- Vercel deploys `apps/web`.
- Railway deploys `apps/api`.
- PostgreSQL is managed by Railway or another hosted Postgres provider.
- S3-compatible storage can be AWS S3, Cloudflare R2, MinIO, or another compatible provider.

