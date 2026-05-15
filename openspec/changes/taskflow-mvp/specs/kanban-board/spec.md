## ADDED Requirements

### Requirement: 태스크 생성
팀원은 칸반 컬럼(TODO/DOING/DONE)에 태스크를 추가할 수 있다. 새 태스크의 기본 상태는 TODO다.

#### Scenario: 정상 태스크 생성
- **WHEN** 팀원이 POST /teams/{id}/tasks에 `{"title": "태스크명"}`을 전송하면
- **THEN** HTTP 201과 함께 `{"id": ..., "title": "태스크명", "status": "TODO", "team_id": ..., "creator_id": ...}`를 반환한다

#### Scenario: 제목 누락
- **WHEN** title 없이 태스크 생성을 요청하면
- **THEN** HTTP 422를 반환한다

### Requirement: 태스크 목록 조회
팀원은 팀의 전체 태스크 목록을 상태별로 조회할 수 있다.

#### Scenario: 태스크 목록 반환
- **WHEN** 팀원이 GET /teams/{id}/tasks를 요청하면
- **THEN** HTTP 200과 함께 해당 팀의 태스크 배열을 반환한다

#### Scenario: 빈 칸반 보드
- **WHEN** 태스크가 없는 팀에서 목록을 조회하면
- **THEN** HTTP 200과 함께 빈 배열 `[]`를 반환한다

### Requirement: 태스크 상태 변경
팀원은 태스크를 TODO → DOING → DONE으로 드래그하여 상태를 변경할 수 있다. 상태는 세 값 중 하나여야 한다.

#### Scenario: 정상 상태 변경
- **WHEN** 팀원이 PUT /tasks/{id}에 `{"status": "DOING"}`을 전송하면
- **THEN** HTTP 200과 함께 업데이트된 태스크를 반환한다

#### Scenario: 유효하지 않은 상태값
- **WHEN** TODO/DOING/DONE 이외의 값으로 상태 변경을 시도하면
- **THEN** HTTP 422를 반환한다

### Requirement: 태스크 제목 수정
팀원은 태스크의 제목을 수정할 수 있다.

#### Scenario: 제목 수정
- **WHEN** 팀원이 PUT /tasks/{id}에 `{"title": "새 제목"}`을 전송하면
- **THEN** HTTP 200과 함께 업데이트된 태스크를 반환한다

### Requirement: 태스크 삭제
팀원은 태스크를 삭제할 수 있다.

#### Scenario: 정상 삭제
- **WHEN** 팀원이 DELETE /tasks/{id}를 요청하면
- **THEN** HTTP 204를 반환하고 해당 태스크가 목록에서 사라진다

#### Scenario: 존재하지 않는 태스크 삭제
- **WHEN** 없는 태스크 ID로 DELETE를 요청하면
- **THEN** HTTP 404를 반환한다

### Requirement: 드래그앤드롭 UI
칸반 화면은 HTML5 Drag API로 태스크 카드를 컬럼 간 드래그하여 상태를 변경한다. 드래그 반응은 50ms 이내여야 한다.

#### Scenario: 드래그로 상태 이동
- **WHEN** 사용자가 TODO 컬럼의 태스크 카드를 DOING 컬럼에 드롭하면
- **THEN** 카드가 DOING 컬럼으로 이동하고 PUT /tasks/{id} API가 호출되어 서버에 저장된다
