# 계정/인증

사용자 식별, 인증, 권한 검사의 기반. 다른 모든 도메인이 이 위에 올라탐.

## 시스템
- **Django Auth / 세션 / 권한** — `backend/srcs/web/foodlogic/users`, `security`. 범용 인증 프레임워크. 관리자 콘솔도 이 위에 동작.

## 데이터
- **User, Profile** — 로그인 주체와 프로필 정보

## 비즈니스 로직
- **회원가입/탈퇴 플로우, 권한 검사** — `users`, `users-withdrawal` 플로우. 가입 시 이메일 트리거.

## 인터페이스
- **로그인, 회원가입** — `foodlogic-frontend/apps/client/src/features/auth`
- **마이페이지** — `features/mypage`

## 주요 연관
- 이메일 알림 시스템 (가입/탈퇴 이벤트)
- 결제/플랜 (마이페이지 → 플랜 상태)
- 관리자 콘솔 (Django Admin 기반)
