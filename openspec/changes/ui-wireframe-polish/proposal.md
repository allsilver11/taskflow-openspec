## Why

TaskFlow MVP 구현 시 스토리보드 v2의 와이어프레임 세부 UI가 반영되지 않았다. 로그인 로딩 상태, 초대코드 복사, 칸반 카드 메타정보, 인라인 입력, 카드 상세 모달, 채팅 폴링 인디케이터, 멤버 페이지 등 사용성에 직접 영향을 주는 요소들이 누락된 상태로 배포되어 있다.

## What Changes

- **로그인/회원가입**: 처리 중 로딩 버튼 상태, 인라인 필드 에러 표시 개선
- **팀 선택**: 팀 생성 후 초대코드 크게 표시 + 📋 복사 버튼, 합류 후 팀 미리보기
- **칸반**: 헤더 탭에 멤버 추가, 카드에 `#id · @assignee` 표시, 컬럼 카드 수 배지, 인라인 태스크 입력(모달→인라인), 담당자 선택, 드래그 중 컬럼 하이라이트, 카드 클릭 상세/수정 모달, 삭제 확인 다이얼로그, empty state, **삭제 권한 UI**(owner/creator만 ✕·🗑 표시), **담당자 드롭다운 역할 표시**(이메일 (owner/member))
- **채팅**: 폴링 상태 인디케이터(●/⚠), 빈 채팅 empty state, 폴링 실패 재시도 표시
- **멤버 페이지**: `#members` 라우트 신규 구현 — 팀원 목록, ★owner 구분

## Capabilities

### New Capabilities
- `member-page`: 팀 멤버 목록 화면 (`#members` 라우트) — owner/member 구분, 가입일 표시

### Modified Capabilities
- `user-auth`: 로딩 상태, 인라인 에러 UX 개선
- `team-management`: 초대코드 복사 버튼, 합류 미리보기
- `kanban-board`: 카드 메타정보, 인라인 입력, 상세 모달, 드래그 하이라이트, empty state
- `team-chat`: 폴링 인디케이터, empty state, 연결 끊김 표시

## Out of Scope

- API 변경 없음 — 순수 프론트엔드 UI 변경
- assignee 드롭다운 팀원 목록 API 호출은 포함 (GET /teams/{id}/members)
- 카드 상세 모달에서 담당자를 팀원 목록으로 선택하는 기능 포함

## Impact

- **변경 파일**: `frontend/pages/login.js`, `frontend/pages/teams.js`, `frontend/pages/kanban.js`, `frontend/pages/chat.js`
- **신규 파일**: `frontend/pages/members.js`
- **라우터 추가**: `#members` 라우트
- **API 변경 없음**
