# 원가계산

매장 단위로 식자재·부자재·레시피·프렙·메뉴를 모델링하고, 단가를 환산해 메뉴 원가를 산출.

## 시스템
(없음 — 순수 도메인 로직)

## 데이터
- **Store** — 매장 단위 경계
- **Ingredient, Supply** — 식자재/부자재
- **Recipe, Prep** — 조리 단위. Prep은 중간 가공물
- **Menu, Item** — 최종 판매 단위

## 비즈니스 로직
- **단가 환산** — 포장 단위 → 사용 단위
- **레시피/프렙/메뉴 원가 집계** — 재귀적 계산 (prep을 포함하는 recipe, recipe를 포함하는 menu)

## 인터페이스
- **레시피/프렙 편집** — `features/recipe-*`, `cost-prep`
- **메뉴 원가 화면** — `features/cost-menu`
- **식자재/부자재 목록** — `features/ingredients`, `supplies`

## 주요 연관
- 외부 식자재 연동 (MaterialSource로 단가 주입)
- 손익관리 (원가 계산 결과가 손익 집계 입력)
