# Lifescape Backend

FastAPI, SQLAlchemy 2, Alembic, and PostgreSQL.

## Architecture

Lifescape is a mobile-first Vue frontend backed by a Python FastAPI application and a PostgreSQL database. The frontend communicates with the backend through JSON HTTP endpoints. The backend owns authentication, users, quests, assignments, rewards, event logging, and recommendations; the frontend presents that data and manages user interactions.

### Components

- **Vue frontend:** Provides the login, home, quests, world, inventory, and profile views. It calls the backend API and renders loading, success, and error states.
- **FastAPI API:** Exposes versioned application endpoints under `/api`, including auth, users, quests, rewards, events, and recommendations. It validates request data and returns response schemas. DO NOT put business logic here, delegate that to the services.
- **Application services:** Contains use-case logic such as creating users, assigning and completing quests, awarding points, logging events, and selecting recommendations. API routes delegate business operations to these services.
- **SQLAlchemy models and database session:** Maps the domain entities to PostgreSQL tables and provides request-scoped database sessions. The current schema includes `user`, `quest`, `user_quest`, `prop`, `inventory_item`, and `event_log`.
- **Alembic migrations:** Version the database schema independently of application startup. Model changes must be paired with a numbered migration and the ERD source update.
- **Recommendation module:** Runs inside the backend process. The rule-based recommender is the initial baseline; model-ranked recommendations and experiment assignment can be added behind the same service boundary.
- **PostgreSQL:** Persists user accounts, quest definitions, assignments, progression, inventory, and recommendation events.

Database structure is deployed separately through Alembic: `alembic upgrade head` applies committed migrations before the application uses the database. The frontend does not connect directly to PostgreSQL.

### Layered Architecture

The backend follows these layers from the outside toward persistence:

```text
Vue presentation layer
	|
	v
FastAPI API layer: routing, HTTP status codes, request/response schemas
	|
	v
Service layer: users, quests, rewards, events, recommendations
	|
	v
Data-access layer: SQLAlchemy models and database sessions
	|
	v
PostgreSQL persistence layer
```

Alembic operates alongside the data-access layer as the schema-change path. Configuration is centralized in `app/core/config.py`, and the database connection is created in `app/db.py`. Keeping routes thin and business rules in services makes the quest lifecycle testable without coupling the frontend to database details.

## Local setup

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[test]'
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to a reachable PostgreSQL database, then run:

```bash
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

The API health check is available at `http://localhost:8000/health`.

## Migrations

Every schema change must be generated as a numbered Alembic revision and committed with the model change:

```bash
.venv/bin/alembic revision --autogenerate -m "describe the schema change"
.venv/bin/alembic upgrade head
.venv/bin/alembic downgrade -1
```

The canonical ERD source is `ERD.md`.
`001_initial_schema.py` is the initial migration for the six Phase 1 tables.

## Demo seed

After applying migrations, seed one demo user and the three quests used by the Vue placeholder UI:

```bash
.venv/bin/python scripts/seed_demo.py
```

The script is safe to rerun. It creates `demo_user`, creates or updates the three quests by title, and maps the frontend XP values to the database `points` field. Duration, difficulty, coins, and theme remain frontend presentation metadata because they are not columns in the current ERD.

## Tests

```bash
.venv/bin/pytest
```
