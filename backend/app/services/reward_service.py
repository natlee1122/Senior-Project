from sqlalchemy.orm import Session

from app.models.assignment import UserQuest


def award_quest_points(db: Session, assignment: UserQuest) -> int:
    if assignment.status != "COMPLETED" or assignment.quest is None or assignment.user is None:
        return 0
    points = assignment.quest.points
    assignment.user.points += points
    db.commit()
    return points
