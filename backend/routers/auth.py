from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models import User
from backend import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


def err(code: str, message: str):
    return {"error": {"code": code, "message": message}}


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
    if not credentials:
        raise HTTPException(status_code=401, detail=err("TOKEN_EXPIRED", "인증이 만료되었습니다"))
    payload = auth_service.decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail=err("TOKEN_EXPIRED", "인증이 만료되었습니다"))
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail=err("TOKEN_EXPIRED", "인증이 만료되었습니다"))
    return user


def _user_out(user: User, token: str = None) -> dict:
    d = {"id": user.id, "email": user.email, "team_id": user.team_id}
    if token:
        return {"token": token, "user": d}
    return d


@router.post("/signup", status_code=201)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail=err("VALIDATION_ERROR", "비밀번호는 8자 이상이어야 합니다"))
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail=err("EMAIL_TAKEN", "이미 가입된 이메일입니다"))
    user = User(email=body.email, password_hash=auth_service.hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth_service.create_access_token({"sub": user.id})
    return _user_out(user, token)


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not auth_service.verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail=err("INVALID_CREDENTIALS", "이메일 또는 비밀번호가 일치하지 않습니다"))
    token = auth_service.create_access_token({"sub": user.id})
    return _user_out(user, token)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "team_id": current_user.team_id, "created_at": current_user.created_at.isoformat()}


@router.post("/logout")
def logout():
    return {"message": "로그아웃 되었습니다"}
