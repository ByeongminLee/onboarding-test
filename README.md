# Developer Onboarding App

신규 개발자 온보딩용 오프라인 Electron 데스크톱 앱.  
React 19 + Vite + HeroUI v3 + MDX + zustand, localStorage 기반 영속화.

## 개발

```bash
pnpm install
pnpm dev       # Electron 창 띄워 개발
```

## 콘텐츠 작성

`src/renderer/content/part-{N}-{slug}/` 아래에 파일을 추가합니다.

- `_meta.json` — 해당 Part의 제목/설명:
  ```json
  { "title": "계정 체크", "description": "협업 도구 계정을 확인합니다" }
  ```
- `{NN}-{slug}.mdx` — 문서 파일. 앞 두 자리가 문서 순서.

### MDX frontmatter

```yaml
---
title: 문서 제목
description: 한 줄 설명
type: checklist | mission | learn
enforce: false
---
```

- `type`에 따라 상단 배지가 달라집니다 (`CHECKLIST`, `MISSION`, `LEARN`).
- `enforce: true`면 해당 문서에서 지정된 조건(모든 체크 완료, 퀴즈 답변, 미션 노트 작성)을 충족해야 완료 버튼이 활성화됩니다.
- 이 앱은 **자유 모드 기본** — 모든 문서 `enforce: false`로 두면 유저가 자유롭게 완료 처리할 수 있습니다.

### 사용 가능한 커스텀 컴포넌트

```mdx
<Check id="github">GitHub 초대 수락</Check>
<Check id="2fa" hint="설정 → Security → 2FA">2FA 활성화</Check>

<Quiz question="Phase는?" options={["1","2","3"]} answer={1} />

<Mission title="미션 1" description="서비스 체험" />
<MissionNote />

<Glossary term="MAU">월간 활성 사용자</Glossary>

<Head title="제목" date="2026-04-13" description="설명" />
```

## 테스트

```bash
pnpm test         # unit + component (vitest)
pnpm test:e2e     # electron e2e (playwright, GUI 환경 필요)
pnpm typecheck
```

## 빌드 및 패키징

```bash
pnpm build          # 렌더러/메인/프리로드 번들
pnpm package        # unpacked .app / .exe 디렉터리 (빠른 검증용)
pnpm package:full   # .dmg / .exe 설치파일 생성
```

산출물은 `dist/`에 생성됩니다.

## 아키텍처 개요

- `src/main/`, `src/preload/`, `src/renderer/` — electron-vite 표준 구조
- `src/renderer/content/` — 파일시스템 기반 콘텐츠 + Zod 스키마 + 순수 빌더
- `src/renderer/store/` — zustand 스토어 + persist + selectors
- `src/renderer/mdx/` — 커스텀 MDX 컴포넌트 + `<MdxComponents>` provider
- `src/renderer/ui/` — Sidebar, TopBar, ContentArea 등 레이아웃 컴포넌트

설계 문서: `docs/superpowers/specs/2026-04-13-onboarding-app-design.md`  
구현 계획: `docs/superpowers/plans/2026-04-13-onboarding-app.md`
