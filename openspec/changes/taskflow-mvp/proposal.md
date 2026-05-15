## Why

소규모 팀은 태스크 관리와 커뮤니케이션 도구가 분리되어 있어 컨텍스트 전환 비용이 높다. TaskFlow MVP는 칸반 보드와 실시간 채팅을 한 화면에 통합하여 3-5인 팀이 업무 진행을 단일 인터페이스에서 추적할 수 있게 한다.

### 페르소나

| 페르소나 | 니즈 |
|----------|------|
| **팀 리더** (3-5인 팀 운영) | 한 화면 대시보드로 진행 상황 파악 + 우선순위 조정 |
| **팀원** | 내 태스크 빠른 확인, 칸반 드래그, 짧은 채팅으로 빠른 의사결정 |
| **신규 합류자** | 초대코드로 가입, 기존 칸반+채팅 이력 1분 안에 파악 |

### 사용 시나리오

1. 리더가 팀 생성 + 초대코드 발급 → 멤버 합류 → 칸반에 태스크 추가 → 진행 변경 → 채팅으로 합의
2. 신규 합류자 가입 → 초대코드로 팀 진입 → 칸반 + 채팅 이력 1분 안에 파악
3. PC에서 작성, 모바일에서 진행 확인. 자동 배포된 URL로 어디서나 접근

## What Changes

- 신규 프로젝트: FastAPI 백엔드 + Vanilla JS/Tailwind 프론트엔드 풀스택 앱 구축
- 회원가입/로그인 + JWT 인증 시스템
- 초대코드 기반 팀 생성 및 합류
- TODO/DOING/DONE 3컬럼 칸반 보드 (드래그앤드롭)
- 5초 폴링 기반 팀 채팅
- Vercel 배포 (FE+BE 일체형) + Vercel Storage Neon 연동

## Capabilities

### New Capabilities
- `user-auth`: 회원가입, 로그인, JWT 발급, bcrypt 비밀번호 해시, /auth/me, 로그아웃
- `team-management`: 팀 생성, 초대코드 발급/합류, 멤버 목록 조회
- `kanban-board`: TODO/DOING/DONE 3컬럼 태스크 관리, 드래그앤드롭 상태 이동, 추가/삭제
- `team-chat`: 팀 단위 메시지 송수신, 5초 폴링, 발신자+시각 표시
- `deployment`: Vercel FE+BE 일체형 배포, Vercel Storage Neon DB 연동

### Modified Capabilities
<!-- 기존 스펙 없음 — 신규 프로젝트 -->

## Out of Scope

- **알림**: 이메일/SMS/푸시 알림 없음. 채팅 폴링으로 대체
- **파일 첨부**: 이미지/파일 업로드 없음. 텍스트 채팅만
- **검색**: 전문 검색 없음. 단순 SELECT 조회만
- **권한 세분화**: 팀 admin/member 구분만. 페이지별 권한 없음
- **다국어**: 한글 UI만. 다국어 리소스 분리 없음
- **WebSocket**: 실시간 메시지 안 함. 5초 폴링으로 대체
- **테스트 자동화**: pytest/jest 자동 테스트 없음. 수동 동작 확인만

## ACME

### Assumptions (전제 — 검증 안 함)

- 한국어 사용자만
- 팀당 5명 이내, 동시 최대 50명
- 최신 Chrome + Safari 브라우저
- 초대코드를 가진 사람은 신뢰할 수 있는 팀원으로 간주 (별도 승인 없음)
- JWT는 localStorage에 저장됨을 전제 (서버 측 검증 불필요)

### Constraints (제약 — 반드시 지킴)

- Vercel / Neon 무료 티어 한도 내에서 동작
- 비밀번호는 bcrypt 해시 저장 의무 (평문 저장 금지)
- JWT 유효기간 24h, 갱신 엔드포인트 없음
- 메시지 최대 1000자
- CORS 허용 도메인 명시 필수

### Metrics (성공 측정 기준)

- API 응답 100ms 이내
- 칸반 드래그 반응 50ms 이내
- Vercel 배포 완료 5분 이내
- 신규 합류자 칸반 + 채팅 이력 파악 1분 이내
- 채팅 폴링 5초 간격 정상 동작

### Examples (AI가 추측 못 하게 고정)

- `POST /auth/signup` → HTTP 201 + `{"token": "<jwt>", "user": {...}}`
- 초대코드 형식: `ABCD-1234` (영숫자 4자 + 하이픈 + 숫자 4자)
- 태스크 상태값: `TODO` / `DOING` / `DONE` (대문자 고정)
- 시각 형식: ISO 8601 (`2024-01-01T12:00:00Z`)
- 에러 응답 형식: `{"code": "ERROR_CODE", "msg": "한글 설명"}`

## Non-functional Requirements

| 항목 | 내용 |
|------|------|
| **기술 스택** | Backend: FastAPI + SQLAlchemy / Frontend: Vanilla JS + Tailwind CDN |
| **DB** | 로컬: SQLite (자동 생성) / 배포: Neon PostgreSQL (Vercel Storage) |
| **성능** | API 100ms 이내, 칸반 드래그 50ms 이내 |
| **보안** | JWT Bearer 인증, bcrypt 해시, CORS 허용 도메인 명시 |
| **배포** | 로컬 일체형(StaticFiles), Vercel FE+BE 단일 프로젝트 |
| **안정성** | Neon 자동 백업. 로컬 SQLite는 .gitignore 제외 |
| **확장성** | 단일 서버 단일 DB, 마이크로서비스 분리 안 함 (MVP 고정) |
| **관측성** | print 디버깅만. Sentry/로그 수집 없음 |

## Impact

- **새 파일**: `backend/` (FastAPI 앱), `frontend/` (Vanilla JS + Tailwind), `requirements.txt`, `vercel.json`
- **DB**: SQLite (로컬) / Neon PostgreSQL (배포) — SQLAlchemy로 양쪽 호환
- **API**: 18개 엔드포인트 (Auth 4 + Team 4 + Task 6 + Chat 4)
- **외부 의존성**: Vercel, Neon (Vercel Storage), python-jose, passlib[bcrypt]
