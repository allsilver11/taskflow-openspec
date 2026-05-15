## ADDED Requirements

### Requirement: 로컬 개발 환경
개발자는 단일 명령으로 로컬 서버를 실행할 수 있다. SQLite DB가 자동 생성되며 별도 DB 설정이 필요 없다.

#### Scenario: 로컬 서버 시작
- **WHEN** `uvicorn api.index:app --reload`를 실행하면
- **THEN** http://localhost:8000에서 앱이 실행되고 `taskflow.db` SQLite 파일이 자동 생성된다

#### Scenario: 정적 파일 서빙
- **WHEN** 브라우저에서 http://localhost:8000을 접속하면
- **THEN** FastAPI StaticFiles가 `frontend/` 디렉토리의 HTML/JS/CSS를 서빙한다

### Requirement: Vercel 배포
시스템은 Vercel CLI 한 명령으로 FE+BE를 배포할 수 있다. 배포 완료까지 5분 이내여야 한다.

#### Scenario: 프로덕션 배포
- **WHEN** `vercel --prod`를 실행하면
- **THEN** FastAPI 앱이 Vercel Python Serverless Function으로 배포되고 공개 URL이 발급된다

#### Scenario: 환경변수 자동 주입
- **WHEN** Vercel 프로젝트에 Neon Integration이 연결되어 있으면
- **THEN** `DATABASE_URL` 환경변수가 Neon Pooled Connection String으로 자동 주입된다

### Requirement: Neon DB 연동
배포 환경에서 SQLAlchemy는 `DATABASE_URL` 환경변수를 통해 Neon PostgreSQL에 연결한다. 로컬에서는 SQLite를 사용한다.

#### Scenario: DB 환경 자동 전환
- **WHEN** `DATABASE_URL` 환경변수가 설정되어 있으면
- **THEN** SQLAlchemy가 Neon PostgreSQL에 연결한다

#### Scenario: 로컬 SQLite 폴백
- **WHEN** `DATABASE_URL` 환경변수가 없으면
- **THEN** SQLAlchemy가 `./taskflow.db` SQLite 파일에 연결한다
