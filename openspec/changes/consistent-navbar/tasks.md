## 1. NavBar 공통 컴포넌트 생성

- [ ] 1.1 `frontend/js/navbar.js` — NavBar 객체 생성
- [ ] 1.2 `frontend/js/navbar.js` — render(container, {teamName, activePage, onLogout}) 메서드 구현
- [ ] 1.3 `frontend/js/navbar.js` — 헤더 3-section 레이아웃: 좌(로고+팀명) / 중(탭3개 flex-1 center) / 우(email+로그아웃)
- [ ] 1.4 `frontend/js/navbar.js` — 탭 고정 너비 w-16, 활성=하단 흰색 밑줄, 비활성=teal-200
- [ ] 1.5 `frontend/js/navbar.js` — 모바일 햄버거 버튼 + 슬라이드 메뉴 HTML 포함
- [ ] 1.6 `frontend/index.html` — navbar.js 스크립트 태그 추가 (router.js 이전)

## 2. 각 페이지에 NavBar 적용

- [ ] 2.1 `frontend/pages/kanban.js` — 헤더 HTML 제거, NavBar.render() 호출로 교체 (activePage='kanban')
- [ ] 2.2 `frontend/pages/kanban.js` — 헤더 관련 이벤트 바인딩 코드 제거 (NavBar 내부로 이동)
- [ ] 2.3 `frontend/pages/chat.js` — 헤더 HTML 제거, NavBar.render() 호출로 교체 (activePage='chat')
- [ ] 2.4 `frontend/pages/chat.js` — 헤더 관련 이벤트 바인딩 코드 제거
- [ ] 2.5 `frontend/pages/members.js` — 헤더 HTML 제거, NavBar.render() 호출로 교체 (activePage='members')
- [ ] 2.6 `frontend/pages/members.js` — 헤더 관련 이벤트 바인딩 코드 제거
