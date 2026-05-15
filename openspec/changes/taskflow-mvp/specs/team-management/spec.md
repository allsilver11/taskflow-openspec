## ADDED Requirements

### Requirement: 팀 생성
인증된 사용자는 팀을 생성할 수 있다. 생성 시 8자리 초대코드(`XXXX-XXXX` 형식)가 자동 발급되며, 생성자는 owner로 team_members에 자동 등록된다.

#### Scenario: 정상 팀 생성
- **WHEN** 인증된 사용자가 POST /teams에 `{"name": "팀명"}`을 전송하면
- **THEN** HTTP 201과 함께 `{"id": ..., "name": "팀명", "invite_code": "ABCD-1234", "owner_id": ...}`를 반환한다

#### Scenario: 팀명 누락
- **WHEN** name 없이 POST /teams를 요청하면
- **THEN** HTTP 422를 반환한다

### Requirement: 내 팀 목록 조회
인증된 사용자는 자신이 속한 팀 목록을 조회할 수 있다.

#### Scenario: 팀 목록 반환
- **WHEN** 인증된 사용자가 GET /teams를 요청하면
- **THEN** HTTP 200과 함께 사용자가 속한 팀 배열을 반환한다

#### Scenario: 팀 없는 신규 사용자
- **WHEN** 아직 어떤 팀에도 속하지 않은 사용자가 GET /teams를 요청하면
- **THEN** HTTP 200과 함께 빈 배열 `[]`를 반환한다

### Requirement: 초대코드로 팀 합류
사용자는 초대코드를 입력하여 기존 팀에 합류할 수 있다. 합류 시 team_members에 등록된다.

#### Scenario: 유효한 초대코드로 합류
- **WHEN** 인증된 사용자가 POST /teams/join에 `{"invite_code": "ABCD-1234"}`를 전송하면
- **THEN** HTTP 200과 함께 해당 팀 정보를 반환하고 team_members에 추가된다

#### Scenario: 이미 가입된 팀의 초대코드
- **WHEN** 이미 소속된 팀의 초대코드로 합류를 시도하면
- **THEN** HTTP 200과 함께 팀 정보를 반환한다 (중복 등록하지 않음)

#### Scenario: 존재하지 않는 초대코드
- **WHEN** 유효하지 않은 초대코드로 합류를 시도하면
- **THEN** HTTP 404와 함께 `{"code": "TEAM_NOT_FOUND", "msg": "초대코드가 올바르지 않습니다"}`를 반환한다

### Requirement: 팀 멤버 목록 조회
팀원은 해당 팀의 멤버 목록을 조회할 수 있다.

#### Scenario: 멤버 목록 반환
- **WHEN** 팀에 속한 사용자가 GET /teams/{id}/members를 요청하면
- **THEN** HTTP 200과 함께 `[{"id": ..., "email": ...}, ...]` 형태의 멤버 배열을 반환한다

#### Scenario: 팀에 속하지 않은 사용자의 조회 시도
- **WHEN** 해당 팀의 멤버가 아닌 사용자가 GET /teams/{id}/members를 요청하면
- **THEN** HTTP 403을 반환한다
