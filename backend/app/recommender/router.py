from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.recommender.schemas import AssignmentLink, DisplayConfirmation
from app.recommender.service import confirm_shown, link_assignment

router = APIRouter(prefix="/impressions")


@router.post("/{impression_id}/shown", status_code=204, response_class=Response)
def shown(impression_id: int, payload: DisplayConfirmation, db: Session = Depends(get_db)):
    try:
        confirm_shown(db, impression_id, payload.user_id, now=datetime.utcnow())
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{impression_id}/link-assignment", status_code=204, response_class=Response)
def link(impression_id: int, payload: AssignmentLink, db: Session = Depends(get_db)):
    try:
        link_assignment(db, impression_id, payload.user_id, payload.assignment_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
