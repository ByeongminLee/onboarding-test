window.MATRIX_DATA = 
{
  "layers": [
    { "id": "system", "name": "시스템" },
    { "id": "data", "name": "데이터" },
    { "id": "logic", "name": "비즈니스 로직" },
    { "id": "ui", "name": "인터페이스" }
  ],
  "domains": [
    { "id": "account", "name": "계정/인증" },
    { "id": "cost", "name": "원가계산" },
    { "id": "external", "name": "외부 식자재 연동" },
    { "id": "pnl", "name": "손익관리" },
    { "id": "payment", "name": "결제/플랜" },
    { "id": "onboarding", "name": "온보딩/가이드" },
    { "id": "notice", "name": "공지/고지" },
    { "id": "admin", "name": "관리자 콘솔" },
    { "id": "security", "name": "보안/추적" }
  ],
  "items": [
    { "id": "sys.account.auth",        "layer": "system", "domain": "account",    "name": "Django Auth / 세션 / 권한", "related": ["data.account.user", "logic.account.signup", "ui.account.login", "sys.admin.django"] },
    { "id": "data.account.user",       "layer": "data",   "domain": "account",    "name": "User, Profile", "related": ["sys.account.auth", "logic.account.signup", "ui.account.mypage"] },
    { "id": "logic.account.signup",    "layer": "logic",  "domain": "account",    "name": "회원가입/탈퇴, 권한 검사", "related": ["sys.account.auth", "data.account.user", "ui.account.login", "sys.payment.email"] },
    { "id": "ui.account.login",        "layer": "ui",     "domain": "account",    "name": "로그인, 회원가입", "related": ["logic.account.signup", "sys.account.auth"] },
    { "id": "ui.account.mypage",       "layer": "ui",     "domain": "account",    "name": "마이페이지", "related": ["data.account.user", "ui.payment.plan"] },

    { "id": "data.cost.models",        "layer": "data",   "domain": "cost",       "name": "Store, Ingredient, Supply, Recipe, Prep, Menu, Item", "related": ["logic.cost.calc", "ui.cost.recipe", "ui.cost.menu", "data.external.source"] },
    { "id": "logic.cost.calc",         "layer": "logic",  "domain": "cost",       "name": "단가 환산, 레시피·prep·메뉴 원가 집계", "related": ["data.cost.models", "ui.cost.menu", "logic.pnl.aggregate"] },
    { "id": "ui.cost.recipe",          "layer": "ui",     "domain": "cost",       "name": "레시피/프렙 편집", "related": ["data.cost.models", "logic.cost.calc"] },
    { "id": "ui.cost.menu",            "layer": "ui",     "domain": "cost",       "name": "메뉴 원가 화면", "related": ["logic.cost.calc", "data.cost.models"] },
    { "id": "ui.cost.ingredients",     "layer": "ui",     "domain": "cost",       "name": "식자재/부자재 목록", "related": ["data.cost.models", "ui.external.search"] },

    { "id": "data.external.source",    "layer": "data",   "domain": "external",   "name": "MaterialSource, 외부 카탈로그", "related": ["logic.external.sync", "data.cost.models", "ui.external.search"] },
    { "id": "logic.external.sync",     "layer": "logic",  "domain": "external",   "name": "외부 소스 동기화, 단가 매핑", "related": ["data.external.source", "data.cost.models"] },
    { "id": "ui.external.search",      "layer": "ui",     "domain": "external",   "name": "외부 식자재 검색/연동", "related": ["logic.external.sync", "ui.cost.ingredients"] },

    { "id": "data.pnl.finance",        "layer": "data",   "domain": "pnl",        "name": "Finance 스냅샷, MenuSales, MenuAnalysis", "related": ["logic.pnl.aggregate", "ui.pnl.dashboard", "data.cost.models"] },
    { "id": "logic.pnl.aggregate",     "layer": "logic",  "domain": "pnl",        "name": "손익 집계, 판매량 분석", "related": ["data.pnl.finance", "logic.cost.calc", "ui.pnl.dashboard"] },
    { "id": "ui.pnl.dashboard",        "layer": "ui",     "domain": "pnl",        "name": "손익 대시보드, 메뉴 판매 분석", "related": ["logic.pnl.aggregate", "data.pnl.finance"] },

    { "id": "sys.payment.email",       "layer": "system", "domain": "payment",    "name": "이메일 알림 시스템", "related": ["logic.payment.activate", "logic.account.signup", "data.notice.notice"] },
    { "id": "sys.payment.nicepay",     "layer": "system", "domain": "payment",    "name": "NicePay 게이트웨이", "related": ["data.payment.payment", "logic.payment.activate", "ui.payment.pay"] },
    { "id": "data.payment.payment",    "layer": "data",   "domain": "payment",    "name": "Payment, Subscription, Plan, Promotion", "related": ["sys.payment.nicepay", "logic.payment.activate", "logic.payment.expiry", "ui.payment.plan"] },
    { "id": "logic.payment.activate",  "layer": "logic",  "domain": "payment",    "name": "결제 후 플랜 활성화, 프로모션 할인", "related": ["sys.payment.nicepay", "sys.payment.email", "data.payment.payment", "ui.payment.pay"] },
    { "id": "logic.payment.expiry",    "layer": "logic",  "domain": "payment",    "name": "플랜 만료 판정", "related": ["data.payment.payment", "sys.payment.email", "ui.payment.plan"] },
    { "id": "ui.payment.pay",          "layer": "ui",     "domain": "payment",    "name": "결제 페이지", "related": ["sys.payment.nicepay", "logic.payment.activate"] },
    { "id": "ui.payment.plan",         "layer": "ui",     "domain": "payment",    "name": "플랜 선택, 프로모션 배너, 온보딩 플랜", "related": ["data.payment.payment", "logic.payment.expiry", "ui.onboarding.wizard"] },

    { "id": "data.onboarding.state",   "layer": "data",   "domain": "onboarding", "name": "OnboardingState, SampleStore, TourProgress", "related": ["logic.onboarding.flow", "ui.onboarding.wizard"] },
    { "id": "logic.onboarding.flow",   "layer": "logic",  "domain": "onboarding", "name": "온보딩 단계 진행, 샘플 데이터 주입", "related": ["data.onboarding.state", "ui.onboarding.wizard", "ui.payment.plan"] },
    { "id": "ui.onboarding.wizard",    "layer": "ui",     "domain": "onboarding", "name": "온보딩 위저드, 투어, 샘플 스토어, 테스터", "related": ["logic.onboarding.flow", "data.onboarding.state", "ui.payment.plan"] },

    { "id": "data.notice.notice",      "layer": "data",   "domain": "notice",     "name": "Notice, LegalDoc", "related": ["logic.notice.rules", "ui.notice.banner"] },
    { "id": "logic.notice.rules",      "layer": "logic",  "domain": "notice",     "name": "공지 노출 규칙", "related": ["data.notice.notice", "ui.notice.banner"] },
    { "id": "ui.notice.banner",        "layer": "ui",     "domain": "notice",     "name": "공지 배너, 약관 페이지", "related": ["data.notice.notice", "logic.notice.rules"] },

    { "id": "sys.admin.django",        "layer": "system", "domain": "admin",      "name": "Django Admin, 커스텀 Admin 프레임워크", "related": ["data.admin.logs", "ui.admin.app", "sys.account.auth"] },
    { "id": "data.admin.logs",         "layer": "data",   "domain": "admin",      "name": "AdminLog, ElsaLog, DataExplorer 쿼리", "related": ["sys.admin.django", "logic.admin.query", "ui.admin.app"] },
    { "id": "logic.admin.query",       "layer": "logic",  "domain": "admin",      "name": "데이터 조회/집계, 로그 필터링", "related": ["data.admin.logs", "ui.admin.app"] },
    { "id": "ui.admin.app",            "layer": "ui",     "domain": "admin",      "name": "Admin 앱, 데이터 탐색기, Elsa 로그 뷰어", "related": ["sys.admin.django", "data.admin.logs", "logic.admin.query"] },

    { "id": "sys.security.logging",    "layer": "system", "domain": "security",   "name": "로깅 인프라, 감사 로그", "related": ["data.security.event", "logic.security.track"] },
    { "id": "data.security.event",     "layer": "data",   "domain": "security",   "name": "TrackingEvent, SecurityAudit", "related": ["sys.security.logging", "logic.security.track"] },
    { "id": "logic.security.track",    "layer": "logic",  "domain": "security",   "name": "이벤트 추적, 이상 탐지", "related": ["data.security.event", "sys.security.logging"] }
  ]
}
;
