## Context

TaskFlow MVP 프론트엔드가 Vanilla JS + Tailwind CDN SPA로 구현되어 있다. 스토리보드 v2 와이어프레임과 대조한 결과 5개 화면 전반에 걸쳐 UX 세부 요소가 누락되어 있다. 백엔드 API는 변경 없이 프론트엔드만 수정한다.

## Goals / Non-Goals

**Goals:**
- 스토리보드 와이어프레임과 1:1 일치하는 UI 구현
- 멤버 페이지 (`#members`) 신규 구현
- API 호출 패턴은 유지하되 UI 상태 관리 강화

**Non-Goals:**
- 백엔드 API 변경
- 모바일 추가 개선 (이미 구현됨)
- 애니메이션/트랜지션 (MVP 범위 외)

## Decisions

### 1. 카드 인라인 입력 (모달 제거)
TODO 컬럼 `+` 클릭 시 카드 목록 상단에 인라인 입력 폼을 삽입. `Enter` 저장, `Esc` 취소.
- **Why**: 스토리보드 slide 17 명세. 모달보다 컨텍스트 유지에 유리.
- 담당자 선택 드롭다운 포함 (팀원 목록은 `GET /teams/{id}/members` 로 조회).

### 2. 카드 상세 모달 (클릭 시)
카드 클릭 → 제목·상태·assignee 수정 가능한 모달. 드래그 시작 시에는 모달 열리지 않음.
- `dragstart` 이벤트와 `click` 이벤트 충돌 방지: `dragging` 플래그로 구분.

### 3. 폴링 인디케이터
채팅 헤더에 `●` (정상) / `⚠` (실패) 상태 표시. 폴링 실패 시 exponential backoff (5s→10s→20s→60s).

### 4. 멤버 페이지
`#members` 라우트. `GET /teams/{id}/members` 로 팀원 목록 조회. owner는 ★ 표시.
헤더 탭: **칸반 / 채팅 / 멤버** 3탭.

### 5. 초대코드 복사
팀 생성 직후 초대코드를 크게 표시하고 📋 버튼으로 클립보드 복사. `navigator.clipboard.writeText()` 사용.

## Risks / Trade-offs

- **드래그 vs 클릭 충돌**: `mousedown` → `mousemove` 발생 시 드래그로 판단, 짧은 클릭은 모달 오픈. `dragging` boolean 플래그로 관리.
- **인라인 입력 + 멤버 조회**: 인라인 입력 폼 열릴 때 멤버 목록을 한 번 fetch. 팀원 수가 적으므로 성능 이슈 없음.
- **클립보드 API**: HTTPS에서만 동작. 프로덕션(Vercel)에서는 정상, 로컬 http://에서는 fallback으로 `document.execCommand('copy')` 사용.
