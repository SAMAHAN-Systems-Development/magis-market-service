## Magis Market Service

Backend service for **Magis Market**, a Facebook Marketplace–style app for Ateneo de Davao University students.  
No payments are handled by the backend — the focus is on **listings**, **images**, and **messaging** between students.

---

### Overview

- **Backend**: NestJS (TypeScript)
- **Database**: Supabase Postgres  
  - **Local dev**: Supabase CLI + Docker (local containers)  
  - **Production**: Hosted Supabase project (swap environment variables)
- **Storage**: Supabase Storage bucket `listing-images` for product photos
- **Messaging**: Conversation + message tables for buyer–seller chat

---

### Tech stack & dependencies

- **Runtime**
  - **Node.js**: `22.x` (Docker base image uses `node:22-alpine`)
- **Core**
  - **NestJS**: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
  - **TypeScript**: `typescript`
  - **RxJS**: `rxjs`
- **Configuration**
  - **`@nestjs/config`**: global config module reading from `.env`
- **Database & Storage**
  - **`@supabase/supabase-js`**: Supabase client for DB + Storage
  - **`supabase` (CLI)** (devDependency): manage local Supabase, migrations, and status
- **Tooling**
  - **Linting/Formatting**: `eslint`, `typescript-eslint`, `prettier`
  - **Testing**: `jest`, `ts-jest`, `@types/jest`, `supertest`

See `package.json` for the full list of dependencies and versions.

---

### Prerequisites

- **Node.js** `>= 22`
- **npm**
- **Docker Desktop** (for:
  - local Supabase containers managed by the Supabase CLI
  - optional Dockerized NestJS app)

---

### Environment configuration

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Start local Supabase (this will print your local keys):

```bash
npm run supabase:start
```

3. From the Supabase output, copy:

- **Project URL** → `SUPABASE_URL`
- **Publishable** key → `SUPABASE_ANON_KEY`
- **Secret** key → `SUPABASE_SERVICE_ROLE_KEY`

…into your `.env` file.

> **Note**: These keys are for **local dev only**. For production, replace them with values from your hosted Supabase project.

---

### Database & storage schema

The schema is managed via Supabase migrations in `supabase/migrations/`:

- **`20260208000000_initial_schema.sql`**
  - `profiles` – extends `auth.users` with full name, avatar, student ID, contact number
  - `listings` – marketplace listings (title, description, price, category, condition, status)
  - `listing_images` – image records pointing to Supabase Storage paths
  - `conversations` – buyer–seller conversations per listing
  - `messages` – chat messages within conversations
  - Row Level Security (RLS) policies for all tables
- **`20260208000001_storage_buckets.sql`**
  - Storage bucket `listing-images` with:
    - public read access for images
    - authenticated-only upload
    - owner-only update/delete

Migrations are applied automatically when you run `npm run supabase:start` or `npm run supabase:reset`.

---

### Running the backend (local, without Docker)

1. **Install dependencies**:

```bash
npm install
```

2. **Start local Supabase** (database + storage + auth):

```bash
npm run supabase:start
```

3. **Run the NestJS app in watch mode**:

```bash
npm run start:dev
```

4. The API will be available at:

```text
http://localhost:3000
```

The Supabase Studio will be available at the URL printed by `npm run supabase:start` (typically `http://127.0.0.1:54323`).

---

### Running with Docker

The project includes a multi-stage `Dockerfile` and `docker-compose.yml`.

#### Build the production image

```bash
npm run docker:build
```

#### Run the API in a container (production mode)

```bash
npm run docker:up
```

This:

- builds the `production` target from the `Dockerfile`
- runs the container exposing port `3000` (or `$PORT` from `.env`)

#### Run the API in a dev container (hot-reload)

```bash
npm run docker:up:dev
```

This uses the `api-dev` service with:

- your local source mounted into the container
- `npm run start:dev` as the command

#### Stop containers

```bash
npm run docker:down
```

---

### Supabase CLI commands

Convenience npm scripts:

- **`npm run supabase:start`** – start local Supabase stack (Postgres, Auth, Storage, Studio)
- **`npm run supabase:stop`** – stop local Supabase
- **`npm run supabase:reset`** – reset DB and re-apply migrations + seeds
- **`npm run supabase:status`** – show current URLs, keys, and container status
- **`npm run supabase:migration:new`** – create a new empty migration file

---

### Testing & linting

- **Unit tests**:

```bash
npm run test
```

- **E2E tests**:

```bash
npm run test:e2e
```

- **Coverage**:

```bash
npm run test:cov
```

- **Lint & format**:

```bash
npm run lint
npm run format
```

---

### Production notes

- For **production**, use a hosted Supabase project:
  - set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to the hosted values
  - do **not** run `npm run supabase:start` in production
- The same NestJS application can run either:
  - **directly on a server** (`npm run start:prod` after `npm run build`)
  - **inside Docker** using `npm run docker:build` + `npm run docker:up`

