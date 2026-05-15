## ADDED Requirements

### Requirement: 회원가입
시스템은 이메일과 비밀번호로 신규 사용자를 등록해야 한다. 비밀번호는 bcrypt로 해시하여 저장하고, 성공 시 JWT를 반환한다.

#### Scenario: 정상 회원가입
- **WHEN** POST /auth/signup에 유효한 이메일과 비밀번호(8자 이상)를 전송하면
- **THEN** HTTP 201과 함께 `{"token": "<jwt>", "user": {"id": ..., "email": ...}}`를 반환한다

#### Scenario: 중복 이메일 가입 시도
- **WHEN** 이미 존재하는 이메일로 POST /auth/signup을 요청하면
- **THEN** HTTP 409와 함께 `{"code": "EMAIL_EXISTS", "msg": "이미 사용 중인 이메일입니다"}`를 반환한다

#### Scenario: 비밀번호 미달
- **WHEN** 8자 미만 비밀번호로 가입 시도하면
- **THEN** HTTP 422와 함께 유효성 검사 오류를 반환한다

### Requirement: 로그인
시스템은 이메일/비밀번호로 사용자를 인증하고 JWT를 발급해야 한다. JWT 유효기간은 24시간이며 갱신 엔드포인트는 제공하지 않는다.

#### Scenario: 정상 로그인
- **WHEN** POST /auth/login에 올바른 이메일과 비밀번호를 전송하면
- **THEN** HTTP 200과 함께 `{"token": "<jwt>", "user": {"id": ..., "email": ...}}`를 반환한다

#### Scenario: 잘못된 비밀번호
- **WHEN** 존재하는 이메일에 틀린 비밀번호로 로그인 시도하면
- **THEN** HTTP 401과 함께 `{"code": "INVALID_CREDENTIALS", "msg": "이메일 또는 비밀번호가 올바르지 않습니다"}`를 반환한다

#### Scenario: 존재하지 않는 이메일
- **WHEN** 등록되지 않은 이메일로 로그인 시도하면
- **THEN** HTTP 401과 동일한 INVALID_CREDENTIALS 오류를 반환한다 (이메일 존재 여부 노출 금지)

### Requirement: 내 정보 조회
인증된 사용자는 현재 토큰의 사용자 정보를 조회할 수 있다.

#### Scenario: 유효한 토큰으로 조회
- **WHEN** 유효한 JWT를 Bearer 헤더에 포함하여 GET /auth/me를 요청하면
- **THEN** HTTP 200과 함께 `{"id": ..., "email": ..., "created_at": "<ISO 형식>"}`를 반환한다

#### Scenario: 토큰 없이 조회
- **WHEN** Authorization 헤더 없이 GET /auth/me를 요청하면
- **THEN** HTTP 401을 반환한다

### Requirement: 로그아웃
클라이언트 측에서 JWT를 삭제하여 로그아웃한다. 서버는 토큰을 블랙리스트에 추가하지 않는다.

#### Scenario: 로그아웃 요청
- **WHEN** POST /auth/logout을 요청하면
- **THEN** HTTP 200과 함께 `{"msg": "로그아웃 되었습니다"}`를 반환한다 (클라이언트가 localStorage에서 토큰 삭제)
