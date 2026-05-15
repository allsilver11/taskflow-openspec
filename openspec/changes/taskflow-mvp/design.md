## Context

신규 풀스택 웹 앱. 기존 코드베이스 없음. FastAPI(Python) 백엔드와 Vanilla JS 프론트엔드를 단일 서버로 서빙하는 일체형 구조. 로컬 개발은 SQLite, Vercel 배포 시 Neon PostgreSQL로 전환. SQLAlchemy가 양쪽 DB를 추상화.

## Goals / Non-Goals

**Goals:**
- 인증(JWT) → 팀(초대코드) → 칸반(드래그앤드롭) → 채팅(5초 폴링) 전체 플로우 동작
- 로컬 `uvicorn`으로 즉시 실행, Vercel에 한 명령으로 배포
- SQLAlchemy로 SQLite/Neon 코드 변경 없이 전환

**Non-Goals:**
- WebSocket, 파일 업로드, 이메일 알림, 전문검색, 다국어, 테스트 자동화

## Decisions

### 1. FE+BE 일체형 (StaticFiles)
FastAPI가 `/static`에 HTML/JS/CSS를 serve. 별도 FE 빌드 서버 없음.
- **Why**: Vercel 배포 시 단일 프로젝트로 처리 가능. 학습 복잡도 최소화.
- **Alternative**: Next.js 분리 배포 → 오버엔지니어링, MVP 범위 초과.

### 2. JWT를 localStorage에 저장
`Authorization: Bearer <token>` 헤더로 모든 API 요청에 첨부.
- **Why**: 간단한 구현, MVP 범위. XSS 위험은 인지하나 MVP에서 허용.
- **Alternative**: httpOnly Cookie → CSRF 처리 필요, 복잡도 증가.

### 3. 5초 폴링 (채팅)
`setInterval(fetchMessages, 5000)` — `?since=<timestamp>` 쿼리로 증분 조회.
- **Why**: WebSocket은 Out of Scope. Vercel Serverless에서 WebSocket 설정 복잡.
- **Alternative**: WebSocket → 범위 외 명시.

### 4. team_members 중간 테이블 추가
`teams` 테이블에 `owner_id`만 있으므로 멤버 관계를 `team_members(team_id, user_id)` 테이블로 관리.
- **Why**: `GET /teams/{id}/members` API 구현 필요. 초대코드로 합류 시 이 테이블에 레코드 추가.
- **Note**: 원본 DB 스키마에 누락된 부분 — 의도적으로 추가.

### 5. Vercel 배포 — Python Serverless
`vercel.json`에 FastAPI를 Python runtime으로 지정. `api/index.py`가 ASGI 앱 엔트리포인트.
- **Why**: Vercel Python runtime이 FastAPI ASGI를 직접 지원.
- **Alternative**: Docker → Vercel 무료 티어에서 불필요.

## Risks / Trade-offs

- **SQLite → Neon 마이그레이션**: 로컬에서 테스트한 쿼리가 PostgreSQL에서 다르게 동작할 수 있음 → SQLAlchemy ORM만 사용, raw SQL 금지로 완화.
- **5초 폴링 부하**: 동시 50명 × 5초 = 분당 600 req → Neon Free 티어 연결 수 주의 → connection pooling(Pooled URL) 사용.
- **JWT 24h 만료**: 갱신 없음 → 사용자가 24h 후 재로그인 필요. MVP에서 허용.
- **드래그앤드롭**: HTML5 Drag API 사용. 모바일 터치 이벤트 미지원 → MVP에서 허용 (PC 우선).

## Migration Plan

1. `pip install -r requirements.txt`
2. `python -m uvicorn api.index:app --reload` (로컬 SQLite 자동 생성)
3. Vercel 프로젝트 연결 + Neon DB 환경변수 설정
4. `vercel deploy`

롤백: Vercel 대시보드에서 이전 배포로 즉시 전환 가능.

## Open Questions

- 칸반 화면과 채팅 화면의 레이아웃: 칸반 우측에 채팅 패널을 붙이는 분할 레이아웃 채택 (스토리보드 확인 불가로 가정).
- 초대코드 형식: `ABCD-1234` (8자 영숫자 + 하이픈) — ACME Examples 기준.
