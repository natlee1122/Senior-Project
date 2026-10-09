from pydantic import BaseModel, Field

from app.schemas.recommendation import RecommendationRead as BaseRecommendationRead


class RecommendationRead(BaseRecommendationRead):
    impression_id: int


class DisplayConfirmation(BaseModel):
    user_id: int = Field(gt=0)


class AssignmentLink(DisplayConfirmation):
    assignment_id: int = Field(gt=0)
