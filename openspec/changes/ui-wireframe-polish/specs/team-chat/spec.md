## MODIFIED Requirements

### Requirement: 폴링 상태 인디케이터
채팅 헤더에 폴링 연결 상태를 실시간으로 표시한다.

#### Scenario: 정상 폴링
- **WHEN** 5초 폴링이 정상 동작 중이면
- **THEN** 헤더에 `● 5초마다 새로고침` 녹색 인디케이터가 표시된다

#### Scenario: 폴링 실패
- **WHEN** 폴링 요청이 실패하면
- **THEN** 헤더가 `⚠ 연결 끊김 · 재시도 중`으로 변경된다
- **THEN** Exponential backoff (5s→10s→20s→60s)로 재시도한다
- **THEN** 재연결 성공 시 `● 5초마다 새로고침`으로 복구된다

### Requirement: 빈 채팅 Empty State
메시지가 없을 때 첫 메시지 작성을 유도하는 화면을 표시한다.

#### Scenario: 빈 채팅 표시
- **WHEN** 팀에 메시지가 0건이면
- **THEN** 💬 아이콘과 "아직 대화가 없습니다", "첫 메시지를 보내 팀원과 대화를 시작하세요" 텍스트를 표시한다
- **THEN** 입력창 placeholder가 "👋 첫 메시지를 입력해보세요…"로 변경된다
