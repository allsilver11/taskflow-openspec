import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Team, TeamMember, User
from backend.routers.auth import get_current_user

router = APIRouter(tags=["teams"])


class TeamCreate(BaseModel):
    name: str


class JoinRequest(BaseModel):
    invite_code: str


def _gen_invite_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=4)) + "-" + "".join(random.choices(string.digits, k=4))


def is_member(db: Session, team_id: int, user_id: int) -> bool:
    return (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
        is not None
    )


@router.post("/teams", status_code=201)
def create_team(body: TeamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    code = _gen_invite_code()
    while db.query(Team).filter(Team.invite_code == code).first():
        code = _gen_invite_code()
    team = Team(name=body.name, invite_code=code, owner_id=current_user.id)
    db.add(team)
    db.flush()
    db.add(TeamMember(team_id=team.id, user_id=current_user.id))
    db.commit()
    db.refresh(team)
    return {"id": team.id, "name": team.name, "invite_code": team.invite_code, "owner_id": team.owner_id}


@router.get("/teams")
def list_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ids = [m.team_id for m in db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()]
    teams = db.query(Team).filter(Team.id.in_(ids)).all()
    return [{"id": t.id, "name": t.name, "invite_code": t.invite_code, "owner_id": t.owner_id} for t in teams]


@router.post("/teams/join")
def join_team(body: JoinRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    team = db.query(Team).filter(Team.invite_code == body.invite_code).first()
    if not team:
        raise HTTPException(status_code=404, detail={"code": "TEAM_NOT_FOUND", "msg": "초대코드가 올바르지 않습니다"})
    if not is_member(db, team.id, current_user.id):
        db.add(TeamMember(team_id=team.id, user_id=current_user.id))
        db.commit()
    return {"id": team.id, "name": team.name, "invite_code": team.invite_code, "owner_id": team.owner_id}


@router.get("/teams/{team_id}/members")
def get_members(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "msg": "팀 멤버만 접근할 수 있습니다"})
    ids = [m.user_id for m in db.query(TeamMember).filter(TeamMember.team_id == team_id).all()]
    users = db.query(User).filter(User.id.in_(ids)).all()
    return [{"id": u.id, "email": u.email} for u in users]
