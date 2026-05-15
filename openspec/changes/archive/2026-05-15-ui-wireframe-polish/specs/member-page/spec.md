## ADDED Requirements

### Requirement: 팀 멤버 목록 화면
`#members` 라우트에서 현재 팀의 멤버 목록을 조회한다. owner는 ★ 배지로 구분한다.

#### Scenario: 멤버 목록 표시
- **WHEN** 인증된 팀원이 `#members`로 이동하면
- **THEN** `GET /teams/{id}/members` 호출 후 팀원 이메일·역할(owner/member)·가입일을 목록으로 표시한다

#### Scenario: owner 구분
- **WHEN** 멤버 목록이 표시되면
- **THEN** `is_owner: true`인 멤버에 ★ 배지를 표시하고 목록 최상단에 위치한다

#### Scenario: 헤더 탭 멤버 탭 추가
- **WHEN** 칸반 또는 채팅 화면 헤더를 보면
- **THEN** 칸반 / 채팅 / 멤버 3개 탭이 표시되고 현재 화면이 하이라이트된다
