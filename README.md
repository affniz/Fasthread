# Fasthread

A Reddit-style social posting app: register/log in, create posts, upvote/downvote,
and comment. FastAPI + PostgreSQL + SQLAlchemy backend with a React (Vite) frontend.

```
.
├── app/            FastAPI backend (routers, models, schemas, auth)
├── alembic/        Database migrations
├── frontend/       React + Vite single-page app
├── render.yaml     Render Blueprint (Postgres + API + static frontend)
└── requirements.txt
```

## API overview

| Method | Path              | Auth | Description                              |
|--------|-------------------|------|------------------------------------------|
| POST   | `/users/`         | no   | Register (email + password)              |
| POST   | `/login`          | no   | Get a JWT (OAuth2 password form)         |
| GET    | `/users/{id}`     | yes  | Fetch a user                             |
| GET    | `/posts/`         | yes  | List posts (`limit`, `skip`, `search`)   |
| GET    | `/posts/{id}`     | yes  | Single post with votes + comments        |
| POST   | `/posts/`         | yes  | Create a post                            |
| PUT    | `/posts/{id}`     | yes  | Update own post                          |
| DELETE | `/posts/{id}`     | yes  | Delete own post                          |
| POST   | `/vote/upvote`    | yes  | Toggle an upvote (`{post_id}`)           |
| POST   | `/vote/downvote`  | yes  | Toggle a downvote (`{post_id}`)          |
| POST   | `/comment/`       | yes  | Add a comment (`{post_id, comment}`)     |
| PUT    | `/comment/{id}`   | yes  | Edit own comment                         |
| DELETE | `/comment/{id}`   | yes  | Delete own comment                       |

Interactive docs are available at `/docs` when the API is running.

---

## Run locally

You need **Python 3.11+**, **Node.js 18+**, and a **PostgreSQL** database.

### 1. Database

Create a database (adjust names/credentials to match your `.env`):

```bash
createdb fasthread
# or spin one up with Docker:
docker run --name fasthread-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fasthread -p 5432:5432 -d postgres
```

### 2. Backend

```bash
python -m venv venv
source venv/Scripts/activate      # Windows (Git Bash);  use venv/bin/activate on macOS/Linux
pip install -r requirements.txt

cp .env.example .env               # then edit values as needed
alembic upgrade head               # create the tables
uvicorn app.main:app --reload      # serves on http://localhost:8000
```

`.env` is required — see [.env.example](.env.example) for every variable. Generate a
`SECRET_KEY` with `python -c "import secrets; print(secrets.token_hex(32))"`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env               # VITE_API_URL defaults to http://localhost:8000
npm run dev                        # serves on http://localhost:5173
```

Open http://localhost:5173, register a user, and you're in. The dev origin
(`http://localhost:5173`) is already in the backend's default `CORS_ORIGINS`.

---

## Deploy to Render

The repo ships a [render.yaml](render.yaml) Blueprint that provisions Postgres, the
API, and the static frontend in one go.

1. Push this repo to GitHub.
2. In Render: **New +** → **Blueprint** → select the repo. Render reads `render.yaml`
   and creates `fasthread-db`, `fasthread-api`, and `fasthread-web`.
3. The API's database vars and `SECRET_KEY` are wired automatically. The two
   cross-service URLs are marked `sync: false`, so set them once the service URLs
   are known:
   - **`fasthread-web`** → `VITE_API_URL` = the API URL, e.g.
     `https://fasthread-api.onrender.com` (no trailing slash).
   - **`fasthread-api`** → `CORS_ORIGINS` = the frontend URL, e.g.
     `https://fasthread-web.onrender.com`.
4. Trigger a redeploy of `fasthread-web` after setting `VITE_API_URL` (Vite bakes it
   in at build time). Migrations run automatically on each API deploy via
   `alembic upgrade head`.

> Notes: `VITE_API_URL` is build-time, so changing it requires a frontend rebuild.
> The free Postgres plan expires after a period — upgrade the `plan` in `render.yaml`
> for anything long-lived.
