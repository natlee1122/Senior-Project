# Catalog quest recommender

The backend recommends one catalog quest, targeting completion within 24 hours
of confirmed display. Training runs offline; the API uses a saved XGBoost model
or a random fallback. Frontend integration is still pending.

## Code review starting points

Read these in order. Each row gives you a question to answer in the code.

| Step | Files | Review question |
|---|---|---|
| 1. Request | [API entrypoint](../api/recommendations.py), [service.py](service.py) | How does GET select an eligible quest and save a pending recommendation? |
| 2. History | [models.py](models.py), [migration](../../alembic/versions/002_recommendation_impression.py), [router.py](router.py) | How does a suggestion become a confirmed display, then link to an assignment? |
| 3. Selection | [features.py](features.py), [policy.py](policy.py) | What inputs are saved, and why might the highest completion score lose? |
| 4. Training | [train.py](train.py), [model_io.py](model_io.py) | How are 24-hour labels built, split chronologically, trained and loaded? |
| 5. Verification | [lifecycle test](../../tests/recommender/test_api.py), [remaining tests](../../tests/recommender) | Can you trace recommend → display → assign → link → complete? |

The SQLAlchemy model describes the new `recommendation_impression` table.
The Alembic migration creates it in the database. Each row records a suggestion,
including suggestions that never become assignments. `assignment_id` is optional
and unique so one completion cannot credit multiple suggestions.

The candidate query excludes this user's unfinished assignments, completions
less than 24 hours old, completed assignments missing an end time, and quests
outside their availability window. Other users' assignments do not block a quest.
The old [recommendation helper](../services/recommendation_service.py) remains,
but this endpoint now uses the new package.

Only four existing files change for integration: the recommendation route,
[model registration](../models/__init__.py), [dependencies](../../pyproject.toml)
and [ERD](../../ERD.md). From the repository root, `git diff main -- backend`
shows the feature and any local edits. VS Code's Changes list shows only
uncommitted edits.

## Run the backend

Run commands from `backend/`. Configure `DATABASE_URL` following the
[backend README](../../README.md), using the `postgresql+psycopg://` scheme.
If needed, create the environment first with `python3 -m venv .venv`.

```bash
.venv/bin/python -m pip install -e '.[test,ml]'
.venv/bin/alembic upgrade head
.venv/bin/python scripts/seed_demo.py
.venv/bin/uvicorn app.main:app --reload
```

## Client request sequence

Use the IDs returned by each request. The JSON bodies are defined in
[schemas.py](schemas.py).

| Step | Request | JSON body |
|---|---|---|
| 1. Get suggestion | `GET /api/recommendations/{user_id}` | None |
| 2. Confirm display | `POST /api/recommendations/impressions/{impression_id}/shown` | `{"user_id":1}` |
| 3. Accept quest | `POST /api/quests/{quest_id}/assign/{user_id}` | None |
| 4. Link assignment | `POST /api/recommendations/impressions/{impression_id}/link-assignment` | `{"user_id":1,"assignment_id":3}` |
| 5. Complete quest | `POST /api/rewards/claim/{assignment_id}` | None |

The GET response adds `impression_id` to the existing fields; its `assignment_id=0`
is a placeholder. It creates no assignment and leaves `shown_at` unset until
step 2. For example, a suggestion displayed at 10:00 and completed at 11:00
becomes a positive training example once its window matures at 10:00 the next day.

Keep the same impression across UI rerenders. Display confirmation and linking
the same assignment are safe to retry. The first link requires confirmed display,
matching user/quest and an available assignment. Retry failed linking before
enabling completion; assignment creation and linking are separate requests.

## Selection and training

`snapshot()` saves category, quest/user points, account age, completion counts,
and UTC hour/weekday at decision time. Training reads those saved inputs instead
of reconstructing them from later user state. `encode()` uses a fixed feature
order and saved category vocabulary; unknown categories get zero indicator columns.

With a model, the policy subtracts `0.15` for a quest shown in the preceding
24 hours and `0.05` for a category shown in that window, each once. It chooses
the highest adjusted score 80% of the time and samples all eligible quests
uniformly 20% of the time. Ties choose the lowest quest ID; repeats remain possible.
For `N` candidates, the greedy winner's selection probability is `0.8 + 0.2/N`;
each other quest's is `0.2/N`. This differs from predicted completion probability.
Without a usable bundle, selection is uniform and reports `rule-based`, `rules-v1`.

Only confirmed impressions with mature 24-hour windows are used for training.
A linked completion from display through the inclusive deadline gets label `1`;
otherwise the mature impression gets `0`. Training windows must end strictly
before `validation_start`; validation impressions start at or after that cutoff
and mature by `as_of`. Windows crossing the cutoff are omitted. Use UTC timestamps
and an `as_of` after the cutoff. Training needs both labels and nonempty partitions.

```bash
.venv/bin/python -m app.recommender.train \
  --validation-start 2026-09-01T00:00:00 \
  --as-of 2026-09-28T00:00:00 \
  --output app/recommender/artifacts/run-001
```

Choose dates matching your collected history and a new output directory.
Training writes `model.json` and `metadata.json` with features, settings, validation
metrics and seven-day completion/variety counts. Log loss measures probability
errors; lower is better. Compare it with the constant completion-rate baseline.

For first activation, create this relative symlink, then restart the API:

```bash
ln -s run-001 app/recommender/artifacts/current
```

For later runs, keep old bundles and switch only the `current` symlink. Loading
validates feature/label compatibility and caches the result, including fallback;
every activation requires a restart. Missing or invalid bundles and missing ML
dependencies use the random fallback.

## Verify

```bash
.venv/bin/python -m pytest tests/recommender tests/test_health.py -q
```

Tests cover the API lifecycle, eligibility, retries, saved features, label
boundaries, exploration, and real XGBoost save/load. They use in-memory SQLite;
no running API or PostgreSQL is required. Synthetic examples prove functionality,
not real-user prediction quality.

Remaining work: frontend wiring, real outcome collection/model activation, and
binding supplied user IDs to authenticated identity. Current ID checks validate
ownership relative to the supplied ID; they do not authenticate callers.
Automatic retraining and tuning are deferred.
