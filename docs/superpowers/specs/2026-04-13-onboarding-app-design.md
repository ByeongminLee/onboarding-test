# 개발자 온보딩 애플리케이션 — 설계 문서

**작성일**: 2026-04-13
**상태**: 설계 확정, 구현 계획 수립 대기

---

## 1. 개요

신규 입사자를 위한 **오프라인 Electron 데스크톱 앱**. React + HeroUI v3 기반, MDX로 콘텐츠 작성, localStorage로 진행 상태 영속화.

입력 스펙 문서:
- `spec/definition-purpose.md`
- `spec/tech-spec.md`
- `spec/ui-spec.md`
- `spec/contents-spec.md`
- `spec/onboarding-prototype.html`

---

## 2. 핵심 설계 결정 사항

브레인스토밍 과정에서 확정된 결정들:

| 결정 | 선택 | 이유 |
|------|------|------|
| 진행 제약 | **자유 모드** (기본), 강제는 옵셔널 | 경력직 온보딩 대상, 자유 스캔 필요 |
| 완료 판정 | **유저가 "완료" 버튼 직접 클릭** | 단순하고 명시적 |
| 강제 모드 범위 | **frontmatter `enforce: boolean` 필드로 스텝별 지정** | 콘텐츠 작성자가 필수 여부 결정 |
| 콘텐츠 소싱 | **파일 시스템 기반** (`content/part-*/NN-*.mdx`) | 파일만 추가하면 자동 수집 |
| 정렬 방식 | **파일/폴더명 prefix + frontmatter 메타데이터** | 한 파일만 수정하면 됨 |
| 네비게이션 구조 | **Part → Document 2단계 계층** | 스펙의 9개 Part를 그룹으로 사용 |
| Part 메타데이터 | **각 Part 폴더의 `_meta.json`** | 한곳에서 관리, 폴더명은 정렬 목적 |
| 진행률 계산 | **전체 문서 기준 단순 비율** (`완료 수 / 전체 수`) | 직관적 |

**이번 배포의 기본 동작**: 모든 스텝 `enforce: false` → 완전 자유 모드.

---

## 3. 전체 아키텍처

```
┌─── Electron Main ────────────────────────────────┐
│  BrowserWindow (single) — file:// 로 렌더러 로드 │
└──────────────────────────────────────────────────┘
                       │
┌─── Renderer (React 19) ──────────────────────────┐
│  App                                             │
│  ├─ Sidebar (Progress + PartList)                │
│  └─ MainArea (TopBar + ContentArea)              │
│                                                  │
│  Layers:                                         │
│  1. Content Layer   — MDX + _meta.json 번들링    │
│  2. Store Layer     — zustand + persist          │
│  3. UI Layer        — HeroUI v3 컴포넌트         │
│  4. MDX Layer       — MDXProvider + 커스텀 컴포  │
└──────────────────────────────────────────────────┘
```

**외부 통신 없음**. 모든 에셋/콘텐츠는 빌드 타임에 번들에 포함.

### 데이터 흐름

1. 앱 시작 → Vite의 `import.meta.glob`으로 모든 MDX + `_meta.json` 수집
2. 메모리 내 불변 `ContentTree` 생성 (파트 배열, 각 파트에 docs 배열)
3. zustand store가 localStorage에서 진행 상태 rehydrate
4. 유저 인터랙션 → store action → 리렌더 → localStorage 자동 동기화

---

## 4. 기술 스택

| 영역 | 선택 |
|------|------|
| Framework | React 19 |
| Desktop | Electron (electron-vite 또는 electron-forge + Vite) |
| Bundler | Vite (MDX 플러그인 포함) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Library | HeroUI v3 (`@heroui/react` + `@heroui/styles`) |
| State | zustand + `persist` 미들웨어 |
| Content | MDX (`@mdx-js/react`, `@mdx-js/rollup`) |
| Schema | Zod (frontmatter 검증) |
| Test | Vitest + @testing-library/react, Playwright (E2E) |

### HeroUI v3 필수 규칙

- `@import "tailwindcss"` 먼저, 그 다음 `@import "@heroui/styles"` (순서 중요)
- **Provider 사용 안 함**
- 컴파운드 패턴: `Checkbox.Control`, `Checkbox.Indicator`, `Checkbox.Content`, `<Label>` 등
- Button 클릭은 `onPress` (not `onClick`)
- Checkbox는 `isSelected` / `onChange(selected)`
- 다크 테마는 `<html class="dark">`, oklch 컬러 사용

---

## 5. 콘텐츠 구조

### 파일 시스템 레이아웃

```
content/
  part-1-account-check/
    _meta.json
    01-github.mdx
    02-notion.mdx
    03-discord.mdx
    04-google-calendar.mdx
  part-2-env-setup/
    _meta.json
    01-docker.mdx
    02-python.mdx
    03-frontend.mdx
    ...
  ...
  part-9-future/
    _meta.json
    01-open-issues.mdx
```

### 정렬 규칙

- **Part**: 폴더명 `part-{N}-{slug}`의 `N`으로 정렬
- **Document**: 파일명 `{NN}-{slug}.mdx`의 `NN`으로 정렬

### `_meta.json` 스키마

```json
{
  "title": "계정 체크",
  "description": "팀 협업 도구 계정 초대를 확인합니다"
}
```

### MDX frontmatter 스키마 (Zod 검증)

```yaml
---
title: "GitHub 초대 확인"
description: "GitHub 조직 초대를 수락하고 2FA를 활성화합니다"
type: "checklist"        # "checklist" | "mission" | "learn"
enforce: false           # 기본 false, true면 완료 조건 강제
---
```

### Document ID 규칙

`{partFolder}/{docFile}` (확장자 제외)
예: `part-1-account-check/01-github`

이 ID가 store의 모든 key에 사용됨. 파일명 변경 시 해당 진행 상태가 리셋되는 건 허용 가능한 trade-off.

### 빌드 타임 수집

```ts
const mdxModules = import.meta.glob('/content/**/*.mdx', { eager: true });
const metaModules = import.meta.glob('/content/**/_meta.json', { eager: true });
```

수집 후 `ContentTree` 빌더가 Part 배열 생성. `_meta.json` 누락 또는 frontmatter 스키마 위반 시 빌드 실패.

---

## 6. 상태 관리

### Store 스키마

```typescript
interface OnboardingState {
  // 문서 완료 (유저가 "완료" 버튼 클릭)
  completions: Record<string, boolean>;      // { [docId]: true }

  // 인터랙티브 컴포넌트 상태
  checks: Record<string, boolean>;            // { "docId:checkId": true }
  quizzes: Record<string, number>;            // { docId: selectedOptionIndex }
  missions: Record<string, string>;           // { docId: noteText }

  // 네비게이션
  currentDocId: string | null;

  // Actions
  toggleCheck: (docId: string, checkId: string) => void;
  setQuizAnswer: (docId: string, optionIdx: number) => void;
  setMissionNote: (docId: string, text: string) => void;
  markComplete: (docId: string) => void;
  unmarkComplete: (docId: string) => void;
  setCurrentDoc: (docId: string) => void;
  reset: () => void;
}
```

### Persist 설정

- Key: `onboarding-state-v1`
- 스키마 변경 시 `v2`로 버전업 → 이전 데이터 자동 무시
- `onRehydrateStorage` 콜백에서 localStorage 접근 실패 감지

### 파생 값 (selector)

```typescript
// 전체 진행률
const overallProgress = useOnboardingStore(s =>
  Object.values(s.completions).filter(Boolean).length / totalDocs
);

// 완료 버튼 활성화 여부
function canComplete(doc: Doc, state: OnboardingState): boolean {
  if (!doc.enforce) return true;
  switch (doc.type) {
    case 'checklist':
      return doc.checklistItems.every(id => state.checks[`${doc.id}:${id}`]);
    case 'learn':
      return doc.quiz ? state.quizzes[doc.id] === doc.quiz.answer : true;
    case 'mission':
      return (state.missions[doc.id] ?? '').trim().length > 0;
  }
}
```

---

## 7. UI 레이아웃

```
┌─────────────────────────────────────────────────┐
│ Sidebar 260px    │ TopBar (sticky)              │
│                  ├──────────────────────────────┤
│ ▓▓▓▓▓▓░░░ 68%   │ [CHECKLIST] GitHub 초대 확인 │
│                  │             [◀ 이전] [다음 ▶]│
│ ▸ Part 1. 계정   ├──────────────────────────────┤
│   ✓ GitHub       │                              │
│   ○ Notion       │  MDX 콘텐츠 렌더링           │
│                  │  - 헤더, 본문                │
│ ▸ Part 2. 환경   │  - <Check> 체크박스          │
│   ○ Docker       │  - <Quiz> 옵션               │
│   ...            │  - <Mission> 카드 + 노트     │
│                  │                              │
│                  │  [✓ 완료로 표시]             │
└──────────────────┴──────────────────────────────┘
```

### 컴포넌트 트리

```
<App>
  <Sidebar>
    <ProgressSection />       # ProgressBar (전체 %)
    <PartList>
      <PartGroup>             # _meta.json 기반
        <DocItem />            # 완료 체크마크 + 활성 하이라이트
      </PartGroup>
    </PartList>
  </Sidebar>
  <MainArea>
    <TopBar>
      <TypeBadge />           # CHECKLIST / MISSION / LEARN
      <DocTitle />
      <NavButtons />          # 이전/다음 (전체 문서 순서)
    </TopBar>
    <ContentArea>
      <ErrorBoundary>
        <MDXContent />
        <CompleteButton />
      </ErrorBoundary>
    </ContentArea>
  </MainArea>
</App>
```

### 커스텀 MDX 컴포넌트

```tsx
// <Check id="github-invite">초대 수락</Check>
<Checkbox isSelected={checked} onChange={toggle}>
  <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
  <Checkbox.Content>
    <Label>{children}</Label>
    {hint && <Description>{hint}</Description>}
  </Checkbox.Content>
</Checkbox>

// <Quiz question="..." options={[...]} answer={1} />
// <Mission title="..." description="..." /> + <MissionNote />
// <Glossary term="MAU">월간 활성 사용자</Glossary>
// <Head title=... /> — frontmatter 대안
```

### 완료 버튼 동작

```tsx
<Button
  variant="primary"
  onPress={() => markComplete(docId)}
  isDisabled={doc.enforce && !canComplete(doc, state)}
>
  {isCompleted ? "✓ 완료됨" : "완료로 표시"}
</Button>
```

`enforce: true` 이면서 조건 미충족 시 툴팁 "필수 항목을 먼저 완료하세요".

### 비주얼 디자인

`spec/ui-spec.md` 의 다크 테마 팔레트 그대로 사용, HeroUI oklch 변수로 치환:

```css
--bg: #0a0a0c;
--surface: #141418;
--accent: #5bff9f;  /* 완료/성공 */
--mission: #7b93ff;
--learn: #ffd166;
```

폰트: Noto Sans KR (본문), JetBrains Mono (배지/숫자/코드).

---

## 8. 에러 핸들링

| 에러 | 처리 |
|------|------|
| MDX 파싱 에러 | 빌드 타임 실패 (Vite) — 런타임 노출 없음 |
| frontmatter 스키마 위반 | 빌드 타임 Zod 검증 실패, 파일 경로 포함 메시지 |
| `_meta.json` 누락 | 빌드 실패 |
| localStorage 접근 실패 | `onRehydrateStorage` 콜백 감지, 상단 배너 "진행 상황이 저장되지 않을 수 있습니다" + 인메모리 동작 계속 |
| 잘못된 `currentDocId` | 첫 문서로 fallback + 토스트 안내 |
| MDX 런타임 에러 | `<ContentArea>` Error Boundary + 파일 경로 표시 + 다른 문서로 이동 버튼 |
| Quiz answer 범위 초과 | 빌드 타임 Zod 검증 |

**오프라인 전용이므로 네트워크 에러는 없음.**

---

## 9. 테스팅

### Unit (Vitest)

- Store actions: `markComplete`, `toggleCheck`, `setQuizAnswer`, `setMissionNote`, `reset`
- `canComplete` selector: 각 type + `enforce` on/off 조합
- 진행률 계산: 0개/부분/전체 완료
- frontmatter Zod 스키마: 유효/무효 케이스
- ContentTree 빌더: 정렬, `_meta.json` 매핑

### Component (Vitest + @testing-library/react)

- `<Check>`: 클릭 시 store 업데이트, 완료 표시
- `<Quiz>`: 선택 시 즉시 피드백 (정답/오답)
- `<Mission>` + `<MissionNote>`: 입력 시 store 동기화
- `<CompleteButton>`: `enforce` on + 조건 미충족 시 `isDisabled`
- `<Sidebar>`: 완료 체크마크, 활성 하이라이트

### E2E (Playwright, Electron)

- 자유 모드: 임의 문서로 바로 이동 가능
- 완료 버튼 클릭 → 진행률 반영 → 앱 재시작 후 상태 유지
- `enforce: true` 문서: 조건 충족 전 버튼 비활성, 충족 후 활성화
- 패키징된 앱 스모크 테스트 (`pnpm package` 산출물)

### 테스트 범위 제외

- HeroUI/Electron 내부 동작 (벤더 신뢰)
- MDX 컴파일러 (Vite 플러그인 신뢰)

---

## 10. 빌드 및 배포

- **개발**: `pnpm dev` — Vite HMR + Electron
- **빌드**: `pnpm build` — 렌더러 번들 생성
- **패키징**: `pnpm package` — `.dmg` (macOS) / `.exe` (Windows) 산출
- 모든 에셋 번들 포함, 인터넷 연결 불필요

---

## 11. 향후 확장 고려 (Out of Scope for v1)

- 다국어 (영문판)
- 역할별 온보딩 경로 (백엔드/프론트엔드/DevOps 분기)
- 앱 설정 화면에서 전역 `enforce` 오버라이드 (현재는 frontmatter only)
- 완료 항목 검색/필터
- 진행 상황 내보내기/가져오기

---

## 12. 범위 요약

### 포함
- 9개 Part × N개 Document 구조의 MDX 콘텐츠 시스템
- 파일 시스템 기반 자동 수집
- Part별 `_meta.json`
- frontmatter `enforce` 필드로 스텝별 강제 여부 지정
- 체크리스트/미션/학습(퀴즈) 3가지 타입
- localStorage 영속화
- 전체 문서 기준 진행률 표시
- 자유 이동 네비게이션
- Electron 오프라인 패키징

### 미포함
- 계정 초대 실제 발송
- 환경 자동 설치 스크립트
- 서버 동기화
- 다중 사용자
- 웹 배포
