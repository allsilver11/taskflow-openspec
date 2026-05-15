## 1. 로그인/회원가입 UX 개선

- [x] 1.1 `frontend/pages/login.js` — 처리 중 버튼 로딩 상태 ("처리중…" + disabled)
- [x] 1.2 `frontend/pages/login.js` — 인라인 필드별 에러 표시 (이메일 필드 아래, 비밀번호 필드 아래)
- [x] 1.3 `frontend/pages/login.js` — 이메일 형식 클라이언트 검증 (@ 포함 여부)

## 2. 팀 선택 UX 개선

- [x] 2.1 `frontend/pages/teams.js` — 팀 생성 후 초대코드 크게 표시 화면 (별도 step)
- [x] 2.2 `frontend/pages/teams.js` — 📋 복사 버튼 (navigator.clipboard + execCommand fallback)
- [x] 2.3 `frontend/pages/teams.js` — 복사 후 "✓ 복사됨" 2초 피드백
- [x] 2.4 `frontend/pages/teams.js` — 합류 성공 후 팀 미리보기 (팀명, 멤버 수 표시)

## 3. 칸반 카드 메타정보

- [x] 3.1 `frontend/pages/kanban.js` — 카드에 `#id · @assignee` 표시
- [x] 3.2 `frontend/pages/kanban.js` — assignee 없는 카드에 `⚠미할당` 뱃지
- [x] 3.3 `frontend/pages/kanban.js` — 컬럼 헤더 카드 수 배지 (`TODO · 3`)

## 4. 칸반 인라인 태스크 입력

- [x] 4.1 `frontend/pages/kanban.js` — 모달 제거, 인라인 입력 폼으로 교체
- [x] 4.2 `frontend/pages/kanban.js` — 인라인 폼에 담당자 선택 드롭다운 추가
- [x] 4.3 `frontend/pages/kanban.js` — 드롭다운에서 팀원 목록 조회 (GET /teams/{id}/members)
- [x] 4.4 `frontend/pages/kanban.js` — Enter 저장, Esc 취소

## 5. 칸반 드래그 UX

- [x] 5.1 `frontend/pages/kanban.js` — 드래그 중 대상 컬럼 하이라이트 (dragover 시 배경색 변경)
- [x] 5.2 `frontend/pages/kanban.js` — 드래그 중 "⬇ 여기에 놓기" 안내 텍스트

## 6. 카드 상세/수정 모달

- [x] 6.1 `frontend/pages/kanban.js` — 드래그 vs 클릭 구분 (dragging 플래그)
- [x] 6.2 `frontend/pages/kanban.js` — 카드 클릭 시 상세 모달 오픈
- [x] 6.3 `frontend/pages/kanban.js` — 모달: 제목 수정 (PUT /tasks/{id})
- [x] 6.4 `frontend/pages/kanban.js` — 모달: 상태 변경 버튼 (PATCH /tasks/{id}/status)
- [x] 6.5 `frontend/pages/kanban.js` — 모달: 담당자 변경 드롭다운
- [x] 6.6 `frontend/pages/kanban.js` — 모달: 생성자·생성시각 표시
- [x] 6.7 `frontend/pages/kanban.js` — 모달: 🗑 삭제 버튼 → 확인 다이얼로그

## 7. 카드 삭제 확인 + Empty State

- [x] 7.1 `frontend/pages/kanban.js` — ✕ 버튼 클릭 시 확인 다이얼로그 표시
- [x] 7.2 `frontend/pages/kanban.js` — 빈 컬럼 📋 empty state
- [x] 7.3 `frontend/pages/kanban.js` — TODO 빈 컬럼에 "+ 첫 태스크 만들기" CTA

## 8. 채팅 폴링 UX

- [x] 8.1 `frontend/pages/chat.js` — 헤더에 폴링 상태 인디케이터 (● / ⚠)
- [x] 8.2 `frontend/pages/chat.js` — 폴링 실패 시 exponential backoff (5→10→20→60초)
- [x] 8.3 `frontend/pages/chat.js` — 재연결 성공 시 인디케이터 복구
- [x] 8.4 `frontend/pages/chat.js` — 빈 채팅 empty state (💬 아이콘 + 안내 문구)

## 9. 헤더 탭 및 멤버 페이지

- [x] 9.1 `frontend/js/router.js` — `#members` 라우트 추가
- [x] 9.2 `frontend/pages/kanban.js`, `chat.js` — 헤더 탭 3개로 변경 (칸반/채팅/멤버)
- [x] 9.3 `frontend/pages/members.js` — 신규 파일: 팀 멤버 목록 화면
- [x] 9.4 `frontend/pages/members.js` — GET /teams/{id}/members 호출 후 목록 렌더링
- [x] 9.5 `frontend/pages/members.js` — ★ owner 구분, 가입일 표시
- [x] 9.6 `frontend/index.html` — members.js 스크립트 태그 추가

## 10. 권한 UI 및 역할 표시

- [x] 10.1 `frontend/pages/kanban.js` — _loadMembers에서 isOwner 판별 (is_owner 필드)
- [x] 10.2 `frontend/pages/kanban.js` — 카드 ✕ 버튼: creator 또는 isOwner인 경우만 표시
- [x] 10.3 `frontend/pages/kanban.js` — 상세 모달 🗑 버튼: creator 또는 isOwner인 경우만 표시
- [x] 10.4 `frontend/pages/kanban.js` — 담당자 드롭다운에 역할 표시 (이메일 (owner/member))
