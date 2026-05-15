## Context

Vanilla JS SPA. 현재 kanban.js / chat.js / members.js 각각 헤더 HTML을 중복 정의하고 있다. 탭 활성 상태를 `bg-teal-500`으로 표현해 버튼 크기가 변하는 레이아웃 시프트가 발생한다.

## Goals / Non-Goals

**Goals:**
- 단일 `NavBar` 객체로 헤더 통합 → 모든 페이지 동일한 구조
- 탭 전환 시 레이아웃 변화 없음

**Non-Goals:**
- 헤더 디자인 전면 변경
- 반응형 구조 변경

## Decisions

### 1. NavBar 공통 컴포넌트 (`frontend/js/navbar.js`)

```javascript
const NavBar = {
  render(container, { teamName, activePage }) { ... }
};
```

- `activePage`: `'kanban' | 'chat' | 'members'`
- 헤더 HTML을 `container` (기존 헤더 div)에 삽입
- 이벤트 바인딩 (로그아웃, 햄버거) 포함

### 2. 탭 레이아웃 고정

```
[칸반] [채팅] [멤버]
```

각 탭: `w-16 text-center text-sm py-1`
- 활성: `text-white border-b-2 border-white font-medium`
- 비활성: `text-teal-200 hover:text-white`
- 배경색 변화 없음 → 크기 고정

### 3. 전체 헤더 구조 (고정)

```
bg-teal-600 flex justify-between items-center px-4 py-3
├── 좌측: [☰모바일] TaskFlow | TeamName
├── 중앙(데스크탑): [칸반] [채팅] [멤버]  ← 절대위치로 중앙 고정
└── 우측: email 로그아웃
```

실제로는 `flex justify-between`에서 3-section 구조:
- 좌: 로고+팀명 (고정 min-w)
- 중: 탭 3개 (flex-1 justify-center)
- 우: 이메일+로그아웃 (고정 min-w, text-right)

이렇게 하면 탭이 항상 중앙에 위치하고 레이아웃이 변하지 않는다.

### 4. 모바일 햄버거 메뉴 통합

NavBar.render()가 모바일 메뉴 오버레이도 함께 렌더링. 각 페이지에서 중복 코드 제거.

## Risks / Trade-offs

- 기존 페이지에서 헤더 이벤트 바인딩 코드 제거 시 누락 주의 → NavBar.render()가 bind까지 담당
