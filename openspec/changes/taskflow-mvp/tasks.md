## 1. 프로젝트 초기 설정

- [x] 1.1 디렉토리 구조 생성: `backend/`, `frontend/`, `api/`
- [x] 1.2 `requirements.txt` 작성 (fastapi, uvicorn, sqlalchemy, python-jose, passlib[bcrypt], psycopg2-binary)
- [x] 1.3 `api/index.py` — FastAPI 앱 엔트리포인트, StaticFiles 마운트
- [x] 1.4 `vercel.json` — Python runtime 설정
- [x] 1.5 `.env.example` 작성 (DATABASE_URL, SECRET_KEY)
- [x] 1.6 `.gitignore` — `taskflow.db`, `.env` 제외

## 2. DB 모델 및 초기화

- [x] 2.1 `backend/database.py` — SQLAlchemy engine, SESSION, Base (DATABASE_URL 환경변수 → SQLite 폴백)
- [x] 2.2 `backend/models.py` — User, Team, TeamMember, Task, Message 모델 정의
- [x] 2.3 `backend/models.py` — TeamMember(team_id, user_id) 중간 테이블 추가
- [x] 2.4 앱 시작 시 `Base.metadata.create_all()` 자동 실행 확인

## 3. 인증 API

- [x] 3.1 `backend/auth.py` — JWT 발급/검증 유틸 (python-jose, 24h 만료)
- [x] 3.2 `backend/routers/auth.py` — POST /auth/signup (bcrypt 해시, 중복 이메일 409)
- [x] 3.3 `backend/routers/auth.py` — POST /auth/login (bcrypt 검증, JWT 반환)
- [x] 3.4 `backend/routers/auth.py` — GET /auth/me (JWT 검증 의존성)
- [x] 3.5 `backend/routers/auth.py` — POST /auth/logout (200 반환)
- [x] 3.6 CORS 미들웨어 설정 (허용 도메인 명시)

## 4. 팀 API

- [x] 4.1 `backend/routers/teams.py` — POST /teams (초대코드 XXXX-XXXX 자동 생성, TeamMember owner 등록)
- [x] 4.2 `backend/routers/teams.py` — GET /teams (로그인 사용자 소속 팀 목록)
- [x] 4.3 `backend/routers/teams.py` — POST /teams/join (초대코드 검증, TeamMember 추가, 중복 무시)
- [x] 4.4 `backend/routers/teams.py` — GET /teams/{id}/members (팀원만 접근, 403 처리)

## 5. 칸반 태스크 API

- [x] 5.1 `backend/routers/tasks.py` — POST /teams/{id}/tasks (기본 status=TODO)
- [x] 5.2 `backend/routers/tasks.py` — GET /teams/{id}/tasks
- [x] 5.3 `backend/routers/tasks.py` — GET /tasks/{id}
- [x] 5.4 `backend/routers/tasks.py` — PUT /tasks/{id} status 변경 (TODO/DOING/DONE 검증)
- [x] 5.5 `backend/routers/tasks.py` — PUT /tasks/{id} title 수정
- [x] 5.6 `backend/routers/tasks.py` — DELETE /tasks/{id} (404 처리)

## 6. 채팅 API

- [x] 6.1 `backend/routers/messages.py` — POST /teams/{id}/messages (1000자 제한)
- [x] 6.2 `backend/routers/messages.py` — GET /teams/{id}/messages?since= (증분 폴링, 기본 최근 50개)
- [x] 6.3 `backend/routers/messages.py` — GET /messages/{id}
- [x] 6.4 `backend/routers/messages.py` — DELETE /messages/{id}

## 7. 프론트엔드 — 공통

- [x] 7.1 `frontend/index.html` — SPA 진입점, Tailwind CDN
- [x] 7.2 `frontend/js/api.js` — fetch 래퍼 (Authorization 헤더 자동 첨부, 에러 처리)
- [x] 7.3 `frontend/js/auth.js` — localStorage JWT 저장/로드/삭제, 라우팅 가드
- [x] 7.4 `frontend/js/router.js` — 해시 기반 SPA 라우터 (#login, #teams, #kanban, #chat)

## 8. 프론트엔드 — 화면 구현

- [x] 8.1 `frontend/pages/login.js` — 로그인/회원가입 폼, JWT 저장 후 #teams 이동
- [x] 8.2 `frontend/pages/teams.js` — 팀 목록, 팀 만들기, 초대코드 입력 합류
- [x] 8.3 `frontend/pages/kanban.js` — 3컬럼 보드, 태스크 카드 렌더링
- [x] 8.4 `frontend/pages/kanban.js` — HTML5 Drag API 드래그앤드롭 상태 이동
- [x] 8.5 `frontend/pages/kanban.js` — 태스크 추가 폼, 삭제 버튼
- [x] 8.6 `frontend/pages/kanban.js` — 우측 채팅 패널 (분할 레이아웃)
- [x] 8.7 `frontend/pages/chat.js` — 메시지 목록, 5초 setInterval 폴링, 자동 스크롤
- [x] 8.8 `frontend/pages/chat.js` — 메시지 입력창, 발신자+시각 표시

## 9. Vercel 배포

- [ ] 9.1 Vercel 프로젝트 생성 및 로컬 연결
- [ ] 9.2 Neon DB Vercel Integration 연결 (DATABASE_URL 자동 주입 확인)
- [ ] 9.3 SECRET_KEY 환경변수 Vercel에 설정
- [ ] 9.4 `vercel --prod` 배포 및 동작 확인 (5분 이내 완료)
- [ ] 9.5 배포된 URL에서 전체 플로우 수동 검증 (회원가입 → 팀 생성 → 칸반 → 채팅)
