# 온보딩 앱 콘텐츠 설계

**날짜:** 2026-04-14  
**대상:** 신규 개발자 온보딩 앱 (`/Users/byeongmin/Desktop/onboarding`) MDX 콘텐츠

---

## 컨텍스트

### 앱 구조
- Electron 데스크톱 앱 (React 19 + Vite + HeroUI v3 + MDX)
- 콘텐츠 경로: `src/renderer/content/part-{N}-{slug}/`
- 각 파트: `_meta.json` + 복수의 `.mdx` 파일
- MDX 타입: `checklist | mission | learn`
- 모든 문서 `enforce: false` (자유 모드)

### 대상 독자
- 3년차 미들급 개발자 (타 회사에서 이직)
- 기본 개념 설명 불필요, 팀 고유 결정·컨벤션·맥락 위주
- 레퍼런스 성격 (기간 제한 없이 필요할 때 찾아보는 문서)

### 기존 문서 현황
- Notion, 내부 문서 등에 산발적으로 존재 → 이 앱에서 큐레이션
- `code/backend/` 및 `code/foodlogic-frontend/` 실제 코드 참조
- `test.md`: 핵심 기술 문서 (원가계산, 결제, 클라우드, 배포 등 상세 내용 포함)

---

## 챕터 구조 원칙

**복잡도 기준** — 파트의 내용 깊이에 따라 챕터 수를 다르게 구성.  
레퍼런스로 재방문할 때 `파트 > 특정 챕터`로 바로 접근할 수 있도록 주제별로 분리.

---

## 파트별 설계

### Part 1. 계정 체크

**파일:** 1개 (`01-accounts.mdx`)  
**타입:** `checklist`  
**방식:** 한 페이지에 모든 계정을 체크박스로 나열

| 체크 항목 | 설명 |
|---|---|
| GitHub 조직 초대 수락 | team-foodlogic 조직 |
| Google Calendar 팀 캘린더 구독 | 팀 공유 캘린더 |
| Google Drive 공유 폴더 접근 | 키/환경변수 파일 보관 위치 |
| Discord 서버 참여 | 결제/체험 알림 채널 포함 |
| Notion 워크스페이스 초대 | 기획 문서, Task 관리 |
| NCP SubAccount 생성 | Naver Cloud Platform IAM |

---

### Part 2. 환경세팅

**파일:** 2개

#### `01-frontend.mdx`
**타입:** `mission`  
**내용:**
- 전제: Node.js 24.0.2 + pnpm 10.13.1 설치
- 레포 클론: `git clone git@github.com:team-foodlogic/foodlogic-frontend.git`
- 실행: `pnpm bootstrap:dev` (= `pnpm install --frozen-lockfile` + `pnpm dev`)
- 접속: client(3000), admin(3100), wiki(3200)

#### `02-backend.mdx`
**타입:** `mission`  
**내용:**
- 레포 클론: `git clone git@github.com:team-foodlogic/backend.git`
- `.env` 파일 준비: 구글 드라이브 또는 담당 개발자에게 공유받기 (코멘트)
- 실행: `make all`
- 암호화 키 초기화 (최초 1회): `make init-keys`
- 상태 확인: `make ps`, 로그: `make logs`
- 스택: Django + PostgreSQL + Redis + Celery (Docker Compose로 통합)

---

### Part 3. 개발 프로세스

**파일:** 2개

#### `01-overall-process.mdx`
**타입:** `learn`  
**내용:** 전체 제품 개발 플로우

```
기획 초안 (Notion) 
  → 각 파트 댓글 리뷰 루프 (완료까지 반복)
  → 피그마 화면 설계
  → 리뷰 루프 (완료까지 반복)
  → 개발 일정 산정 (백/프론트 각각 + stg 완료일 + prod 예상일)
  → 개발
  → stg 배포 → 기획 QA
  → prod 배포
```

#### `02-dev-process.mdx`
**타입:** `learn`  
**내용:** 개발자 간 실무 프로세스

- 피그마 완료 시점에 그 자리에서 일정 산정 (stg 목표일 확정)
- API 구조 설계 회의 (네이밍 등 큰 그림, 상세 스펙은 다음 단계)
- 백엔드 → 프론트 API 명세서 전달 (llms.txt 방식)
- 각자 개발 완료 → 개발 QA → stg 배포 → 기획 QA → prod 배포
- **배포 금지 규칙:** 다음날 쉬는 금요일은 배포 제외 (버그 대응 불가)
- **현재 구조:** 프론트/백엔드 각 1명, 각자 PR 작성·머지
- **Task 관리:** Notion

---

### Part 4. 개발 커뮤니케이션 / 문서

**파일:** 3개

#### `01-api-docs.mdx`
**타입:** `learn`  
**내용:**

- **구 방식:** Notion 수기 작성 (참고용, 현재 미사용)
- **현재 방식:** AI 기반 MD 자동 생성
  - `GET http://localhost:8000/llms.txt` — 목차 (URL + API 개요)
  - `GET http://localhost:8000/llms.txt?[path]` — 특정 API 상세 (예제 포함)
  - 프론트: pull 후 AI에게 해당 경로를 읽혀서 API 정보 활용

- **API 응답 규격:**
  ```json
  { "code": "SUCCESS", "message": "...", "data": {} }
  ```
  페이지네이션 시:
  ```json
  { "code": "...", "data": { "page": 1, "total_page": 5, "page_size": 20, "items": [] } }
  ```

#### `02-code-convention.mdx`
**타입:** `learn`  
**내용:**
- 별도 강제 컨벤션 없음, 각자 스타일 유지
- 프론트 가이드 문서 링크 (`docs/` 내 architecture, feature-structure, component-conventions 등)

#### `03-branch-strategy.mdx`
**타입:** `learn`  
**내용:**

| 브랜치 | 역할 |
|---|---|
| `main` | prod (운영 서버) |
| `stg` | 스테이징 서버 배포용 |
| `dev` | 개발자 간 실시간 공유 버전 |
| `feat/[name]` | 개인 작업 브랜치 (선택) |

- **dev 규칙:** 항상 동작하는 상태로 push. 깨진 상태로 push 금지.
- **feat/[name]:** dev에서 분기, 완료 후 dev로 머지 (선택적 사용)
- **hotfix:** stg 또는 main에서 직접 브랜치 분기 후 처리

---

### Part 5. 코드 - 어플리케이션단

**파일:** 5개  
**특이사항:** 챕터 2~4는 플로우 다이어그램(Mermaid) 포함

#### `01-architecture-overview.mdx`
**타입:** `learn`  
**내용:**
- 프론트 레이어 구조표 (apps/packages/레이어별 역할)
- 백엔드 Django 앱별 도메인 분류표
- 전체 시스템 플로우 다이어그램 (프론트↔백엔드↔DB↔외부서비스)

**프론트 레이어:**
| 레이어 | 위치 | 역할 |
|---|---|---|
| 라우팅 | `apps/client/src/app/` | Next.js App Router |
| 페이지 | `features/*/page/` | 진입점, 훅→UI 연결 |
| 비즈니스 로직 | `features/*/hook/` | API 호출, 상태, 계산 |
| UI | `features/*/ui/` | 표현 컴포넌트 (props만) |
| 서버 상태 | `packages/api/` | React Query 훅 + API 함수 |
| 전역 상태 | `store/*.atom.ts` | Jotai atoms |
| 공유 패키지 | `packages/ui, types, utils` | 모노레포 공통 |

**백엔드 도메인:**
| Django 앱 | 역할 |
|---|---|
| `users` | 유저, 인증, 소셜 로그인 |
| `stores` | 매장 관리 |
| `ingredients` | 식자재 |
| `supplies` | 부자재 |
| `prep` | 프렙 (반조리) |
| `menu` | 메뉴 |
| `recipe` | 레시피, 조리 매뉴얼 |
| `finances` | 매출 분석 |
| `payments` / `nicepay` | 결제, 플랜, NicePay 연동 |
| `security` | 데이터 암호화 (DEK) |
| `console` | 어드민 페이지 |
| `common` | 공통 유틸리티 |

#### `02-auth-system.mdx`
**타입:** `learn`  
**내용:** (test.md 3.2 기반)
- JWT 토큰: Access(30분) + Refresh(14일), HTTP-only 쿠키
- 토큰 로테이션, Redis 락으로 race condition 방지
- Device ID 단일 기기 로그인 시스템
- 이메일 회원가입 플로우 (시퀀스 다이어그램 포함)
- 이메일 로그인 플로우 (시퀀스 다이어그램 포함)
- 소셜 회원가입/로그인 플로우 (시퀀스 다이어그램 포함)

#### `03-cost-calculation.mdx`
**타입:** `learn`  
**내용:** (test.md 3.3 기반)
- 아이템 계층 구조: 식자재/부자재(Layer 0) → 프렙(Layer 1) → 메뉴(Layer 2)
- DAG 그래프 구조 다이어그램
- g_cost 계산식: `구매가 / (순중량g × 수율)`
- 아이템 등록/수정 플로우 시퀀스 다이어그램
- 재귀 전파 구조 (BFS + 위상정렬 + bulk update) 시퀀스 다이어그램
- unLinked 아이템 개념

#### `04-payment-plan.mdx`
**타입:** `learn`  
**내용:** (test.md 3.4 기반)
- 플랜 구조 (BASIC/PRO/BUSINESS, 월간/연간, 가격표)
- 등급별 리소스 제한표
- 플랜 변경 규칙표 (즉시변경 vs 예약변경)
- 프로모션 유형 (PERIOD/DISCOUNT/MIXED)
- 유저 결제 플로우 시퀀스 다이어그램
- 자동결제 플로우 시퀀스 다이어그램 (Celery Beat)
- 주의사항 (환불 계산 기준, EXPIRED 처리, Discord 웹훅 등)

#### `05-other-domains.mdx`
**타입:** `learn`  
**내용:**
- **레시피:** Menu/Prep 1:1 관계, RecipeStep, soft delete, 플랜별 제한
- **매출 분석:** MenuSales, 공헌이익 계산, 원가 backfill 로직
- **데이터 암호화:** 봉투 암호화(2계층 키 관리), AES-256-GCM, DEK + NCP KMS, Redis 캐싱
- **어드민 페이지:** 대시보드, 유저/결제/프로모션 관리, Django Admin (사무소 IP 제한)
- **기타:** 온보딩 설문, 매장 관리, 마이페이지

---

### Part 6. 클라우드

**파일:** 2개

#### `01-current-infra.mdx`
**타입:** `learn`  
**내용:** (test.md 4.1 기반)

| NCP 서비스 | 용도 |
|---|---|
| Server | stg 서버 + prod 서버 (2개) |
| Cloud DB for PostgreSQL | prod DB (local/stg는 Docker 내부 DB) |
| Object Storage | 이미지 파일 저장 (foodlogic-bucket, test-foodlogic-bucket, foodlogic-assets) |
| Cloud Outbound Mailer | 계정/결제 관련 이메일 |
| Key Management Service (KMS) | DEK 암호화용 마스터 키 |
| ELSA | 로그 수집·검색·분석 |
| Web Service Monitoring (WMS) | 헬스체크 (10분마다 `/health/`) |
| Sub Account | NCP IAM (최소 권한 계정 키 관리) |

- DB 마이그레이션: 배포 시 자동 적용 (`make all/staging/prod`)

#### `02-future-infra.mdx`
**타입:** `learn`  
**내용:** 현재 단순 구조에서 트래픽 증가 시 확장 경로
- **Load Balancer:** 트래픽 분산, 무중단 배포
- **Auto Scaling:** 서버 부하에 따른 자동 확장
- **Cache DB (NCP Redis):** 세션·쿼리 캐싱 고도화

---

### Part 7. CI/CD

**파일:** 2개

#### `01-deployment.mdx`
**타입:** `learn`  
**내용:** (test.md 5.2 기반)
- CI/CD 파이프라인 없음, 직접 SSH 접속 후 배포
- pem 키로 서버 접속 (구글 드라이브에서 다운로드)
- 배포 절차: `git pull` → `.env` 업데이트 (ELSA_PROJECT_VERSION 변경) → `make` 실행
- 환경별 명령어:
  - local: `make all`
  - stg: `make staging`
  - prod: `sudo make prod`
- SSL: 컨테이너 외부 crontab, 30일 미만 시 자동 갱신 (`renew-ssl-환경.sh`)

#### `02-server-setup.mdx`
**타입:** `learn`  
**내용:** (test.md 5.1 기반) 신규 서버 생성 시 절차
1. NCP 서버 생성
2. SSH 접속 (pem 키)
3. git 토큰 세팅 + clone
4. 환경별 브랜치 변경
5. `.env` 세팅
6. ufw 방화벽 설정 (22, 80, 443)
7. Docker 설치
8. Certbot SSL 설정
9. 마이그레이션 실행
10. NCP 도메인 연결

---

### Part 8. 모니터링 및 데이터 분석

**파일:** 3개

#### `01-cs-support.mdx`
**타입:** `learn`  
**내용:** CS 처리 시 개발자 지원 케이스별 대응

| 케이스 | 대응 방법 |
|---|---|
| 결제 오류 | Admin 페이지에서 결제 이력 확인 → NicePay 대사 → Admin에서 환불 처리 (NicePay 직접 환불 금지) |
| 원가계산 불일치 | Admin 또는 DB 직접 조회 → g_cost 계산 확인 → Signal 재계산 여부 확인 |
| 서비스 장애 | WMS 알림 확인 → SSH 접속 → `make logs` → ELSA 로그 검색 |
| 유저 데이터 이상 | Admin 페이지 유저 상세 확인 → 필요 시 Django Admin |
| Discord 웹훅 미발송 | ELSA 로그 확인 → Discord 웹훅 URL 환경변수 점검 |
| 이메일 미발송 | ELSA 로그 확인 → NCP Cloud Outbound Mailer 상태 확인 |

- **NicePay 주의:** 테스트/prod 환경이 같은 상점 → 항상 Admin에서 환불 (기록 유지 필수)

#### `02-logging.mdx`
**타입:** `learn`  
**내용:**
- NCP ELSA로 백엔드 로그 수집·검색
- ELSA 로그 코드 규칙 (Notion 링크 참조)
- 로그 확인 방법: ELSA 콘솔 접속, 필터링
- Object Storage `foodlogic-logs` 버킷에 백업

#### `03-data-analytics.mdx`
**타입:** `learn`  
**내용:**
- **Admin 대시보드:** 실시간 시계열 데이터 계산 → 단일 API로 프론트 반환
  - 블랙리스트 계정(테스트/내부) 자동 필터링
  - **현재 한계:** 전체 기간 시계열 데이터를 매번 실시간 계산 → 응답 느림 → 스냅샷/집계 테이블 도입 필요 (개선 과제)
- **프론트 분석용 로그:** Clarity 이벤트 추적, 유저 행동 분석 로그
- **Discord 웹훅 채널:** 무료체험 시작/해지, 결제 실패, 결제 완료 실시간 알림

---

### Part 9. 이후 해결해야 할 문제 / 고민할 것

**추후 작성 예정**

---

## 파일 경로 매핑

```
src/renderer/content/
├── part-1-account-check/
│   └── 01-accounts.mdx
├── part-2-env-setup/
│   ├── 01-frontend.mdx
│   └── 02-backend.mdx
├── part-3-dev-process/
│   ├── 01-overall-process.mdx
│   └── 02-dev-process.mdx
├── part-4-communication/
│   ├── 01-api-docs.mdx
│   ├── 02-code-convention.mdx
│   └── 03-branch-strategy.mdx
├── part-5-codebase/
│   ├── 01-architecture-overview.mdx
│   ├── 02-auth-system.mdx
│   ├── 03-cost-calculation.mdx
│   ├── 04-payment-plan.mdx
│   └── 05-other-domains.mdx
├── part-6-cloud/
│   ├── 01-current-infra.mdx
│   └── 02-future-infra.mdx
├── part-7-cicd/
│   ├── 01-deployment.mdx
│   └── 02-server-setup.mdx
└── part-8-monitoring/
    ├── 01-cs-support.mdx
    ├── 02-logging.mdx
    └── 03-data-analytics.mdx
```

---

## 콘텐츠 작성 원칙

1. **맥락 우선:** "왜 이렇게 결정했는지"를 앞에 배치
2. **표/다이어그램 활용:** 구조가 복잡한 내용은 텍스트보다 표·Mermaid 다이어그램
3. **외부 링크:** Notion, ELSA 등 외부 문서는 링크로 연결 (내용 복제 최소화)
4. **시퀀스 다이어그램:** Part 5 챕터 2~4는 test.md의 Mermaid 다이어그램 직접 활용
5. **enforce: false:** 전 문서 자유 모드
