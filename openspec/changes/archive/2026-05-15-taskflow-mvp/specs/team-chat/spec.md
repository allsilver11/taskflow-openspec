## ADDED Requirements

### Requirement: 메시지 전송
팀원은 팀 채팅방에 텍스트 메시지를 전송할 수 있다. 메시지는 최대 1000자로 제한된다.

#### Scenario: 정상 메시지 전송
- **WHEN** 팀원이 POST /teams/{id}/messages에 `{"content": "안녕하세요"}`를 전송하면
- **THEN** HTTP 201과 함께 `{"id": ..., "content": "안녕하세요", "user_id": ..., "team_id": ..., "created_at": "<ISO 형식>"}`를 반환한다

#### Scenario: 1000자 초과 메시지
- **WHEN** 1000자를 초과하는 content로 메시지를 전송하면
- **THEN** HTTP 422와 함께 `{"code": "MSG_TOO_LONG", "msg": "메시지는 1000자 이하여야 합니다"}`를 반환한다

#### Scenario: 빈 메시지
- **WHEN** 빈 content로 메시지를 전송하면
- **THEN** HTTP 422를 반환한다

### Requirement: 메시지 목록 조회 (폴링)
클라이언트는 5초마다 since 타임스탬프 이후의 새 메시지를 조회한다. 첫 로드 시에는 최근 50개를 반환한다.

#### Scenario: 증분 폴링
- **WHEN** GET /teams/{id}/messages?since=2024-01-01T12:00:00Z 를 요청하면
- **THEN** HTTP 200과 함께 해당 시각 이후의 메시지 배열을 반환한다

#### Scenario: 초기 로드
- **WHEN** since 파라미터 없이 GET /teams/{id}/messages를 요청하면
- **THEN** HTTP 200과 함께 최근 50개 메시지를 반환한다

#### Scenario: 새 메시지 없음
- **WHEN** since 이후 새 메시지가 없으면
- **THEN** HTTP 200과 함께 빈 배열 `[]`를 반환한다

### Requirement: 채팅 UI 자동 갱신
채팅 화면은 5초마다 자동으로 새 메시지를 폴링하여 화면에 추가한다. 발신자 이메일과 전송 시각(ISO → 로컬 형식)을 표시한다.

#### Scenario: 자동 폴링 표시
- **WHEN** 채팅 화면이 열려 있으면
- **THEN** 5초마다 새 메시지를 자동으로 가져와 메시지 목록 하단에 추가하고 스크롤한다

#### Scenario: 메시지 발신자 표시
- **WHEN** 메시지가 화면에 표시되면
- **THEN** 발신자 이메일과 전송 시각이 각 메시지에 함께 표시된다
