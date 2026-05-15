import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Team, User
from backend.routers.auth import get_current_user, err

router = APIRouter(tags=["teams"])


class TeamCreate(BaseModel):
    name: str


class JoinRequest(BaseModel):
    invite_code: str


def _gen_invite_code() -> str:
    return "".join(random.choices(string.ascii_uppercase, k=4)) + "-" + "".join(random.choices(string.digits, k=4))


def is_member(db: Session, team_id: int, user_id: int) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    return user is not None and user.team_id == team_id


def _team_out(t: Team) -> dict:
    return {"id": t.id, "name": t.name, "invite_code": t.invite_code, "owner_id": t.owner_id}


@router.post("/teams", status_code=201)
def create_team(body: TeamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.team_id is not None:
        raise HTTPException(status_code=409, detail=err("ALREADY_IN_TEAM", "이미 팀에 소속되어 있습니다. 먼저 팀을 떠나세요"))
    code = _gen_invite_code()
    while db.query(Team).filter(Team.invite_code == code).first():
        code = _gen_invite_code()
    team = Team(name=body.name, invite_code=code, owner_id=current_user.id)
    db.add(team)
    db.flush()
    current_user.team_id = team.id
    db.commit()
    db.refresh(team)
    return _team_out(team)


@router.get("/teams")
def list_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.team_id is None:
        return []
    team = db.query(Team).filter(Team.id == current_user.team_id).first()
    return [_team_out(team)] if team else []


@router.post("/teams/join")
def join_team(body: JoinRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    import re
    if not re.match(r'^[A-Z]{4}-[0-9]{4}$', body.invite_code):
        raise HTTPException(status_code=400, detail=err("VALIDATION_ERROR", "형식이 올바르지 않습니다 (예: FRNT-2026)"))
    team = db.query(Team).filter(Team.invite_code == body.invite_code).first()
    if not team:
        raise HTTPException(status_code=404, detail=err("NOT_FOUND", "해당 초대코드를 찾을 수 없습니다"))
    if current_user.team_id == team.id:
        return _team_out(team)
    if current_user.team_id is not None:
        raise HTTPException(status_code=409, detail=err("ALREADY_IN_TEAM", "이미 다른 팀에 소속되어 있습니다"))
    current_user.team_id = team.id
    db.commit()
    return _team_out(team)


@router.get("/teams/{team_id}")
def get_team(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail=err("NOT_FOUND", "팀을 찾을 수 없습니다"))
    members = db.query(User).filter(User.team_id == team_id).all()
    return {**_team_out(team), "member_count": len(members)}


@router.get("/teams/{team_id}/members")
def get_members(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    users = db.query(User).filter(User.team_id == team_id).all()
    return [{"id": u.id, "email": u.email, "is_owner": u.id == db.query(Team).filter(Team.id == team_id).first().owner_id} for u in users]


@router.delete("/teams/{team_id}/leave", status_code=200)
def leave_team(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    current_user.team_id = None
    db.commit()
    return {"message": "팀을 떠났습니다"}
