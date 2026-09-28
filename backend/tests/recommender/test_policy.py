import random

import pytest

from app.recommender.policy import choose


def test_choose_applies_each_repetition_penalty_once() -> None:
    scores = {1: 0.9, 2: 0.8}

    selection = choose(
        scores,
        seen_quests={1},
        seen_categories={"social"},
        categories={1: "social", 2: "outdoors"},
        rng=random.Random(1),
    )

    assert selection.quest_id == 2
    assert selection.raw_scores == {1: 0.9, 2: 0.8}
    assert selection.adjusted_scores == {1: pytest.approx(0.7), 2: pytest.approx(0.8)}
    assert scores == {1: 0.9, 2: 0.8}


def test_choose_greedy_branch_breaks_adjusted_score_ties_by_smallest_id() -> None:
    selection = choose(
        {9: 0.7, 2: 0.7, 5: 0.6},
        seen_quests=set(),
        seen_categories=set(),
        categories={9: "a", 2: "b", 5: "c"},
        rng=random.Random(1),
    )

    assert selection.quest_id == 2
    assert selection.branch == "greedy"
    assert selection.selection_probability == pytest.approx(0.8 + 0.2 / 3)


def test_choose_explores_uniformly_across_all_candidates() -> None:
    selection = choose(
        {10: 0.9, 20: 0.4, 30: 0.1},
        seen_quests=set(),
        seen_categories=set(),
        categories={10: "a", 20: "b", 30: "c"},
        rng=random.Random(0),
    )

    assert selection.quest_id == 20
    assert selection.branch == "explore"
    assert selection.selection_probability == pytest.approx(0.2 / 3)


def test_choose_logs_greedy_probability_when_exploration_selects_best() -> None:
    selection = choose(
        {10: 0.9, 20: 0.4, 30: 0.1},
        seen_quests=set(),
        seen_categories=set(),
        categories={10: "a", 20: "b", 30: "c"},
        rng=random.Random(2),
    )

    assert selection.quest_id == 10
    assert selection.branch == "explore"
    assert selection.selection_probability == pytest.approx(0.8 + 0.2 / 3)


def test_choose_single_candidate_has_probability_one() -> None:
    selection = choose(
        {7: 0.42},
        seen_quests={7},
        seen_categories={"social"},
        categories={7: "social"},
        rng=random.Random(0),
    )

    assert selection.quest_id == 7
    assert selection.branch == "explore"
    assert selection.selection_probability == pytest.approx(1.0)
    assert selection.adjusted_scores == {7: pytest.approx(0.22)}


def test_choose_rejects_empty_scores() -> None:
    with pytest.raises(ValueError):
        choose(
            {},
            seen_quests=set(),
            seen_categories=set(),
            categories={},
            rng=random.Random(1),
        )
