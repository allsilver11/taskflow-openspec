from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Message, User
from backend.routers.auth import get_current_user, err
from backend.routers.teams import is_member

router = APIRouter(tags=["messages"])


class MessageCreate(BaseModel):
    content: str


def _msg_out(m: Message, email: str) -> dict:
    return {
        "id": m.id,
        "content": m.content,
        "user_id": m.user_id,
        "team_id": m.team_id,
        "sender_email": email,
        "created_at": m.created_at.isoformat(),
    }


@router.post("/teams/{team_id}/messages", status_code=201)
def send_message(team_id: int, body: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    if not body.content.strip():
        raise HTTPException(status_code=400, detail=err("VALIDATION_ERROR", "메시지 내용을 입력해주세요"))
    if len(body.content) > 1000:
        raise HTTPException(status_code=400, detail=err("TOO_LONG", "메시지는 1000자 이내로 입력하세요"))
    msg = Message(team_id=team_id, user_id=current_user.id, content=body.content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _msg_out(msg, current_user.email)


@router.get("/teams/{team_id}/messages")
def get_messages(
    team_id: int,
    since: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    q = db.query(Message, User).join(User, Message.user_id == User.id).filter(Message.team_id == team_id)
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00")).replace(tzinfo=None)
            q = q.filter(Message.created_at > since_dt).order_by(Message.created_at.asc())
            return [_msg_out(m, u.email) for m, u in q.all()]
        except ValueError:
            pass
    rows = q.order_by(Message.created_at.desc()).limit(50).all()
    rows.reverse()
    return [_msg_out(m, u.email) for m, u in rows]


@router.delete("/messages/{message_id}", status_code=204)
def delete_message(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail=err("NOT_FOUND", "메시지를 찾을 수 없습니다"))
    if not is_member(db, msg.team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    if msg.user_id != current_user.id:
        raise HTTPException(status_code=403, detail=err("NOT_OWNER", "본인의 메시지만 삭제할 수 있습니다"))
    db.delete(msg)
    db.commit()
