# 관리자 콘솔

운영팀이 데이터를 조회·수정하고 로그를 확인하는 백오피스.

## 시스템
- **Django Admin, 커스텀 Admin 프레임워크** — `backend/srcs/web/foodlogic/custom_admin`, `console`. 범용 CRUD + 확장 기능.

## 데이터
- **AdminLog, ElsaLog, DataExplorer 쿼리** — 관리자 활동 로그, Elsa 로그, 저장된 쿼리

## 비즈니스 로직
- **데이터 조회/집계** — 저장된 쿼리 실행, 집계 뷰
- **로그 필터링** — 기간/사용자/액션 기반 필터

## 인터페이스
- **Admin 앱** — `foodlogic-frontend/apps/admin` 전체
- **데이터 탐색기, Elsa 로그 뷰어** — `features/data-explorer`, `elsa-logs`

## 주요 연관
- 계정/인증 (Admin은 Django Auth 위에 동작)
- 보안/추적 (로그 데이터 소비)
