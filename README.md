# Group Member
Natalie Lee
Amanda Hsu
Willis Erdman
Thao Nguyen
Alfred Chen
Yucheng Jing

# Lifescape

Lifescape turns small real-world activities into daily quests. Users complete quests, earn XP and coins, level up, and (in later phases) build a home and collect items. A recommendation system on the backend will suggest the next quest for each user.

Built as a CSDS 395 senior project.

## Status

| Area | State |
| --- | --- |
| Accounts (sign up, login, demo login, profile, stats) | Done on the backend and connected to the frontend |
| Quests (list, add, edit, delete, complete) | Working in the frontend on mock data. The backend endpoints are not finished, so the frontend is not connected to them yet |
| Recommendations | Backend pipeline with a trained XGBoost model, plus a simulator for testing. Not connected to the frontend yet |
| World and Inventory pages | Placeholders with sample data |

The frontend can run in two modes (see [Mock mode and real mode](#mock-mode-and-real-mode)).

## Tech stack

- **Frontend:** Vue 3, Vuetify 3, vue-router, Vite
- **Backend:** FastAPI, SQLAlchemy 2, Alembic, PostgreSQL
- **Auth:** JWT tokens (PyJWT), PBKDF2-SHA256 password hashing
- **Recommender:** XGBoost, scikit-learn

## Repository layout

```text
Senior-Project/
|-- FRONTEND/            Vue app (views, components, API layer)
|   |-- src/api/         index.js picks mock.js or real.js; client.js is the fetch wrapper
|   |-- src/views/       Login, Signup, Home, Quests, World, Inventory, Profile
|   `-- src/components/  Quest dialogs, quest scene, page heading
|-- backend/             FastAPI service
|   |-- app/api/         Routes (auth, users, quests, rewards, events, recommendations)
|   |-- app/services/    Business logic used by the routes
|   |-- app/models/      SQLAlchemy models
|   |-- app/recommender/ Features, policy, training, simulator
|   |-- alembic/         Database migrations
|   |-- scripts/         seed_demo.py
|   `-- tests/
`-- start.ps1            Starts the backend and frontend on Windows
```

More detail: [`backend/README.md`](backend/README.md) (architecture), [`backend/ERD.md`](backend/ERD.md) (database), [`backend/app/recommender/README.md`](backend/app/recommender/README.md) (recommendation flow), [`FRONTEND/UI-GUIDE.md`](FRONTEND/UI-GUIDE.md).

## Getting started

### Requirements

- Node.js and npm
- Python 3.9 or newer
- PostgreSQL, running locally

### 1. Backend

From `backend/`:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -e ".[test,ml]"
copy .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your PostgreSQL database, using the `postgresql+psycopg://` scheme, for example:

```text
DATABASE_URL=postgresql+psycopg://lifescape:lifescape@localhost:5432/lifescape
```

Then create the tables and the demo account:

```powershell
.venv\Scripts\alembic upgrade head
.venv\Scripts\python scripts\seed_demo.py
.venv\Scripts\uvicorn app.main:app --reload
```

On macOS or Linux, use `.venv/bin/...` instead of `.venv\Scripts\...`.

The API runs at `http://localhost:8000`. Interactive docs are at `http://localhost:8000/docs`, and a health check is at `http://localhost:8000/health`.

### 2. Frontend

From `FRONTEND/`:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Start both at once (Windows)

From the project root:

```powershell
./start.ps1
```

This opens the backend and frontend in two windows, applies migrations, and opens the site. It does not run `seed_demo.py`, so run that once yourself.

## Mock mode and real mode

The frontend talks to its data through one small API layer in `FRONTEND/src/api/`. A single setting chooses the data source, in `FRONTEND/.env.development`:

```text
VITE_USE_MOCK=true    # data is stored in the browser, no backend needed
VITE_USE_MOCK=false   # pages call the FastAPI backend
```

Vite only reads this file when it starts, so restart `npm run dev` after changing it.

- **Mock mode** is a complete demo of the app without a server. Accounts and quests live in the browser's `localStorage`.
- **Real mode** uses the backend for sign up, login, demo login, profile and stats. The quest screens are not connected yet, so Home shows no quests and Quests does not work in this mode.

Switching modes does not carry accounts across, because mock accounts are in the browser and real accounts are in PostgreSQL. If login behaves oddly after a switch, clear the browser's stored data with `localStorage.clear()` in the DevTools console and refresh.

## Demo account

After running `seed_demo.py`:

- Email: `demo@lifescape.app`
- Password: `lifescape`

The Login page's "Continue with Demo Account" button uses it. This account is for testing and will be removed later.

## Backend overview

Routes live under `/api`. The main groups:

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/demo` return `{ token, tokenType, user }`
- `GET` and `PATCH /api/users/me`, `GET /api/users/me/stats` need `Authorization: Bearer <token>`
- Quest, reward, event and recommendation routes (see `/docs` for the full list)

Responses use camelCase field names (`firstName`, `lastName`) to match the frontend. Unknown email and wrong password return the same error message so login cannot be used to find which emails have accounts.

To try the auth flow in Swagger: open `/docs`, call `POST /api/auth/register`, copy the returned token (without quotes), click **Authorize**, paste it, and call `GET /api/users/me`.

## Recommendation system

The backend recommends one quest at a time, aiming for a quest the user will complete within 24 hours. A trained XGBoost model scores the available quests. Most of the time the best-scoring quest is picked, and about one time in five a quest is picked at random so the system keeps exploring. If no trained model exists yet, it falls back to a random pick. Every suggestion is saved, including ones that are ignored, because skipped suggestions are also useful training data.

Because there is little real-user data so far, a simulator generates users in three personas (student, outdoor, balanced) with different preferences and active hours. A run is reproducible from its seed. Example, from `backend/` in PowerShell:

```powershell
$env:PYTHONUTF8 = "1"
$run = "$env:TEMP\lifescape-demo"
New-Item -ItemType Directory -Force $run | Out-Null

.venv\Scripts\python -m app.recommender.simulator --output "$run\history.db" --start-date 2026-09-01 --days 30 --users-per-persona 10 --seed 42

$env:DATABASE_URL = "sqlite:///$($run -replace '\\','/')/history.db"
.venv\Scripts\python -m app.recommender.train --validation-start 2026-09-22T00:00:00 --as-of 2026-10-02T00:00:00 --output "$run\model"
```

See `backend/app/recommender/README.md` for the request flow and details.

## Tests

From `backend/`:

```powershell
$env:PYTHONUTF8 = "1"
.venv\Scripts\python -m pytest tests -q -p no:warnings
```

On Windows, set `PYTHONUTF8` first. Without it, one simulator test can fail if the project path contains non-English characters.

## Database migrations

Schema changes are versioned with Alembic in `backend/alembic/versions/`. Apply them with `alembic upgrade head`. A model change should come with a new numbered migration and an update to `backend/ERD.md`.

## Roadmap

- Finish the quest endpoints (create, update, delete, complete) and match the frontend data shapes
- Switch the frontend fully to the real backend
- Wire recommendations into the app so it can suggest a quest
- Collect real-user data to evaluate the recommendation model
- Build out World (home building and decorating) and Inventory (pets, clothing, badges)

## Troubleshooting

- **`localhost:8000/docs` will not load:** the backend is not running or crashed on startup. Check its window. Common causes are PostgreSQL not running, a wrong `DATABASE_URL`, or missing packages (reinstall with `pip install -e ".[test,ml]"`).
- **Login or sign up does nothing in the browser:** check that `VITE_USE_MOCK` matches what you want and that you restarted `npm run dev`.
- **The demo account shows the wrong name:** run `scripts/seed_demo.py` again.
- **Dev server needs several reloads on Windows:** keep the project outside a OneDrive-synced folder.