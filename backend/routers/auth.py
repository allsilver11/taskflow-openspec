from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import User
from backend import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    payload = auth_service.decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail={"code": "INVALID_TOKEN", "msg": "인증이 필요합니다"})
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail={"code": "INVALID_TOKEN", "msg": "인증이 필요합니다"})
    return user


@router.post("/signup", status_code=201)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail="비밀번호는 8자 이상이어야 합니다")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail={"code": "EMAIL_EXISTS", "msg": "이미 사용 중인 이메일입니다"})
    user = User(email=body.email, password_hash=auth_service.hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth_service.create_access_token({"sub": user.id})
    return {"token": token, "user": {"id": user.id, "email": user.email}}


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not auth_service.verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail={"code": "INVALID_CREDENTIALS", "msg": "이메일 또는 비밀번호가 올바르지 않습니다"},
        )
    token = auth_service.create_access_token({"sub": user.id})
    return {"token": token, "user": {"id": user.id, "email": user.email}}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat(),
    }


@router.post("/logout")
def logout():
    return {"msg": "로그아웃 되었습니다"}
