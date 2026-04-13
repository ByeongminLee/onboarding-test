- 목차

- 혼동 용어
  다음 용어는 같은 의미로 사용됨
  > 실 서비스 서버 : 운영서버, prod
  > 개발 서버 : 스테이징, stg, staging
  > 로컬 개발 : 로컬 개발
  NCP : Naver CLoud Platform, cloud
  >

# 1. 키 정보

- 키 사용 방법
  1. [Google Drive](https://drive.google.com/file/d/1BPep2aPDyVUpxWzrJzLGoALXlViaggad/view?usp=drive_link)에 비밀번호 설정한 ZIP 파일로 키 다운로드
  2. 백엔드 키 압축 비밀번호 - 564832

- 대상 키 목록
  | 파일명                       | 구분             | 설명                                           |
  | ---------------------------- | ---------------- | ---------------------------------------------- |
  | .env                         | 개발 환경 변수   | 로컬 환경 변수                                 |
  | .env.staging                 | 개발 환경 변수   | 개발 서버 변수                                 |
  | .env.prod                    | 개발 환경 변수   | 운영 서버 변수                                 |
  | back.pem                     | NCP 서버 키      | 로드밸런서 키 (현재 사용 안하지만 보관은 필요) |
  | staging-foodlogic-back.pem   | NCP 서버 키      | 개발 서버 키                                   |
  | prod-foodlogic-back.pem      | NCP 서버 키      | 운영 서버 키                                   |
  | staging_key.json 스테이징 키 | 데이터 암호화 키 | 스테이징 암호화 DEK 키                         |
  | 2025-09-09                   |
  | backup_product_key.json      | 데이터 암호화 키 | 프로덕트 암호화 DEK 키                         |
  | 2025-09-09                   |

# 2. 개발 환경

## 2.1. 기술 스택

기술스택

- 백엔드
  - Framework: Django 5.0.6 + Django REST Framework 3.16
  - DB: PostgreSQL 15
  - Cache/Broker: Redis
  - Async: Celery 5.5 + Celery Beat (django_celery_beat DB 스케줄러)
  - Server: Gunicorn + Nginx
  - Container: Docker Compose
  - Payment: NicePay (빌링키 방식)
  - Security: DEK(Data Encryption Key) 기반 필드 암호화
  - PK: NanoID (전 모델)
- 프론트
  - Nextjs

## 2.2. 깃허브 저장소

프론트 : https://github.com/team-foodlogic/foodlogic-frontend

백엔드 : https://github.com/team-foodlogic/backend

## 2.3. 로컬 개발 환경 세팅

> 배포 stg, prod 세팅 방법 : [5. 배포](https://www.notion.so/5-ce38431cafa04a2b9a1e7c979b98c9a8?pvs=21)

- 백엔드 환경 세팅
  1. 레포

     ```bash
     git clone git@github.com:team-foodlogic/backend.git
     cd backend
     ```

  2. 구글드라이브 백엔드/백엔드키 환경변수 파일 `.env` 추가

     `.env` 파일을 열어 필요한 값 설정 (아래 환경변수 섹션 참고)

  3. 전체 빌드 및 실행 (Docker)

     ```bash
     make all
     ```

  4. 암호화 키 초기화 (최초 1회)

     ```bash
     make init-keys
     ```

  5. 서비스 상태 확인

     ```bash
     make ps
     ```

  6. 로그 확인

     ```bash
     make logs
     ```

- 프론트 환경 세팅
  > 프론트 개발자에게 문의

# 3. 코드

## 3.1. API 명세

> 기존에는 Notion에 명세서를 운영했으나, 현재는 llms.txt스타일로 로컬에서 접근가능한 API 명세서를 GET 호출로 md 문서로 볼수 있게 함

- Front-end 에서는 http://localhost:8000/llms.txt 로 접근하여 AI에게 해당 경로를 주고 API 정보를 AI에게 받아서 사용
- root 경로의 llms.txt는 목차 형식이고 하위에 md파일을 접근할수 있는 방식
  - ex)하위 데이터 예시
    ![스크린샷 2026-03-23 오후 2.25.09.png](attachment:5e7e655b-5cff-492a-ae95-a93bc163071d:스크린샷_2026-03-23_오후_2.25.09.png)

- API 명세서 데이터 규격
  1. 기본 규칙

     아래 3가지 값은 null이더라도 키값만이라도 반환
     - code값으로 해당 API 결과를 구분
       - 성공의 경우 `SUCCESS` 값이 대체로 고정 (성공이 두가지인 경우 제외)
     - message값은 필요한 경우 문자열반환
     - data 내부에 필요 데이터를 반환

     ```json
     {
     	code : string;
     	message : string;
     	data : [{ data }]
     }
     ```

  2. 페이지 네이션이 있을떄 규칙
     - 기존에 반환하던 data는 items로 반환 하고 각 컬럼 3가지로 페이지네이션을 반환

     ```json
     {
     	code : string;
     	message : string;
     	data : {
     		page : number;
     		total_page : number;
     		page_size : number;
     		items: [{ data }]
     	}
     }
     ```

## 3.2. 계정 시스템

### 3.2.3. 인증 토큰

| 항목                       | 내용                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| **발급 토큰**              | Access Token (JWT) + Refresh Token (JWT)                             |
| **Access Token 유효기간**  | 30분                                                                 |
| **Refresh Token 유효기간** | 14일                                                                 |
| **저장 방식**              | HTTP-only 쿠키 (`secure=True`, `samesite=Lax`)                       |
| **토큰 갱신**              | `POST /token/refresh/` → 새 Access + 새 Refresh 발급 (토큰 로테이션) |
| **비밀번호 해싱**          | Argon2 (Primary)                                                     |

- **Refresh 시** (`POST /token/refresh/`): 토큰 로테이션 (새 refresh 발급 + 기존 블랙리스트)
- **동시성 보호**: Redis 락으로 refresh 토큰 race condition 방지
- **토큰 재사용 방지**: 5분 내 동일 토큰 재사용 캐시 체크
- **로그아웃** (`POST /logout/`): refresh 토큰 블랙리스트 + device_id 초기화
- Device Id : 하나의 기기 로그인 시스템
  - 로그인 시 `X-Device-Id` 헤더 값을 `User.current_device_id`에 저장
  - `X-Device-Id` 값이 불일치시 거부 → 강제 로그아웃

### 3.2.3. 플로우

| 구분   | 플로우   | 단계                                                                       |
| ------ | -------- | -------------------------------------------------------------------------- |
| 이메일 | 회원가입 | 1. `POST /email-verification/signup/` → 이메일로 5자리 OTP 발송 (3분 유효) |

2. `POST /email-verification/confirm/` → OTP 인증
3. `POST /phone-verification/signup/` → SMS OTP 발송 (Naver Cloud SENS)
4. `POST /phone-verification/confirm/` → SMS 인증
5. `POST /signup/` → 유저 생성 + BASIC 구독 자동 생성 + JWT 토큰 반환 |
| | 로그인 | 1. `POST /login/` → email + password + Device-Id 전달 2. 비밀번호 검증 → JWT 토큰 쌍 생성 (access 30분 + refresh 14일) 3. current_device_id 업데이트 + UserLoginLog 기록 + 쿠키 설정 |
| 소셜 | 회원가입 | 1. `POST /auth/social/` → provider 전달 → OAuth 인증 URL + state 반환 2. 프론트엔드에서 소셜 제공자 페이지로 리다이렉트 → 유저 인가
3. `POST /auth/social/callback/` → auth code + provider + state 전달 4. 백엔드가 소셜 API로 access_token 발급 → 유저 정보 조회 → `SIGNUP_SUCCESS` 반환 (signup_key + email) 5. 프론트엔드에서 `/signup/social` 페이지로 이동 → 약관동의 등 추가 정보 입력
6. `POST /auth/social/signup/` → User 생성 (password=None) + SocialAccount 연결 + BASIC 구독 생성 → JWT 토큰 반환 |
| | 로그인 | 1. `POST /auth/social/` → provider 전달 → OAuth 인증 URL + state 반환 2. 프론트엔드에서 소셜 제공자 페이지로 리다이렉트 → 유저 인가
3. `POST /auth/social/callback/` → auth code + provider + state 전달 4. 백엔드가 소셜 API로 access_token 발급 → 유저 정보 조회 → SocialAccount 매칭 → JWT 토큰 반환 |

- 시퀀스 다이어그램
  - 이메일 회원가입
    ```mermaid
    sequenceDiagram
        actor User as 유저
        participant Browser as 프론트엔드<br/>(브라우저)
        participant Server as 프론트엔드<br/>(서버)
        participant BE as Django 백엔드

        Note over Browser: Step 1 - 이메일 입력
        User->>Browser: 이메일 입력 & 제출
        Browser->>BE: POST /auth/email-verification/signup/
        BE-->>User: 5자리 OTP 이메일 발송 (3분 유효)

        Note over Browser: Step 2 - 이메일 OTP 인증
        User->>Browser: OTP 입력
        Browser->>BE: POST /auth/email-verification/confirm/
        BE-->>Browser: 인증 완료

        Note over Browser: Step 3 - 전화번호 입력
        User->>Browser: 전화번호 입력
        Browser->>BE: POST /auth/phone-verification/signup/
        BE-->>User: SMS OTP 발송 (Naver Cloud SENS)

        Note over Browser: Step 4 - SMS OTP 인증
        User->>Browser: SMS OTP 입력
        Browser->>BE: POST /auth/phone-verification/confirm/
        BE-->>Browser: 인증 완료

        Note over Browser: Step 5 - 비밀번호 입력
        User->>Browser: 비밀번호 입력

        Note over Browser: Step 6 - 약관동의
        User->>Browser: 약관동의 체크 & 제출
        Browser->>BE: POST /auth/signup/<br/>(email, password, phone_number, agreements, signup_meta)
        BE->>BE: User 생성 + BASIC 구독 생성
        BE-->>Browser: 성공 응답

        Note over Browser: 자동 로그인
        Browser->>Server: signIn("credentials", { email, password })
        Server->>Server: generateDeviceId()
        Server->>BE: POST /auth/login/ (X-Device-Id 헤더)
        BE-->>Server: Set-Cookie (access, refresh)
        Server->>BE: GET /console/mypage/
        BE-->>Server: 유저 정보 반환
        Server-->>Browser: 세션 쿠키 설정
        Browser->>Browser: redirect → /console/onboarding

    ```
  - 이메일 로그인
    ```mermaid
    sequenceDiagram
        actor User as 유저
        participant Browser as 프론트엔드<br/>(브라우저)
        participant Server as 프론트엔드<br/>(서버)
        participant BE as Django 백엔드

        User->>Browser: email + password 입력 & 제출
        Browser->>Server: signIn("credentials", { email, password })

        Server->>Server: generateDeviceId() 또는 기존 device_id 쿠키 사용
        Server->>BE: POST /auth/login/<br/>(email, password, X-Device-Id 헤더)
        BE->>BE: 비밀번호 검증
        BE->>BE: JWT 토큰 생성 (access 30분 + refresh 14일)
        BE->>BE: current_device_id 업데이트 + UserLoginLog 기록
        BE-->>Server: Set-Cookie (access, refresh, device_id)

        Server->>BE: GET /console/mypage/
        BE-->>Server: 유저 정보 반환

        Server->>Server: jwt 콜백 → 토큰에 유저 정보 저장
        Server->>Server: session 콜백 → 세션 확장
        Server-->>Browser: 세션 쿠키 설정

        Browser->>Browser: localStorage에 currentLogin = "email" 저장
        Browser->>Browser: Clarity 분석 이벤트 전송
        Browser->>Browser: redirect → /console

    ```
  - 소셜 회원가입
    ```mermaid
    sequenceDiagram
        actor User as 유저
        participant Browser as 프론트엔드<br/>(브라우저)
        participant Server as 프론트엔드<br/>(서버)
        participant BE as Django 백엔드
        participant Social as 소셜 제공자<br/>(Kakao/Naver/Google)

        Note over Browser: 소셜 버튼 클릭
        User->>Browser: 소셜 제공자 선택
        Browser->>Browser: pendingSocialCookie.set(socialType)
        Browser->>BE: POST /auth/social/<br/>({ social, path: "SIGNUP" })
        BE-->>Browser: OAuth 인증 URL 반환

        Browser->>Social: OAuth 페이지로 리다이렉트
        User->>Social: 인가 승인
        Social-->>BE: auth code 전달 (redirect)
        BE->>Social: access_token 발급 요청
        Social-->>BE: access_token 반환
        BE->>Social: 유저 정보 조회
        Social-->>BE: 유저 정보 반환
        BE->>BE: 신규 유저 판별 → SIGNUP_SUCCESS
        BE-->>Server: 리다이렉트 /api/auth/callback/social<br/>(Set-Cookie: signupKey, email)

        Server->>Server: signupKey & email 쿠키 감지
        Server-->>Browser: redirect → /signup/social?signupKey=X&email=Y

        Note over Browser: 추가 정보 입력
        User->>Browser: 전화번호 입력
        Browser->>BE: POST /auth/phone-verification/signup/
        BE-->>User: SMS OTP 발송
        User->>Browser: SMS OTP 입력
        Browser->>BE: POST /auth/phone-verification/confirm/
        BE-->>Browser: 인증 완료

        User->>Browser: 약관동의 & 제출
        Browser->>BE: POST /auth/social/signup/<br/>(signupKey, email, phone_number, agreements, signup_meta)
        BE->>BE: User 생성 (password=None)<br/>+ SocialAccount 연결 + BASIC 구독 생성
        BE-->>Browser: Set-Cookie (access, refresh)

        Browser->>Server: redirect → /api/auth/callback/social?signup=true
        Server->>Server: 쿠키에서 access/refresh 토큰 읽기
        Server->>BE: GET /console/mypage/
        BE-->>Server: 유저 정보 반환
        Server->>Server: createNextAuthSession() → 세션 생성
        Server-->>Browser: redirect → /console/onboarding

    ```
  - 소셜 로그인
    ```mermaid
    sequenceDiagram
        actor User as 유저
        participant Browser as 프론트엔드<br/>(브라우저)
        participant Server as 프론트엔드<br/>(서버)
        participant BE as Django 백엔드
        participant Social as 소셜 제공자<br/>(Kakao/Naver/Google)

        User->>Browser: 소셜 로그인 버튼 클릭
        Browser->>Browser: pendingSocialCookie.set(socialType)
        Browser->>BE: POST /auth/social/<br/>({ social, path: "LOGIN" })
        BE-->>Browser: OAuth 인증 URL 반환

        Browser->>Social: OAuth 페이지로 리다이렉트
        User->>Social: 인가 승인
        Social-->>BE: auth code 전달 (redirect)
        BE->>Social: access_token 발급 요청
        Social-->>BE: access_token 반환
        BE->>Social: 유저 정보 조회
        Social-->>BE: 유저 정보 반환
        BE->>BE: SocialAccount 매칭 → JWT 토큰 생성
        BE-->>Server: 리다이렉트 /api/auth/callback/social<br/>(Set-Cookie: access, refresh, device_id)

        Server->>Server: 쿠키에서 access/refresh 토큰 읽기
        Server->>BE: GET /console/mypage/
        BE-->>Server: 유저 정보 반환
        Server->>Server: 세션 생성 + 로그인 타입 저장
        Server-->>Browser: 세션 쿠키 설정 + redirect → /console

        Browser->>Browser: Clarity 분석 이벤트 전송

    ```

## 3.3. 비즈니스 로직 - 원가계산 시스템

### 3.3.1. 원가 계산 아이템 관계

- 아이템
  - 아이템은 메뉴, 프렙, 식자재, 부자재
  - Layer 0 식자재, 부자재
  - Layer 1 프렙 : 자기 자신 포함 가능
  - Layer 2 메뉴 : 자기 자신 포함 가능
- 포함 가능 관계 (→ 우측방향으로 포함 여부)
  | 부모     | 식자재 | 부자재 | 프렙     | 메뉴     |
  | -------- | ------ | ------ | -------- | -------- |
  | **프렙** | O      | O      | O (재귀) | X        |
  | **메뉴** | O      | O      | O        | O (재귀) |
- 각 아이템들은 여러개의 아이템을 포함할수 있다.

```
┌─────────────────────────────────────┐
│  메뉴 (Menu) - 같은종류 포함 가능     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  프렙 (Prep) - 같은종류 포함 가능│  │
│  │                               │  │
│  │  ┌─────────┐  ┌─────────┐    │  │
│  │  │  식자재  │  │  부자재  │    │  │
│  │  └─────────┘  └─────────┘    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

- item(메뉴, 프랩, 식자재)은 계층이 있는 DAG 그래프 형태의 자료구조
  ![image.png](attachment:b3481277-c62e-44d9-a502-eebd375fd7d2:image.png)

### 3.3.2. 원가 계산 시스템

> 1. 아이템 (식자재,부자재,프렙,메뉴 모두를 칭함)을 등록 또는 수정을한다.
> 2. 이 아이템을 포함하고 있는 상위 아이템을 하위 아이템이 변경되면 자동으로 재귀적으로 계산을 한다.
>
> 참고 : [원가 계산.excalidraw](https://www.notion.so/excalidraw-32980d6ae15780648d13e6b628f5116d?pvs=21)

- 일반 아이템 등록/수정 플로우
  - 시퀀스다이어그램
    ```mermaid
    sequenceDiagram
        actor User as 유저
        participant FE as 프론트엔드
        participant BE as Django 백엔드
        participant DB as Database
        participant Signal as Django Signal

        Note over User,Signal: 식자재 구매가 등록/수정
        User->>FE: 식자재 구매가 입력
        FE->>BE: POST /ingredients/{id}/purchase-logs/
        BE->>DB: PurchaseLog 생성
        BE->>DB: g_cost 계산 저장<br/>(구매가 / 순중량g × 수율)
        DB-->>Signal: post_save(PurchaseLog) 발생
        BE-->>FE: 등록 완료 응답
        Note over Signal: → 재귀 계산 플로우로 이동

        Note over User,Signal: 프렙 생성/수정
        User->>FE: 프렙 구성품 설정<br/>(식자재/프렙/부자재 연결)
        FE->>BE: POST or PATCH /preps/{id}/
        BE->>DB: PrepIngredient/PrepPrep/PrepSupplies 저장
        DB-->>Signal: post_save(PrepIngredient 등) 발생
        Signal->>BE: transaction.on_commit
        BE->>BE: prep.recalculate_cost_log()
        BE->>DB: PrepCostLog update_or_create(today)<br/>(Σ 구성품 g_cost × 사용량g + 부자재)
        DB-->>Signal: post_save(PrepCostLog) 발생
        BE-->>FE: 수정 완료 응답
        Note over Signal: → 재귀 계산 플로우로 이동

        Note over User,Signal: 메뉴 생성/수정
        User->>FE: 메뉴 구성품 설정<br/>(식자재/프렙/메뉴/부자재 연결)
        FE->>BE: POST or PATCH /menus/{id}/
        BE->>DB: MenuIngredient/MenuPrep/MenuSubMenu/MenuSupplies 저장
        DB-->>Signal: post_save(MenuIngredient 등) 발생
        Signal->>BE: transaction.on_commit
        BE->>BE: menu.recalculate_cost_log()
        BE->>DB: MenuCostLog update_or_create(today)<br/>(Σ 구성품 g_cost × 사용량g + 부자재)
        DB-->>Signal: post_save(MenuCostLog) 발생
        BE-->>FE: 수정 완료 응답
        Note over Signal: → 재귀 계산 플로우로 이동

    ```
  1. 식자재 구매가 등록 → `PurchaseLog` 생성 → `g_cost = 구매가 / (순중량g × 수율)` 계산
  2. 프렙 생성/수정 → 하위 구성품(식자재/프렙/부자재) 연결 → 각 구성품의 `g_cost × 사용량g` 합산 → `PrepCostLog` 생성
  3. 메뉴 생성/수정 → 하위 구성품(식자재/프렙/메뉴/부자재) 연결 → 각 구성품의 `g_cost × 사용량g` 합산 → `MenuCostLog` 생성
  4. 원가율 계산 → `cost_ratio = (원가 / 세전판매가) × 100`

- 아이템 재귀적 계산
  - **재귀 전파 경로**
    ```json
    식자재 변경 → 프렙 → 상위 프렙 → 메뉴 → 상위 메뉴
    부자재 변경 → 메뉴 → 상위 메뉴
    프렙 변경   → 상위 프렙 → 메뉴 → 상위 메뉴
    메뉴 변경   → 상위 메뉴
    ```
  - 시퀀스 다이어그램
    ```mermaid
    sequenceDiagram
        participant Signal as Django Signal
        participant Sync as CostLogSynchronizer
        participant DB as Database

        Note over Signal,DB: PurchaseLog post_save 시그널 발생

        Signal->>Signal: SignalController 활성 여부 확인
        Signal->>Signal: 중복 실행 방지 체크<br/>(_processing_ingredients)
        Signal->>Sync: transaction.on_commit →<br/>update_related_cost_logs_from_ingredient(id)

        Note over Sync,DB: Step 1: 영향받는 아이템 수집 (BFS)
        Sync->>DB: PrepIngredient.filter(sub_ingredient_id=id)<br/>→ 이 식자재를 쓰는 프렙 ID 수집
        Sync->>DB: PrepPrep.filter(sub_prep_id__in=prep_ids)<br/>→ 상위 프렙 재귀 수집
        Sync->>DB: MenuPrep.filter(sub_prep_id__in=prep_ids)<br/>→ 프렙을 쓰는 메뉴 수집
        Sync->>DB: MenuIngredient.filter(sub_ingredient_id=id)<br/>→ 식자재를 직접 쓰는 메뉴 수집
        Sync->>DB: MenuSubMenu.filter(sub_menu_id__in=menu_ids)<br/>→ 상위 메뉴 재귀 수집

        Note over Sync,DB: Step 2: 프렙 벌크 업데이트 (위상 정렬 순서)
        Sync->>Sync: 위상 정렬 (하위 프렙 → 상위 프렙 순서)
        Sync->>DB: 각 프렙별 구성품 g_cost × 사용량g 합산
        Sync->>DB: PrepCostLog.bulk_create / bulk_update<br/>(purchased_at=today, batch_size=100)

        Note over Sync,DB: Step 3: 메뉴 벌크 업데이트 (위상 정렬 순서)
        Sync->>Sync: 위상 정렬 (하위 메뉴 → 상위 메뉴 순서)
        Sync->>Sync: 프렙 캐시 재사용 (shared_cache)
        Sync->>DB: 각 메뉴별 구성품 g_cost × 사용량g + 부자재 합산
        Sync->>DB: MenuCostLog.bulk_create / bulk_update<br/>(purchased_at=today, batch_size=100)

        Note over Signal,DB: 전체 과정 transaction.atomic()으로 보장

    ```
  1. 식자재 구매가 변경 → `PurchaseLog` post_save 시그널 발생
  2. 해당 식자재를 사용하는 모든 프렙 수집 (`PrepIngredient` 조회)
  3. 해당 프렙을 사용하는 상위 프렙/메뉴도 재귀적으로 수집 (BFS 탐색)
  4. 위상 정렬 (하위 → 상위 순서 보장) → 하위 프렙부터 원가 재계산
  5. 프렙 재계산 완료 → `PrepCostLog` post_save 시그널 → 해당 프렙을 쓰는 메뉴 수집
  6. 메뉴 재계산 완료 → `MenuCostLog` post_save 시그널 → 해당 메뉴를 쓰는 상위 메뉴 수집
  7. 모든 영향받는 아이템 재계산 완료 (`transaction.on_commit`으로 DB 커밋 후 실행)

- 아이템 unLinked
  - 만약 상위 아이템(A)에 포함된채로 하위 아이템(B)을 따로 삭제할경우,
    상위아이템(A)의 중량 및 원가를 유지하기 위해서 **`is_unlinked`** 를 true로 설정한채,
    하위 아이템(B)와 별개의 아이템을 수정이 불가능하고 삭자맨 가능한 형태의 아이템을 상위아이템(A)에 존재하게 된다
  - 이는 해당 아이템이 산출량 %가 아니라 직접 입력을 했을때 (ex 500G) 해당 값이 변하지 않고 유지 되면서 삭제된(B) 아이템을 제외한 산출량의 합보다 (ex 300G) 해당 값이 커지는 오류가 나기 때문이다.
    그렇기에 해당 상위 아이템(A) 에서 해당하는 값을 모두 제거할수 있도록 한다.

## 3.4. 플랜 및 결제 시스템

> NicePay 빌링키 방식으로 자동 결제를 처리하며, 플랜 변경/환불/프로모션/무료체험을 포함한다.

- **플랜 구조**
  | 등급     | 월간     | 연간      | 비고                |
  | -------- | -------- | --------- | ------------------- |
  | BASIC    | 0원      | -         | (무료, 기본)        |
  | PRO      | 19,800원 | 178,200원 | 연간 정가 237,600원 |
  | BUSINESS | 33,000원 | 297,000원 | 연간 정가 396,000원 |
  - 등급 : BASIC (무료), PRO, BUSINESS
  - 주기 : MONTHLY, YEARLY
  - 플랜 상태 : active, trial, suspended, cancelled, expired, pending_change
  - 프로모션 플랜
    - PERIOD (기간권): N일 무료 체험 -> 종료 시 정가 자동결제
    - DISCOUNT (할인권): 즉시 할인 결제 -> N회 할인 -> 소진 후 정가
    - MIXED (혼합권): N일 무료 -> 할인 결제 -> M회 할인 -> 정가
    - 할인 방식: FLAT(정액), RATE(정률), FIXED_PRICE(고정금액)
- **등급별 리소스 제한**
  | 항목        | BASIC | PRO | BUSINESS |
  | ----------- | ----- | --- | -------- |
  | 매장        | 1     | 3   | 10       |
  | 식자재      | 50    | 500 | 1,500    |
  | 부자재      | 5     | 100 | 300      |
  | 프렙        | 10    | 50  | 150      |
  | 메뉴        | 10    | 50  | 150      |
  | 조리 매뉴얼 | 0     | 50  | 150      |
  | 프렙 매뉴얼 | 0     | 50  | 150      |
- **플랜 변경 규칙표**
  | 현재 플랜     | 변경 대상                | 처리 방식 | 환불             | 비고                            |
  | ------------- | ------------------------ | --------- | ---------------- | ------------------------------- |
  | BASIC         | PRO/BUSINESS (월간/연간) | 즉시      | 없음             | 첫 변경 시 무료체험 7일 / 30일  |
  | PRO 월간      | BUSINESS 월간            | 즉시      | 일할 환불        | 차액 결제                       |
  | PRO 월간      | BUSINESS 연간            | 즉시      | 일할 환불        | 차액 결제                       |
  | PRO 월간      | PRO 연간                 | 예약      | 없음             | 다음 결제일에 적용              |
  | PRO 월간      | BASIC                    | 예약      | 없음             | 다음 결제일에 적용              |
  | PRO 연간      | BUSINESS 월간            | 즉시      | 일할 환불        | 차액 결제                       |
  | PRO 연간      | BUSINESS 연간            | 즉시      | 할인가 기준 환불 | 차액 결제                       |
  | PRO 연간      | PRO 월간                 | 예약      | 없음             | 다음 결제일에 적용              |
  | PRO 연간      | BASIC                    | 예약      | 없음             | 다음 결제일에 적용              |
  | BUSINESS 월간 | PRO 월간/연간            | 예약      | 없음             | 다음 결제일에 적용              |
  | BUSINESS 월간 | BUSINESS 연간            | 예약      | 없음             | 다음 결제일에 적용              |
  | BUSINESS 월간 | BASIC                    | 예약      | 없음             | 다음 결제일에 적용              |
  | BUSINESS 연간 | PRO 월간/연간            | 예약      | 없음             | 다음 결제일에 적용              |
  | BUSINESS 연간 | BUSINESS 월간            | 예약      | 없음             | 다음 결제일에 적용              |
  | BUSINESS 연간 | BASIC                    | 예약      | 없음             | 다음 결제일에 적용              |
  | 체험 중       | BASIC                    | 즉시      | 없음             | 체험 즉시 종료                  |
  | 체험 중       | 상위 플랜                | 즉시      | 없음             | 체험 종료 + 결제                |
  | 구독 취소     | BASIC                    | 즉시      | 일할 환불        | 빌링키 비활성화 + 프로모션 취소 |

> 정리: 등급 상향(PRO→BUSINESS)은 즉시 + 환불, 등급 하향/주기 변경은 예약, 체험→변경은 즉시 + 환불 없음

- 결제 서비스
  - BillingKeyService: 카드 등록/삭제
  - PaymentService: 결제 실행 + 할인 반영
  - PaymentPageService: 8가지 시나리오별 결제 페이지 응답
  - PromotionService: 프로모션 검증/적용
  - TrialService: 무료체험 시작/취소/연장
  - AutoBillingService: 자동결제 + 갱신 (38KB, 가장 큰 파일)
  - PlanChangeService: 오케스트레이터 (플랜 변경 전체 관리) auto_billing.py,
  - PlanChangeEngine (nicepay/) 변경 시 사이드이펙트 주의

### 3.4.2. **플랜 변경 플로우**

- **유저 결제 플로우 (무료체험/프로모션/일반 통합)**
  ```mermaid
  sequenceDiagram
      actor User as 유저
      participant FE as 프론트엔드
      participant BE as PlanChangeService
      participant Trial as TrialService
      participant Promo as PromotionService
      participant Pay as ImmediateChangeService
      participant NP as NicePay

      User->>FE: 플랜 변경 요청
      FE->>BE: POST /payments/plan-change/<br/>{ grade, cycle, promotion_code? }

      alt 프로모션 코드 있음
          BE->>Promo: validate_promotion(code, user)
          Promo-->>BE: 검증 결과 (혜택 유형 확인)
          alt PERIOD 혜택 (무료 기간만)
              BE->>Trial: start_trial_internal(user, plan, days)
              Trial-->>BE: Subscription(status=TRIAL) 생성
          else DISCOUNT 혜택 (할인만)
              BE->>Pay: 할인가 즉시 결제
              Pay->>NP: approve_billing_payment(할인가)
              NP-->>Pay: 결제 결과
              Pay-->>BE: Subscription(status=ACTIVE) 생성
          else MIXED 혜택 (무료 기간 + 할인)
              BE->>Trial: start_trial_internal(user, plan, days)
              Trial-->>BE: Subscription(status=TRIAL) 생성<br/>+ PromotionUsageLog(discount_count 저장)
          end

      else BASIC → 유료 (첫 변경)
          BE->>Trial: handle_first_time_trial(user, plan, cycle)
          Trial-->>BE: 14일 무료체험 시작<br/>Subscription(status=TRIAL)

      else 즉시 변경 (등급 상향)
          BE->>Pay: handle_immediate_change(change_rule)
          Pay->>Pay: 일할 환불 금액 계산<br/>(잔여일수/전체일수 × 결제금액)
          Pay->>NP: cancel_payment(환불금액)
          NP-->>Pay: 환불 완료
          Pay->>NP: approve_billing_payment(신규 플랜 금액)
          NP-->>Pay: 결제 완료
          Pay-->>BE: Subscription 교체 + PlanChangeRequest(COMPLETED)

      else 예약 변경 (등급 하향/주기 변경)
          BE->>BE: subscription.schedule_change()<br/>(scheduled_grade, scheduled_cycle, scheduled_at)
          BE-->>FE: PLAN_CHANGE_SCHEDULED 응답
          Note over BE: → 자동 결제 플로우에서 처리
      end

      BE-->>FE: 변경 완료 응답

  ```
- 자동 결제 플로우
  ```mermaid
  sequenceDiagram
      participant Celery as Celery Beat<br/>(매분 실행)
      participant Auto as AutoBillingService
      participant DB as Database
      participant Pay as PaymentService
      participant NP as NicePay
      participant Mail as 이메일 서비스

      Celery->>Auto: process_core_lifecycle_events()
      Auto->>DB: next_billing_date ≤ now인<br/>구독 조회 (ACTIVE/TRIAL/PENDING_CHANGE)

      loop 각 구독별 처리
          alt 체험 만료 (카드 미등록)
              Auto->>DB: Subscription → BASIC PERMANENTLY 전환
              Auto->>Mail: 체험 만료 이메일

          else 체험 만료 (카드 등록됨)
              Auto->>Pay: process_subscription_payment()
              Pay->>NP: approve_billing_payment(빌링키, 금액)
              NP-->>Pay: 결제 결과
              alt 결제 성공
                  Pay-->>Auto: SUCCESS
                  Auto->>DB: 신규 Subscription(ACTIVE) 생성<br/>next_billing_date 갱신
              else 결제 실패
                  Pay-->>Auto: FAILURE
                  Auto->>DB: Subscription → EXPIRED
                  Auto->>Mail: 결제 실패 이메일
                  Note over Auto: 24시간 후 1차 재시도<br/>48시간 후 2차 재시도<br/>3회 실패 시 최종 EXPIRED
              end

          else 예약 변경 있음 (PENDING_CHANGE)
              alt 프로모션 할인 잔여분 있음
                  Auto->>Pay: 할인가로 현재 플랜 결제
                  Auto->>DB: 예약 변경을 신규 구독에 이관
              else 프로모션 없음
                  Auto->>Pay: 예약된 플랜으로 결제
                  Pay->>NP: approve_billing_payment(예약 플랜 금액)
                  NP-->>Pay: 결제 결과
                  Auto->>DB: Subscription(예약 플랜) 생성<br/>PlanChangeRequest(COMPLETED)
              end

          else 일반 갱신
              Auto->>Pay: process_subscription_payment()
              Pay->>NP: approve_billing_payment(빌링키, 금액)
              NP-->>Pay: 결제 결과
              Auto->>DB: next_billing_date 갱신<br/>PlanChangeRequest(EXPIRED_RENEWAL)
          end
      end

  ```

### 3.4.3. 주의사항

- 결제 실패 시 BASIC 다운그레이드가 아닌 **EXPIRED 처리** (데이터 보존, 재결제 유도)
- 환불 금액은 **원래 결제 금액 기준** 일할 계산 (할인 적용 전 금액). 단, 연간→연간 변경은 **할인가 기준** (DISCOUNT_REFUND)
- 프로모션 MIXED 혜택: 무료 기간 종료 후 자동 결제 시 **할인 횟수(discount_count)만큼** 할인가 적용
- 카드 미등록 체험(UNREGISTERED) 만료 시 결제 시도 없이 즉시 BASIC 전환
- 예약 변경(PENDING_CHANGE) 중 프로모션 할인이 남아있으면 현재 플랜으로 할인 결제 후, 예약 변경은 신규 구독에 이관
- 구독 취소 시 빌링키 전체 비활성화(DELETED) + 프로모션 사용 기록 취소(is_cancelled=True)
- `PlanManagementLog`로 모든 구독 상태 변화를 어드민에서 추적 가능
- 모든 결제/환불/실패는 Discord 웹훅 알림 발송

## 3.5. 레시피 및 매출 분석

### 레시피

- `Recipe` 모델이 Menu 또는 Prep과 **1:1 관계** (둘 중 하나만 연결, DB 제약조건)
- `RecipeStep`으로 조리 순서 관리 (order 필드, 이미지 선택 첨부, 설명은 **암호화 저장**)
- 레시피는 첫 스텝 생성 시 자동 생성됨 (Recipe 오브젝트가 on-demand 생성)
- Menu/Prep에 `cooking_tools`(조리도구)와 `multiplier`(배수 설정, 최대 3개, 1~50) 필드 존재
- 스텝 수정은 PUT으로 전체 교체 (atomic transaction)
- 삭제는 soft delete (`is_active=False`, `deleted_at` 설정), 레시피 삭제 시 하위 스텝도 cascade soft delete
- **플랜 제한**: BASIC은 매뉴얼 0개, PRO 50개, BUSINESS 150개 (생성 시 `PlanLimitValidator` 검증)
- **엔드포인트**
  | 메서드              | 경로                            | 용도                                       |
  | ------------------- | ------------------------------- | ------------------------------------------ |
  | GET/PATCH           | `/recipe/menu/{menu_id}/`       | 메뉴 레시피 조회/수정 (도구, 배수, 구성품) |
  | GET/PATCH           | `/recipe/prep/{prep_id}/`       | 프렙 레시피 조회/수정                      |
  | GET/POST/PUT/DELETE | `/recipe/menu/{menu_id}/steps/` | 메뉴 레시피 스텝 CRUD                      |
  | GET/POST/PUT/DELETE | `/recipe/prep/{prep_id}/steps/` | 프렙 레시피 스텝 CRUD                      |

### 매출 분석

- `MenuSales` 모델에 메뉴별 월간 판매량을 `sales_data` JSONField로 저장 (`{"all": 100}`)
- 매출 분석 시 `MenuCostLog`의 `component_cost`(부자재 제외 원가)와 `price`(세전 판매가)를 매칭
- **공헌이익** = `(세전판매가 × 판매량) - (component_cost × 판매량)` (부자재 비용은 분석에서 제외)
- 원가 로그가 해당 월에 없으면 가장 가까운 미래 월의 원가로 대체(backfill)
- 판매 데이터 등록은 POST로 연도별 메뉴별 월간 판매량을 벌크 저장 (`/finances/menu-sales/`)
- 미래 월에는 양수 판매량 입력 불가 (0만 허용)
- 메뉴 생성 시 `MenuSales` order가 자동 생성됨 (시그널, order=1로 삽입 + 기존 메뉴 order+1)
- **엔드포인트**
  | 메서드 | 경로                                                         | 용도                    |
  | ------ | ------------------------------------------------------------ | ----------------------- |
  | GET    | `/finances/menu-sales/?year=2025`                            | 연도별 메뉴 판매량 조회 |
  | POST   | `/finances/menu-sales/`                                      | 판매량 벌크 저장/수정   |
  | GET    | `/finances/menu-analysis/?startdate=2025-05&enddate=2025-05` | 메뉴별 수익성 분석      |

---

## 3.6. 데이터 암호화

> https://systorage.tistory.com/entry/%EC%95%94%ED%98%B8%ED%99%94-%EA%B8%B0%EB%B2%95-%EB%B4%89%ED%88%AC-%EC%95%94%ED%98%B8%ED%99%94-Envelope-encryption

> [암호화 데이터 칼럼](https://www.notion.so/v2-2d880d6ae1578008883adbe7fd17866b?pvs=21)

봉투 암호화 기법을 사용하고 있습니다.

### 3.6.1. 암호화 아키텍처 개요

**2계층 키 관리 (Envelope Encryption)**

| 계층  | 키 종류                   | 저장 위치                                 | 역할                      |
| ----- | ------------------------- | ----------------------------------------- | ------------------------- |
| 1계층 | Master Key (KEK)          | NCP KMS                                   | DEK를 암호화/복호화       |
| 2계층 | Data Encryption Key (DEK) | DB `encryption_keys` 테이블 (래핑된 상태) | 실제 데이터 암호화/복호화 |

**암호화 알고리즘**: AES-256-GCM (12바이트 Nonce, 16바이트 인증 태그)
**키 유도**: HKDF-SHA256

### 3.6.2. 순서 로직

- **데이터 초기 암호화 -** 초기 서버 세팅시 사용
  1. NCP에서 KMS 키를 발급하여 DEK(데이터 암호화 키)를 암호화합니다.

     (구글드라이브 백엔드/백엔드키에 .json 파일들)

  2. 암호화된 키를 encryption_keys Postgrsql DB 테이블에 저장해둠

     > 나중에 키를 바꾸는 시스템이 있음
     > 그렇기 떄문에 이전에 암호화에 썻던 키값을 가지고 있어야함

- **암호화 데이터 사용 로직** - 평시 사용 (이미 세팅이 끝났을떄)
  > DEK키를 KMS로 복호화해서 Redis에 cashing 처리 하여 사용
  1. Redis에 키가 caching 되어 있는지 확인
  2. 없을 경우 KMS 키를 호출, 암호화된 키를 복호화하여 Redis에 저장 (1일)
  3. 복호화된 키를 통해 암호화 된 칼럼을 암호화 후 저장.

### 3.6.3. 봉투 암호화를 선택한 이유

1. 비용을 많이 사용할 수 없다
   - NCP KMS 호출 비용 떄문에 [**암호화 데이터 사용 로직** - 평시 사용 (이미 세팅이 끝났을떄)](https://www.notion.so/32c80d6ae1578082904fe3edd9e15ea7?pvs=21) 에서도 처리한 이유
2. 데이터베이스가 탈취되어도 복호화가 어렵도록 설계하고 싶다.

---

- 실제 데이터베이스에는 KMS키로 암호화된 암호화키만 저장되어 있어, 그 키를 통해 복호화할 수 없음 (해킹 비용 증가)
- 복호화된 키는 Redis에서 1일간 생명주기가 있어서 KMS 호출은 1일 1번만 이루어져 무료로 사용가능함.
- 도메인별로 분리되어있음
  - users → 전화번호
  - store → 자재 이름, 자재 설명, 매장명

---

### 3.6.4. 핵심 모듈 위치

| 모듈               | 경로                    | 역할                                        |
| ------------------ | ----------------------- | ------------------------------------------- |
| 암호화 프리미티브  | crypto.py               | AES-GCM 암복호화                            |
| 암호화 필드        | fields.py               | `EncryptedTextField`, `BlindIndexCharField` |
| 암호화 서비스      | services/encryption.py  | 필드 암복호화 오케스트레이션                |
| 키 메타데이터 모델 | keymeta.py              | `EncryptionKey` DB 모델                     |
| DEK 로더           | dek_loader.py           | DEK 로딩 + Redis 캐싱                       |
| DEK 캐시           | cache.py                | Redis + 인메모리 캐시                       |
| Blind Index        | blind_index.py          | HMAC-SHA256 기반 검색용 인덱스              |
| KMS 클라이언트     | kms.py                  | NCP KMS API 통신                            |
| 결제 암호화        | nicepay/utils/crypto.py | 카드 정보 AES-256-CBC 암호화                |

---

### 3.6.5. 암호화 대상 필드

| 모델       | 필드           | 도메인   | Blind Index           |
| ---------- | -------------- | -------- | --------------------- |
| User       | `phone_number` | `users`  | `phone_number_bi` (O) |
| Ingredient | `description`  | `stores` | X                     |
| Menu       | `description`  | -        | X                     |
| Recipe     | `description`  | -        | X                     |
| Prep       | `description`  | -        | X                     |
| Item       | `name`         | -        | X                     |

---

### 3.6.6. 데이터 흐름

```jsx
[저장 시]
평문 → EncryptedTextField.get_prep_value()
     → FieldEncryptor.encrypt_packed()
     → DEK 캐시 조회 (Redis → KMS fallback)
     → AES-GCM 암호화
     → {v, c, n, t} JSON 형태로 DB 저장

[조회 시]
DB JSON → EncryptedTextField.from_db_value()
        → FieldEncryptor.decrypt_packed()
        → DEK 캐시 조회
        → AES-GCM 복호화
        → 평문 반환

[검색 시 (Blind Index)]
검색어 → NFKC 정규화 + 소문자 변환
       → HKDF로 인덱스 키 유도
       → HMAC-SHA256 해시
       → blind_index 필드로 WHERE 조건 검색
```

---

### 3.6.7. 키 관리 운영 명령어

```jsx
# DEK 초기화 (새 도메인 추가 시)
# 키를 수동으로 변경할때 사용
python manage.py init_dek --domain users --key-version 1 --bytes 32

# DEK 캐시 워밍업 (서버 시작 시)
# 자동으로 되는 redis에 키를 올림
python manage.py warmup_dek_cache

# DEK 상태 확인
python manage.py check_dek_status

# 개발 모드 캐시 워밍업
python manage.py warmup_dek_cache --dev-mode
```

---

### 3.6.8. 환경변수

| 변수                         | 용도                   |
| ---------------------------- | ---------------------- |
| `NAVER_CLOUD_KMS_ACCESS_KEY` | NCP KMS 접근 키        |
| `NAVER_CLOUD_KMS_SECRET_KEY` | NCP KMS 비밀 키        |
| `KMS_BASE`                   | KMS API 엔드포인트     |
| `KMS_KEY_TAG`                | KMS 마스터 키 태그     |
| `REDIS_URL`                  | DEK 캐시용 Redis 주소  |
| `DEK_REDIS_TTL`              | DEK 캐시 TTL           |
| `ENCRYPTION_KEY_REDIS_TTL`   | 키 메타데이터 캐시 TTL |

## 3.6. 로그

참고 : [NCP ELSA 백엔드 로그 코드 규칙](https://www.notion.so/NCP-ELSA-32c80d6ae157803db23bc658c737cd01?pvs=21)

- ex)
  ![스크린샷 2026-03-23 오후 2.37.32.png](attachment:d1c1b815-3b39-4c07-83ce-9b9ac18763e2:스크린샷_2026-03-23_오후_2.37.32.png)

## 3.7. 관리자 페이지 - 서비스 운영

- Admin 접속 정보 /admin
  local : http://localhost:3000/admin
  stg: https://staging.foodlogic.co.kr/
  prod : https://www.foodlogic.co.kr/admin/

### 3.7.1. 대시보드

> 대시보드의 경우 실시간으로 모든 데이터를 시계열로 계산하여 단일 API로 front로 반환한뒤,
> front에서 가공을 하여 사용함

해당 대시보드의 데이터에서는 블랙리스트로 등록된 (prod에서 테스트 또는 내부 계정) 데이터는 필터링하여 나오지 않게 되어있음

>

### 3.7.2. 유저

- 유저 정보
- 유저의 플랜 이력
- 유저의 결제 이력
- 유저 로그인 패턴
- 유저 탈퇴 정보 관리

### 3.7.3. 프로모션 발급 및 내역 관리

- 프로모션을 발급하고, 해당 기록을 추적할수 있는 기능
- A,B,C,D 형태로 구분
  - 해당 내용은 기획 문서 참조

### 3.7.4. 장고 어드민

- 접속 방법
  - api.foodlogic.co.kr/django-admin/
  - 슈퍼 유저 목록
    - test1@foodlogic.co.kr
    - byeongmin.lee@foodlogic.co.kr
    - jidy37@gmail.com
    - hyunwoo.lee@foodlogic.co.kr
  - 유의 사항
    청년쿡푸드테크 센터 공유기(IP)를 통해서만 django-admin에 접속 가능

## 3.8. 기타

- 문서 목록
  프로젝트 내에 문서 목록
  | 문서 \***\*목록 | **CONTEXT.md:** 구독/결제 개편 전체 설계서 (가장 중요)
  **AGENTS.md:** 프로젝트 구조, 명령어, 코드 패턴 가이드
  **HANDOVER.md:** 프로젝트 전체 개요 및 현황
  **payment_page_scenarios/:** 8가지 결제 페이지 응답 예시 (JSON)
  **models.png:\*\* 모델 관계도 |
  | --- | --- |

### 3.8.1. 그외 기능들

- 온보딩 설문
- 매장 관리
- 마이페이지
- 플랜 및 구독 정보

# 4. 클라우드

## 4.1. 사용 인프라

|                    | NCP 서비스 명                                                                           | 설명                                  |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------- |
| Server             | [Sever](https://www.ncloud.com/v2/product/compute/server)                               | 개발 및 운영 서버 2가지 사용          |
| Database           | [Cloud DB for PostgreSQL](https://www.ncloud.com/v2/product/database/cloudDbPostgresql) | prod DB만 사용, 개발 서버는 로컬 사용 |
| Storage (= aws S3) | [Object Storage](https://www.ncloud.com/v2/product/storage/objectStorage)               | **이미지** 파일 저장                  |

Prod 서버 유저 데이터 : `foodlogic-bucket`
stg 서버 유저 데이터 : `test-foodlogic-bucket`

공통 로그 (ELSA 백업) : `foodlogic-logs`

프론트 사용 버킷
`foodlogic-assets` (렌딩 페이지 이미지) |
| Mail | [Cloud Outbound Mailer](https://www.ncloud.com/v2/product/applicationService/cloudOutboundMailer) | 계정 및 결제 관련 메일에서 사용 |
| KMS | [Key Management Service](https://www.ncloud.com/v2/product/security/kms) | [3.6. 데이터 암호화](https://www.notion.so/3-6-5dab2b34921c44a78fe17ff7c19ae5bb?pvs=21) 사용 참조 |
| ELSA | [Effective Log Search & Analytics](https://www.ncloud.com/v2/product/management/elsa) | 로그 시스템
[3.6. 로그](https://www.notion.so/3-6-32c80d6ae157802c9e4ac6dcc0de957b?pvs=21) 참조 |
| 모니터링 - 헬스체크 | [Web service Monitoring System](https://www.ncloud.com/v2/product/management/wms) | 웹 서비스의 정상 동작 여부 모니터링
prod 환경 [api.foodlogic.co.kr/health/](http://api.foodlogic.co.kr/health/) 로 10분에 1번 체크 |
| Sub Account (= AWS IAM) | [Sub Account](https://www.ncloud.com/v2/product/management/subAccount) | NCP 계정 생성 및 키 권한 설정

ex) ObjectStorage에 데이터를 입력하기 위한 ObjectStorage만 접근가능한 ABAC 권한만을 부여한 계정 키를 사용 |

## 4.2. DB

- Postgresql 15
  | local/stg | Docker 내부 DB   |
  | --------- | ---------------- |
  | prod      | NCP DB PostgrSQL |
- 마이그레이션
  > 배포할때 자동으로 마이그레이션도 맞추기 때문에 굳이 마이그레이션을 하지않아도 됩니다.
  >
  > 각각 make all, make staging, make prod면 마이그레이션 생성, 적용, 배포까지 모두 다 됩니다
  - 로컬
    1. 마이그레이션 파일 생성

       ```json
       make migrate
       ```

    2. 마이그레이션 파일 적용

       ```json
       make makemigrations
       ```
  - stg
    ```json
    make staging-migrate
    ```
  - prod
    ```json
    make prod-migrate
    ```

# 5. 배포

> CI/CD에 대한 구성이 없음
> 개발 완료후 stg/prd 서버에 SSH 접속하여 배포하는구조

[1. 키 정보](https://www.notion.so/1-32c80d6ae15780038622d70469f33aa1?pvs=21) 정보에서 pem 키로 user와 pw를 입력하여 SSH 접속

> 현재 prod의 경우 초기 root비밀번호 사용
> stg의 경우 비밀번호 foolo4491

- NCP 내에서 서버 접속 비밀번호 확인 방법
  1. Server → 2. 해당 서버 선택 → 3. 관리자 비밀번호 확인
  ![스크린샷 2026-03-23 오후 1.52.46.png](attachment:3c470b69-4727-4a7e-91c4-1b88302f4834:스크린샷_2026-03-23_오후_1.52.46.png)
  4. 제공된 pem키
  ![스크린샷 2026-03-23 오후 1.53.35.png](attachment:b117426f-4d86-44a1-847b-73fd0e74e147:스크린샷_2026-03-23_오후_1.53.35.png)

> SSL 갱신관련해서
> 현재 SSL은 컨테이너 밖에서 crontab 형태로 진행되고 있습니다.
> 유효기간이 30일 미만으로 남았을 시 renew-ssl-환경.sh을 실행해서 자동 갱신됩니다.
> 새로 서버를 만들거나 변경할 시 확인이 필요합니다 crontab -l

## 5.1. 초기 서버 설정 방법

1. NCP 서버 생성
2. SSH 접속

   [1. 키 정보](https://www.notion.so/1-32c80d6ae15780038622d70469f33aa1?pvs=21)

3. git key 토큰 세팅
4. git clone

   ```bash
   git clone git@github.com:team-foodlogic/backend.git
   cd backend
   ```

5. 환경에 맞는 브랜치 변경
6. env 세팅
   - local: `.env`
   - stg: `.env.staging`
   - prod: `.env.prod`
7. 서버 방화벽 ufw

   ```jsx
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

8. Docker 설치

   ```bash
   sudo apt-get update
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

   ```

9. Certbot(SSL)

   ```jsx
   sudo apt install -y certbot
   sudo certbot certonly --standalone -d api.foodlogic.co.kr
   ```

10. 도커 설치 확인

    ```bash
    docker --version
    ```

11. 환경에 맞는 마이그레이션

    [마이그레이션](https://www.notion.so/32c80d6ae157800992c8f3f5767e0931?pvs=21)
    - stg : sudo make staging
    - prod : sudo make prod

12. SSL 세팅 실행

    ```bash
    # stg
    chmod 777 renew-ssl-staging.sh

    # prod
    chmod 777 renew-ssl-prod.sh
    ```

13. NCP 서버 도메인 연결

## 5.2. 기존 서버 배포 방법

- 업데이트 방법

1. git pull
2. .env 업데이트 (ELSA_PROJECT_VERSION 값 변경 릴리즈 버전)
3. 환경에 따라서 make 실행

# 6. NicePay - 결제 서비스

## 6.1. 로그인 방법

- https://start.nicepay.co.kr/merchant/login/main.do
- 결제 내역에서 실제 결제 내용 확인

## 6.2. 사용정보

> ‼️ 테스트 환경과 실제 프로덕트 환경을 Nicepay에서는 같은 상점을 쓰고 있습니다.

1. Nicepay에서 테스트 상점으로는 환불기능 불가능
2. foodlogic 구독 시스템에서는 결제 후 환불 하는 부분이 많습니다.
   >

- **NicePay가 아닌Admin에서 환불 기능 사용**
  사유 : Admin에 결제 환불 기록이 남아야함
  → NicePay에서 직접 환불시 기록이 남지 않아서 매출 및 정산 데이터와 문제가 생김

## 6.3. 매출 데이터 정합성 확인 방법

> 우리 서버의 DB의 결제 내역과 실제 매출에 대한 비교

*NicePay에는 stg에서 결제한 내역도 들어 있음
*9월에 결제하고 10월에 환불한 경우 각각 달에 대해서 매출 및 손실로 처리됨
이 과정에서 stg에 대한 정보가 있기때문에 현재도 우리서버DB와 실제 결제 내역과의 차이가남
현재 26년 2월 까지의 데이터는 모두 맞는것을 확인함

>

1. prod 백엔드 결제내역 CSV 추출 (admin 페이지)

   ![스크린샷 2026-03-23 오후 3.10.54.png](attachment:c661a125-ff5d-42ce-9c5d-e9f1a0fc4039:스크린샷_2026-03-23_오후_3.10.54.png)

2. Nicepay 결제 내역 CSV 추출 (nicepay → 정산 정보 → 정산 조회 → 거래일자, 거래 건별 체크)

   ![스크린샷 2026-03-23 오후 3.11.38.png](attachment:e29964a9-2439-477f-9fba-60f47c1f5f09:스크린샷_2026-03-23_오후_3.11.38.png)

3. prod 백엔드 결제내역 기준으로 Nicepay 결제 내역 찾기
   1. prod 백엔드 결제 내역 기준으로 확인 (Nicepay에는 staging 내용도 섞여있기 때문)
4. prod 백엔드 결제 내역 중에서 Nicepay에 추가적으로 환불된 경우가 있는지 확인.
5. 추가 환불이 된 경우가 있으면 내용 반영

# 7. 기타

## 7.1. Discord Webhook

### 7.1.2. 웹훅 사용처에 대한 안내

> discord 상단부에 다음 내용들에 해당하는 정보를 백엔드 서버에서 실시간으로 웹훅으로 제공

- discord 채널 참고 이미지
  ![스크린샷 2026-03-23 오후 1.55.15.png](attachment:fa5fb140-cf91-452a-af10-4a24a4bfb31f:스크린샷_2026-03-23_오후_1.55.15.png)

### 7.1.3. 웹훅 데이터에 대한 안내

> 아래 번호는 각 디스코드 채널별 분류임

- 무료체험
  1. 무료체험 시작시

     유저 이메일및 가입시작, 플랜정보 등 프로모션의 경우 해당 정보까지 포함

  2. 무료체험 해지시

     해지된 값에 대한 ID와 플랜정보
- 결제 실패
  - 결제 실패
- 결제 완료
  결제 ID 및 플랜 및 자동 결제인지 등에 대한 정보
- 데이터 분석
  현재는 ADMIN 페이지 대시보드에 데이터만을 사용

# 8. 기타 정보

1. 기획 문서 : [[기획] 프로젝트](https://www.notion.so/23780d6ae157806fad98c8e4c37a082b?pvs=21)
2. 참고 디자인 피그마 : https://www.figma.com/design/fittzDFCwBlpixE6ChBdFc/foodlogic_-%EB%A9%94%EC%9D%B8-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8--25.05.19-?node-id=15986-3015&p=f&m=dev
3. 참고 개발 문서
   1. [백엔드 인수인계서 - 요약](https://www.notion.so/32880d6ae157801ea2dac1101a0f8a8e?pvs=21)
   2. [NCP ELSA 백엔드 로그 코드 규칙](https://www.notion.so/NCP-ELSA-32c80d6ae157803db23bc658c737cd01?pvs=21)
   3. [결제 & 비즈니스 로직](https://www.notion.so/32980d6ae157807792a4c89bb2055abb?pvs=21)
4. 자재데이터

   삼성 웰스토리에서 제공된 데이터를 우리 데이터에 일부 가공하여 해당 Table에 밀어넣음
   관련 파일 : wellstory.tsc

5. 과거 결제 데이터의 날짜나, 플랜등의 값이 안맞아서 강제로 맞춘 이력이 있음
6. 버전 이력의 경우 front,back 각각 따로 관리하고, Relase할때 통합 버전을 따로 두고 업데이트함

   릴리즈되는 버전의 경우, 실제 유저에게 영향이 가는 경우만 업데이트함 (단순 오류 수정 X)
   - 현재까지 변경이력
     | 버전                          | 날짜             | 변경 내용                                               |
     | ----------------------------- | ---------------- | ------------------------------------------------------- |
     | 1.4.1                         | -                | - 신청 철회 기능 추가                                   |
     | - Admin 페이지 환불 기능 추가 |
     | 1.4.0                         | 2026-03-17 09:25 | **온보딩 추가**: 온보딩 가이드 추가, 요금제 선택창 추가 |
     **프로모션 정책 변경**: 기존 무료체험과 분리, 프로모션 혜택 종류 추가 (기간권, 할인권, 혼합권), 유료 플랜이 아닌경우에만 사용하도록 변경
     **플랜 정책 변경**: 초기 플랜 선택시 카드 등록 없이 가능 추가, 카드등록에 따라서 무료 체험 7/30일 제공
     **결제 및 플랜 UI 변경 및 추가**: 결제 히스토리 페이지 추가, 결제 모달 페이지로 변경
     **어드민 대시보드 업데이트 - MRR 및 ARR** |
     | 1.3.11 | 2026-03-10 09:00 | - 약관 업데이트 공지 및 안내 팝업
     - PC 최적화 접속 안내 팝업 |
       | 1.3.10.patch.2 | 2026-03-03 09:23 | - 재결제 사전 고지 공지 |
       | 1.3.10.patch.1 | 2026-02-12 15:06 | - 구성품목 모달 자재데이터 탭에 툴팁 추가 |
       | 1.3.10 | 2026-02-09 14:45 | - 어드민 블랙 리스트 기능 추가
     - 자재 데이터 카테고리 별 가중치 기능 추가 |
       | 1.3.9 | 2026-02-04 17:10 | - 자재데이터 (웰스토리) 이미지
     - **admin 기능 추가**: 대시보드 페이지, 변경이력 페이지
     - 위키 데이터 업데이트 |
       | 1.3.8 | 2026-02-02 09:43 | - 사이드바 순서 수정-자재 데이터를 맨 처음으로
       **admin 업데이트**: 탈퇴 페이지 추가, 플랜 변경 페이지 접근 알림 추가, 유저 통합 상세 보기 추가, 일부 열 순서 변경 |
       | 1.3.7 | 2026-01-26 10:27 | - 자재 데이터 - 카테고리
     - 위키페이지 |
       | 1.3.6 | 2026-01-19 10:45 | - 모바일 디자인 반영
     - 캠페인 추적 업데이트 (어드민 포함)
     - 유저 행동 분석용 로그 추가 |
       | 1.3.5 | 2025-12-29 16:50 | **메뉴 투어 기능
       대량 등록 임시저장 (only front)** |
       | 1.3.4 | 2025-12-24 16:00 | **자재 데이터 추가 가능
       각 아이템 검색 및 페이지네이션 추가
       기타 개선 사항**: 등록 및 수정 폼에 아코디언 추가, 각 item name/description 길이 제한 변경 50자 → 100자 |
       | 1.3.3 | 2025-12-18 09:13 | **사진 편집 기능 추가
       약관 추가** |
       | 1.3.2 | 2025-12-10 11:20 | **메뉴 인분 수 단위 추가
       메뉴 삭제시 하위 구성품목 유지되도록 변경
       회원가입시 24시간 프로모션 유도 창 추가** |
       | 1.3.1 | 2025-12-01 10:55 | **소셜 로그인
       엑셀 내려 받기** |
       | 1.3.0 | 2025-11-20 15:35 | **아이템 복제**: 식자재, 부자재, 프렙, 메뉴 복사 지원 / 메뉴 및 프렙 복사시 관련 매뉴얼도 같이 복사 |
       | 1.3.0 | 2025-11-19 13:20 | **메뉴 분석**: 메뉴 엔지니어링, 메뉴 ABC 분석 |
       | 1.2.0 | 2025-11-11 18:15 | - 부자재 추가
     - 어드민 구독 플랜 변경 |
       | 1.1.6 | 2025-11-04 15:50 | - 휴대폰 인증 추가
     - 고객센터 번호 변경
     - 식자재 등록 및 수정 시트에서 페이지로 UI 개선 |
       | 1.1.5 | 2025-10-30 14:50 | - 식자재 대량 업로드 |
       | 1.1.4 | 2025-10-21 | - 가입자 설문 개선 |
       | 1.1.3 | 2025-10-17 | - 매장 접속시 가이드 팝업 추가 |
       | 1.1.2 | 2025-10-15 12:50 | - 식자재 면/과세 수정 기능 추가 |
       | 1.1.1 | 2025-10-14 09:40 | - 회원가입시 매장 생성 유도 버튼 추가
     - 매장 생성 UI 개선
     - 모바일 접속시 서비스 이용 제한 안내 모달 |
       | 1.1.0 | 2025-10-01 16:00 | **EA 단위 추가**: 식자재 등록 및 수정시에 EA값을 추가, 프렙이나 메뉴에서 식자재를 구성품목으로 추가할 경우 EA 선택 가능
     - 메뉴-매운맛&제공온도 입력 UI 변경 |
       | 1.0.3 | 2025-09-24 09:20 | - 식자재 매입가격 0원 입력 가능하도록 수정
     - 콘솔 페이지 내부에 오픈 채팅 접속 버튼 추가 |
       | 1.0.2 | 2025-09-19 | - 프로모션/플랜, 결제창/플랜변경 신청창 개선
     - 식자재/프렙/메뉴 등록 페이지 배치 변경
     - 메뉴 등록, 수정 및 상세 페이지에서 1인분당 원가 가격 추가 |
       | 1.0.1 | 2025-09-15 | - 예시 매장 데이터 업데이트
     - 베이직 플랜 레시피 제한 및 가격 설명 업데이트
     - 아이템(식자재, 프렙, 메뉴) 입력시 폼 필수값, 선택값 업데이트 |
       | 1.0.0 | 2025-08-27 10:02 | - 런칭 |

7. 기존에 4.6일날 재결제시도를 추가로 더 하는 업데이트를 하려고 프론트에서 약관 업데이트를 했지만 백엔드 개발자 변경 이슈로 서버는 업데이트 하지 못함
