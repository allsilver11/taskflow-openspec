from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Task, User
from backend.routers.auth import get_current_user
from backend.routers.teams import is_member

router = APIRouter(tags=["tasks"])

VALID_STATUSES = {"TODO", "DOING", "DONE"}


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None


def _task_out(t: Task) -> dict:
    return {"id": t.id, "title": t.title, "status": t.status, "team_id": t.team_id, "creator_id": t.creator_id}


@router.post("/teams/{team_id}/tasks", status_code=201)
def create_task(team_id: int, body: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "msg": "팀 멤버만 접근할 수 있습니다"})
    task = Task(team_id=team_id, title=body.title, status="TODO", creator_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_out(task)


@router.get("/teams/{team_id}/tasks")
def list_tasks(team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "msg": "팀 멤버만 접근할 수 있습니다"})
    return [_task_out(t) for t in db.query(Task).filter(Task.team_id == team_id).all()]


@router.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "msg": "태스크를 찾을 수 없습니다"})
    if not is_member(db, task.team_id, current_user.id):
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "msg": "팀 멤버만 접근할 수 있습니다"})
    return _task_out(task)


@router.put("/tasks/{task_id}")
def update_task(task_id: int, body: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "msg": "태스크를 찾을 수 없습니다"})
    if not is_member(db, task.team_id, current_user.id):
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "msg": "팀 멤버만 접근할 수 있습니다"})
    if body.status is not None:
        if body.status not in VALID_STATUSES:
            raise HTTPException(status_code=422, detail={"code": "INVALID_STATUS", "msg": "상태는 TODO, DOING, DONE 중 하나여야 합니다"})
        task.status = body.status
    if body.title is not None:
        task.title = body.title
    db.commit()
    db.refresh(task)
    return _task_out(task)


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "msg": "태스크를 찾을 수 없습니다"})
    if not is_member(db, task.team_id, current_user.id):
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "msg": "팀 멤버만 접근할 수 있습니다"})
    db.delete(task)
    db.commit()
