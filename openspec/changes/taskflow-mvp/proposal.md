## Why

소규모 팀은 태스크 관리와 커뮤니케이션 도구가 분리되어 있어 컨텍스트 전환 비용이 높다. TaskFlow MVP는 칸반 보드와 실시간 채팅을 한 화면에 통합하여 3-5인 팀이 업무 진행을 단일 인터페이스에서 추적할 수 있게 한다.

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

## Impact

- **새 파일**: `backend/` (FastAPI 앱), `frontend/` (Vanilla JS + Tailwind), `requirements.txt`, `vercel.json`
- **DB**: SQLite (로컬) / Neon PostgreSQL (배포) — SQLAlchemy로 양쪽 호환
- **API**: 18개 엔드포인트 (Auth 4 + Team 4 + Task 6 + Chat 4)
- **외부 의존성**: Vercel, Neon (Vercel Storage), python-jose, passlib[bcrypt]
