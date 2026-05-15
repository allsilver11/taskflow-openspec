## 1. 로그인/회원가입 화면 분리

- [x] 1.1 `frontend/pages/login.js` — mode 상태 추가 ('login'|'signup'), 모드별 렌더링 분기
- [x] 1.2 `frontend/pages/login.js` — 로그인 모드: 제목 "로그인", 버튼 "로그인", 하단 "계정이 없으신가요? 회원가입" 링크
- [x] 1.3 `frontend/pages/login.js` — 회원가입 모드: 제목 "회원가입", 버튼 "가입하기", 하단 "이미 계정이 있으신가요? 로그인" 링크
- [x] 1.4 `frontend/pages/login.js` — 에러를 빨간 배경 박스(bg-red-50 border-red-300) 형태로 변경

## 2. 팀 선택 레이아웃

- [x] 2.1 `frontend/pages/teams.js` — 팀 미가입 폼을 2컬럼 나란히 레이아웃으로 변경
- [x] 2.2 `frontend/pages/teams.js` — 초대코드 에러: 형식/미존재 → 빨간 박스, 다른팀소속 → 노란 박스

## 3. 칸반 컬럼 색상

- [x] 3.1 `frontend/pages/kanban.js` — TODO 컬럼 헤더+배경: bg-yellow-100/bg-yellow-50
- [x] 3.2 `frontend/pages/kanban.js` — DOING 컬럼 헤더+배경: bg-blue-100/bg-blue-50
- [x] 3.3 `frontend/pages/kanban.js` — DONE 컬럼 헤더+배경: bg-green-100/bg-green-50

## 4. 카드 인라인 입력 (컬럼 내부)

- [x] 4.1 `frontend/pages/kanban.js` — kb-inline-form 모달 제거
- [x] 4.2 `frontend/pages/kanban.js` — + 클릭 시 col-TODO 컬럼 상단에 인라인 폼 div 삽입
- [x] 4.3 `frontend/pages/kanban.js` — 인라인 폼: 제목 입력 + 담당자 드롭다운 + Enter저장/Esc취소

## 5. 카드 상세 모달 2컬럼 레이아웃

- [x] 5.1 `frontend/pages/kanban.js` — 모달을 2컬럼으로 재구성 (좌: 정보, 우: 버튼)
- [x] 5.2 `frontend/pages/kanban.js` — 우측 버튼: 저장(teal), 다른 담당자 지정(outline), 삭제(red)
- [x] 5.3 `frontend/pages/kanban.js` — 좌측: #id 제목, 상태 버튼 가로, 담당자/생성자/생성시각 표시

## 6. 헤더 TaskFlow 로고

- [x] 6.1 `frontend/pages/kanban.js` — 헤더 좌측에 "TaskFlow" 로고 텍스트 추가
- [x] 6.2 `frontend/pages/chat.js` — 헤더 좌측에 "TaskFlow" 로고 텍스트 추가
- [x] 6.3 `frontend/pages/members.js` — 헤더 좌측에 "TaskFlow" 로고 텍스트 추가

## 7. 팀 멤버 사이드 패널 (데스크탑)

- [x] 7.1 `frontend/pages/kanban.js` — xl: 이상 화면에서 멤버 탭 클릭 시 우측 사이드 패널 toggle
- [x] 7.2 `frontend/pages/kanban.js` — 사이드 패널: GET /teams/{id}/members 호출, ★owner 구분
- [x] 7.3 `frontend/pages/kanban.js` — 패널 열릴 때 칸반 컬럼 영역 축소

## 8. 채팅 1000자 카운터 하단 바

- [x] 8.1 `frontend/pages/chat.js` — 900자 미만: 카운터 숨김
- [x] 8.2 `frontend/pages/chat.js` — 900-1000자: 우측 숫자 표시 (노란색)
- [x] 8.3 `frontend/pages/chat.js` — 1000자 초과: 하단 전체 바 표시 `{n} / 1,000  {초과}자 초과  전송(불가)`
