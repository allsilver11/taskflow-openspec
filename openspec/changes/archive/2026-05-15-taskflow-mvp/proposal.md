## Why

소규모 팀은 태스크 관리와 커뮤니케이션 도구가 분리되어 있어 컨텍스트 전환 비용이 높다. TaskFlow MVP는 칸반 보드와 실시간 채팅을 한 화면에 통합하여 3-5인 팀이 업무 진행을 단일 인터페이스에서 추적할 수 있게 한다.

### 페르소나

| 페르소나 | 핵심 행동 | 체류 시간 | 최다 API |
|----------|-----------|-----------|----------|
| **팀 리더** (3-5인 팀 운영) | 한 화면 대시보드, 진행 파악·우선순위 조정, 초대코드 공유 | ~30분/세션 | GET /teams/{id}/tasks |
| **팀원** | 내 태스크(@me 필터) 확인 → 드래그 → 짧은 채팅 | ~5분/회, 여러 번 | PATCH /tasks/{id}/status |
| **신규 합류자** | 회원가입 → 초대코드 입력 → 칸반(스크롤) → 채팅(이력 시간순 스크롤) | 첫 세션 ~10분 | GET /teams/{id}/messages |

### 사용 시나리오

1. 리더가 팀 생성 + 초대코드 발급 → 멤버 합류 → 칸반에 태스크 추가 → 드래그로 상태 변경 → 채팅으로 합의
2. 신규 합류자 회원가입 → 초대코드 입력 → 칸반(스크롤) + 채팅 이력 시간순 스크롤로 1분 안에 파악
3. PC에서 작성, 모바일에서 진행 확인. 자동 배포된 URL로 어디서나 접근 (반응형 768px 기준)

## What Changes

- 신규 프로젝트: FastAPI 백엔드 + Vanilla JS/Tailwind 프론트엔드 풀스택 앱 구축
- 회원가입/로그인 + JWT 인증 + 1인 1팀 멤버십 (users.team_id)
- 초대코드 기반 팀 생성 및 합류 (형식: `[A-Z]{4}-[0-9]{4}`)
- TODO/DOING/DONE 3컬럼 칸반 보드 — assignee 지정, 드래그앤드롭, @me/미할당 필터
- 5초 폴링 기반 팀 채팅 — 1000자 카운터, 본인 메시지 삭제
- 반응형 UI — 데스크탑(3컬럼) / 모바일(1컬럼 스와이프 + 햄버거 메뉴)
- Vercel 배포 (FE+BE 일체형) + Vercel Storage Neon 연동

## Capabilities

### New Capabilities
- `user-auth`: 회원가입, 로그인, JWT 발급(24h), bcrypt 해시, /auth/me, 로그아웃(stateless)
- `team-management`: 팀 생성, 초대코드 발급/합류, 멤버 목록 조회, 팀 떠나기
- `kanban-board`: TODO/DOING/DONE 3컬럼, assignee 지정, @me/미할당 필터, 드래그앤드롭 상태 이동, 추가/삭제(creator or owner만)
- `team-chat`: 팀 단위 메시지 송수신, 5초 폴링(since= 증분), 1000자 카운터, 본인 메시지 삭제
- `deployment`: Vercel FE+BE 일체형 배포, Vercel Storage Neon DB 연동

### Modified Capabilities
<!-- 기존 스펙 없음 — 신규 프로젝트 -->

## Storyboard 결정 추적표 (8건)

원본 PDF의 빈틈을 스토리보드 v2에서 메운 결정. **Critical(1-4)은 구현 전 확정 필수**.

| # | 항목 | PDF 원본 | 스토리보드 결정 | 구분 |
|---|------|----------|----------------|------|
| 1 | users-teams 멤버십 | owner_id만 있음 | `users.team_id` 추가 (1인 1팀, NULL=미가입) | Critical |
| 2 | 신규 합류자 행동 | 채팅 이력 '검색' | 시간순 '스크롤'로 변경 (검색은 범위 외) | Critical |
| 3 | PUT /tasks/{id} 중복 | status용·title용 2개 같은 path | `PATCH /tasks/{id}/status` 분리 | Critical |
| 4 | '내 태스크' 정의 | creator_id만 있음 | `tasks.assignee_id` 추가 (nullable, 내 태스크 = assignee) | Critical |
| 5 | logout 의미 | stateless인데 endpoint 존재 | 200만 반환, 블랙리스트 없음 | Optional |
| 6 | 권한 검증 | admin/member 구분만 | 비멤버 403 / DELETE 태스크(creator or owner) / DELETE 메시지(본인만) | Optional |
| 7 | 측정 불가 NFR | 드래그 50ms·1분 파악 | 정성 검증으로 명시 (자동 측정 도구 미사용) | Optional |
| 8 | GET /messages/{id} | 용도 모호 (padding) | 제거 → `GET /teams/{id}` (팀 정보)로 교체, API 18개 유지 | Optional |

## Out of Scope

- **알림**: 이메일/SMS/푸시 알림 없음. 채팅 폴링으로 대체
- **파일 첨부**: 이미지/파일 업로드 없음. 텍스트 채팅만
- **검색**: 전문 검색 없음. 채팅 이력은 시간순 스크롤로 대체 (결정 #2)
- **WebSocket**: 실시간 메시지 안 함. 5초 폴링으로 대체
- **테스트 자동화**: pytest/jest 자동 테스트 없음. 수동 동작 확인만
- **초대코드 재발급**: 팀당 1개 고정. 재발급 없음
- **다국어**: 한글 UI만. i18n 리소스 분리 없음
- **JWT 갱신**: refresh token 없음. 24h 만료 시 재로그인
- **드래그앤드롭 모바일**: 모바일은 길게 누르기 → 상태 변경 메뉴로 대체

## ACME

### Assumptions (전제 — 검증 안 함)

- **1인 1팀**: 사용자는 동시에 하나의 팀에만 소속. `users.team_id = NULL` = 미가입 (결정 #1)
- 한국어 사용자만. 단일 시간대(KST). UTC 변환 없음
- 팀당 5명 이내, 동시 최대 50명
- 최신 Chrome + Safari 2버전 이상. IE 미지원
- 초대코드를 가진 사람은 신뢰할 수 있는 팀원으로 간주 (별도 승인 없음)
- JWT는 localStorage에 저장됨을 전제
- 이메일 인증 없음 — POST /auth/signup 즉시 계정 활성화

### Constraints (제약 — 반드시 지킴)

- **모든 /teams/* 라우트**: JWT 유효 + `user.team_id` 일치 검증. 비멤버 → 403
- **DELETE /tasks/{id}**: creator 또는 team owner만. 그 외 → 403 FORBIDDEN
- **DELETE /messages/{id}**: 본인만. owner도 타인 메시지 삭제 불가 → 403 NOT_OWNER
- **logout stateless**: JWT 블랙리스트 없음. 200만 반환 (결정 #5)
- **1팀당 1초대코드**: 고정. 재발급 Day 2 범위 외
- **메시지 1000자 이내**: 클라이언트(카운터) + 서버(400) 양쪽 검증
- **JWT 만료 24시간**: 갱신 토큰 없음. 만료 시 로그인 재요청
- **에러 응답 형식**: 모든 4xx/5xx는 `{"error": {"code": "SCREAMING_SNAKE", "message": "한국어"}}` 통일
- CORS 허용 도메인 명시 필수. Vercel / Neon 무료 티어 한도 내 동작

### Metrics (성공 측정 기준 — 정성 검증)

- **메시지 누락 0건**: POST 성공(201) 메시지는 이후 GET에서 100% 노출 (결정 #7)
- **기능 5종 정상 동작**: 회원가입/로그인/팀/칸반/채팅 정상 흐름 통과
- **에러 응답 표준 100%**: 모든 4xx/5xx가 `{"error": {...}}` 형태
- **권한 격리 100%**: 비멤버가 `/teams/{other_id}/*` 접근 → 모두 403
- **신규 합류자 1분 파악**: 회원가입 → 칸반 진입까지 1분 이내 (정성)
- **칸반 드래그 반응 50ms 이내**: 정성 검증 (자동 측정 도구 미사용, 결정 #7)
- Vercel 배포 완료 5분 이내

### Examples (구체 케이스 고정)

**API 응답 예시:**
- `POST /auth/signup` → 201 + `{"token": "eyJ...", "user": {"id": 42, "email": "...", "team_id": null}}`
- `PATCH /tasks/110/status` → 200 + `{"id": 110, "status": "DOING", ...}` (결정 #3)
- `PUT /tasks/110` → 200 + title·assignee_id 업데이트 (결정 #4)
- `GET /teams/{id}/messages?since=2026-05-13T14:27:00Z` → 해당 시각 이후 메시지만

**에러 응답 형식** (통일):
```json
{"error": {"code": "FORBIDDEN", "message": "권한이 없습니다"}}
```

**에러 코드 목록:**
| HTTP | code | 발생 조건 |
|------|------|-----------|
| 400 | VALIDATION_ERROR | 필드 형식 오류 |
| 400 | TOO_LONG | 메시지 1000자 초과 |
| 401 | INVALID_CREDENTIALS | 로그인 실패 (이메일 노출 금지) |
| 401 | TOKEN_EXPIRED | JWT 만료 또는 누락 |
| 403 | FORBIDDEN | 비멤버 접근 |
| 403 | NOT_OWNER | 타인 메시지 삭제 시도 |
| 404 | NOT_FOUND | 초대코드/리소스 없음 |
| 409 | EMAIL_TAKEN | 회원가입 중복 이메일 |

**초대코드 형식**: 정규식 `^[A-Z]{4}-[0-9]{4}$` 예: `FRNT-2026`

**'내 태스크' 정의**: `WHERE tasks.assignee_id = current_user_id` (creator_id 아님, 결정 #4)

**1인 1팀 redirect 규칙**: 로그인 후 `user.team_id = NULL` → 팀 선택 화면 강제. 직접 URL 입력 차단

## Non-functional Requirements

| 항목 | 내용 |
|------|------|
| **기술 스택** | Backend: FastAPI + SQLAlchemy / Frontend: Vanilla JS + Tailwind CDN |
| **DB** | 로컬: SQLite (자동 생성) / 배포: Neon PostgreSQL (Vercel Storage) |
| **반응형** | `< 768px`: 1컬럼 스와이프 + 햄버거 메뉴 / `768~1024px`: 헤더 통합 / `> 1024px`: 풀 레이아웃 |
| **모바일 칸반** | 컬럼 가로 스와이프, 카드 길게 누르기 → 상태 변경 메뉴, FAB(+) 우하단 |
| **모바일 채팅** | 풀스크린, 키보드 시 visualViewport로 메시지 영역 축소, 입력 포커스 시 폴링 2초 단축 |
| **성능** | API 100ms 이내, 칸반 드래그 50ms 이내 (정성) |
| **보안** | JWT Bearer 인증, bcrypt 해시, CORS 명시, 401 시 자동 /login redirect |
| **배포** | 로컬 일체형(StaticFiles), Vercel FE+BE 단일 프로젝트, main push 시 자동 배포 |
| **안정성** | Neon 자동 백업. 로컬 SQLite는 .gitignore 제외 |
| **확장성** | 단일 서버 단일 DB, 마이크로서비스 분리 안 함 (MVP 고정) |
| **관측성** | print 디버깅만. Sentry/로그 수집 없음 |

## Impact

- **새 파일**: `backend/`, `frontend/`, `api/index.py`, `requirements.txt`, `vercel.json`
- **DB 스키마** (SQLite 로컬 / Neon PostgreSQL 배포):
  - `users`: id, email, password_hash, **team_id FK→teams (nullable)**, created_at
  - `teams`: id, name, invite_code UNIQUE, owner_id FK→users, created_at
  - `tasks`: id, team_id FK, title, status(TODO/DOING/DONE), creator_id FK, **assignee_id FK→users (nullable)**, **created_at**
  - `messages`: id, team_id FK, user_id FK, content, created_at
- **API 18개** (Auth 4 + Team 5 + Task 6 + Chat 3):
  - Auth: POST /auth/signup, POST /auth/login, POST /auth/logout, GET /auth/me
  - Team: POST /teams, POST /teams/join, GET /teams/{id}, GET /teams/{id}/members, DELETE /teams/{id}/leave
  - Task: GET /teams/{id}/tasks, POST /teams/{id}/tasks, GET /tasks/{id}, PUT /tasks/{id}, PATCH /tasks/{id}/status, DELETE /tasks/{id}
  - Chat: GET /teams/{id}/messages, POST /teams/{id}/messages, DELETE /messages/{id}
- **외부 의존성**: Vercel, Neon (Vercel Storage), python-jose, passlib[bcrypt]
