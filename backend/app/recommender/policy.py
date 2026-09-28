from dataclasses import dataclass
import random


@dataclass
class Selection:
    quest_id: int
    branch: str
    selection_probability: float
    raw_scores: dict[int, float]
    adjusted_scores: dict[int, float]


def choose(
    scores: dict[int, float],
    seen_quests: set[int],
    seen_categories: set[str],
    categories: dict[int, str],
    *,
    rng: random.Random,
    epsilon: float = 0.2,
) -> Selection:
    if not scores:
        raise ValueError("cannot choose from empty scores")

    raw_scores = dict(scores)
    adjusted_scores = {
        quest_id: score
        - (0.15 if quest_id in seen_quests else 0.0)
        - (0.05 if categories[quest_id] in seen_categories else 0.0)
        for quest_id, score in scores.items()
    }
    greedy_quest_id = max(
        adjusted_scores,
        key=lambda quest_id: (adjusted_scores[quest_id], -quest_id),
    )

    if rng.random() < 1.0 - epsilon:
        quest_id = greedy_quest_id
        branch = "greedy"
    else:
        quest_id = rng.choice(list(scores))
        branch = "explore"

    candidate_count = len(scores)
    selection_probability = epsilon / candidate_count
    if quest_id == greedy_quest_id:
        selection_probability += 1.0 - epsilon

    return Selection(
        quest_id=quest_id,
        branch=branch,
        selection_probability=selection_probability,
        raw_scores=raw_scores,
        adjusted_scores=adjusted_scores,
    )
