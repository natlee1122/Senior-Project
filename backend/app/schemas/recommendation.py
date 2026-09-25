from pydantic import BaseModel


class RecommendationRead(BaseModel):
    assignment_id: int
    quest_id: int
    recommender: str
    model_version: str
