# Foodlogic Layer Documentation

foodlogic-frontend와 backend 두 프로젝트를 **4개 레이어 × 9개 도메인** 매트릭스로 정리한 문서입니다.

> **주 산출물은 인터랙티브 시각화입니다:** `visualization/index.html`을 브라우저로 열어보세요. 셀의 항목을 클릭하면 연관된 항목이 하이라이트됩니다. 아래 문서들은 참고용 요약입니다.

## 레이어

| 레이어 | 의미 |
|---|---|
| **시스템** | 범용 기반 시스템. 특정 도메인에 종속되지 않고 여러 도메인이 올라타서 동작함 |
| **데이터** | 축적되는 데이터 = DB 모델/테이블 |
| **비즈니스 로직** | 데이터 → 가공 → 인터페이스로 흐르는 중간 계산/규칙 |
| **인터페이스** | 화면 = 페이지/컴포넌트 |

## 도메인

| 도메인 | 요약 | 상세 |
|---|---|---|
| 계정/인증 | users, auth, mypage | [domains/account.md](domains/account.md) |
| 원가계산 | stores, ingredients, supplies, recipe, prep, menu, items | [domains/cost-calculation.md](domains/cost-calculation.md) |
| 외부 식자재 연동 | material_sources (커머스 확장 예정) | [domains/external-ingredient.md](domains/external-ingredient.md) |
| 손익관리 | finances, income-statement, menu-sales, menu-analysis | [domains/pnl.md](domains/pnl.md) |
| 결제/플랜 | payments, nicepay, plan, promotion | [domains/payment-plan.md](domains/payment-plan.md) |
| 온보딩/가이드 | onboarding, tour, sample-store, tester | [domains/onboarding-guide.md](domains/onboarding-guide.md) |
| 공지/고지 | notice, legal | [domains/notice-legal.md](domains/notice-legal.md) |
| 관리자 콘솔 | custom_admin, console, admin app, data-explorer, elsa-logs | [domains/admin-console.md](domains/admin-console.md) |
| 보안/추적 | security, tracking | [domains/security-tracking.md](domains/security-tracking.md) |

## 전체 매트릭스

| 레이어 \ 도메인 | 계정/인증 | 원가계산 | 외부 식자재 연동 | 손익관리 | 결제/플랜 | 온보딩/가이드 | 공지/고지 | 관리자 콘솔 | 보안/추적 |
|---|---|---|---|---|---|---|---|---|---|
| **시스템** | Django Auth, 세션/쿠키, 권한 | — | — | — | 이메일 알림, NicePay 게이트웨이 | — | — | Django Admin, 커스텀 Admin 프레임워크 | 로깅 인프라, 감사 로그 |
| **데이터** | User, Profile | Store, Ingredient, Supply, Recipe, Prep, Menu, Item | MaterialSource, 외부 카탈로그 | Finance 스냅샷, MenuSales, MenuAnalysis | Payment, Subscription, Plan, Promotion | OnboardingState, SampleStore, TourProgress | Notice, LegalDoc | AdminLog, ElsaLog, DataExplorer 쿼리 | TrackingEvent, SecurityAudit |
| **비즈니스 로직** | 회원가입/탈퇴 플로우, 권한 검사 | 식자재 단가 환산, 레시피·prep·메뉴 원가 집계 | 외부 소스 동기화, 단가 매핑 | 손익 집계, 판매량 분석 | 플랜 만료 판정, 프로모션 할인, 결제 후 플랜 활성화 | 온보딩 단계 진행, 샘플 데이터 주입 | 공지 노출 규칙 | 데이터 조회/집계, 로그 필터링 | 이벤트 추적 규칙, 이상 탐지 |
| **인터페이스** | 로그인, 회원가입, 마이페이지 | 레시피 편집, 메뉴 원가, 식자재·부자재 목록, prep | 외부 식자재 검색/연동 화면 | 손익 대시보드, 메뉴 판매 분석 | 결제 페이지, 플랜 선택, 프로모션 배너, 온보딩 플랜 | 온보딩 위저드, 투어, 샘플 스토어, 테스터 | 공지 배너, 약관 페이지 | Admin 앱 전체, 데이터 탐색기, Elsa 로그 뷰어 | (대부분 백그라운드) |
