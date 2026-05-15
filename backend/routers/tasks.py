from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import Task, Team, User
from backend.routers.auth import get_current_user, err
from backend.routers.teams import is_member

router = APIRouter(tags=["tasks"])

VALID_STATUSES = {"TODO", "DOING", "DONE"}


class TaskCreate(BaseModel):
    title: str
    assignee_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    assignee_id: Optional[int] = None


class StatusUpdate(BaseModel):
    status: str


def _task_out(t: Task) -> dict:
    return {
        "id": t.id,
        "title": t.title,
        "status": t.status,
        "team_id": t.team_id,
        "creator_id": t.creator_id,
        "assignee_id": t.assignee_id,
        "created_at": t.created_at.isoformat(),
    }


def _can_delete(task: Task, user: User, db: Session) -> bool:
    if task.creator_id == user.id:
        return True
    team = db.query(Team).filter(Team.id == task.team_id).first()
    return team is not None and team.owner_id == user.id


@router.post("/teams/{team_id}/tasks", status_code=201)
def create_task(team_id: int, body: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    task = Task(team_id=team_id, title=body.title, status="TODO", creator_id=current_user.id, assignee_id=body.assignee_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_out(task)


@router.get("/teams/{team_id}/tasks")
def list_tasks(
    team_id: int,
    filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not is_member(db, team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    q = db.query(Task).filter(Task.team_id == team_id)
    if filter == "me":
        q = q.filter(Task.assignee_id == current_user.id)
    elif filter == "unassigned":
        q = q.filter(Task.assignee_id == None)
    tasks = q.order_by(Task.created_at.desc()).all()
    return [_task_out(t) for t in tasks]


@router.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=err("NOT_FOUND", "태스크를 찾을 수 없습니다"))
    if not is_member(db, task.team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    return _task_out(task)


@router.patch("/tasks/{task_id}/status")
def update_status(task_id: int, body: StatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=err("NOT_FOUND", "태스크를 찾을 수 없습니다"))
    if not is_member(db, task.team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=err("VALIDATION_ERROR", "상태는 TODO, DOING, DONE 중 하나여야 합니다"))
    task.status = body.status
    db.commit()
    db.refresh(task)
    return _task_out(task)


@router.put("/tasks/{task_id}")
def update_task(task_id: int, body: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=err("NOT_FOUND", "태스크를 찾을 수 없습니다"))
    if not is_member(db, task.team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    if body.title is not None:
        task.title = body.title
    if body.assignee_id is not None:
        task.assignee_id = body.assignee_id
    db.commit()
    db.refresh(task)
    return _task_out(task)


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=err("NOT_FOUND", "태스크를 찾을 수 없습니다"))
    if not is_member(db, task.team_id, current_user.id):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "이 팀의 멤버가 아닙니다"))
    if not _can_delete(task, current_user, db):
        raise HTTPException(status_code=403, detail=err("FORBIDDEN", "생성자 또는 팀 owner만 삭제할 수 있습니다"))
    db.delete(task)
    db.commit()
