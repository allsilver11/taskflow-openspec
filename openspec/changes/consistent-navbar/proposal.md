## Why

칸반/채팅/멤버 화면 전환 시 헤더 탭의 활성 상태가 배경색(`bg-teal-500`)으로 표시되어 버튼 크기가 변하고, 페이지마다 헤더 HTML이 중복 정의되어 구조가 미묘하게 달라진다. 이로 인해 탭 전환 시 메뉴바 요소들의 위치가 흔들려 사용자가 불편함을 느낀다.

## What Changes

- **공통 NavBar 컴포넌트** 신규 생성 (`frontend/js/navbar.js`) — 모든 페이지가 동일한 헤더를 공유
- **탭 고정 너비** — `w-16 text-center` 로 3탭 모두 동일 크기 유지
- **활성 탭 표시** — 배경색 제거 → 하단 흰색 밑줄(`border-b-2 border-white`)로 변경 (레이아웃 변화 없음)
- **헤더 포맷 고정** — `TaskFlow | 팀명 ···· [칸반] [채팅] [멤버] ···· email 로그아웃`
- 기존 kanban.js / chat.js / members.js의 헤더 HTML 중복 코드 제거

## Capabilities

### Modified Capabilities
- `kanban-board`: 헤더 NavBar 컴포넌트로 교체
- `team-chat`: 헤더 NavBar 컴포넌트로 교체
- `member-page`: 헤더 NavBar 컴포넌트로 교체

## Out of Scope

- 모바일 햄버거 메뉴는 NavBar 컴포넌트에 포함 (동일 포맷 유지)
- 헤더 색상/높이 변경 없음

## Impact

- **신규 파일**: `frontend/js/navbar.js`
- **변경 파일**: `frontend/pages/kanban.js`, `frontend/pages/chat.js`, `frontend/pages/members.js`, `frontend/index.html`
- **API 변경 없음**
