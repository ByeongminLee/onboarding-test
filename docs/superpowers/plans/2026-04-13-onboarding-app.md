# 개발자 온보딩 앱 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 신규 개발자 온보딩용 오프라인 Electron 데스크톱 앱을 구현한다. 9개 Part의 MDX 콘텐츠, 체크리스트/미션/학습 타입, 자유 네비게이션, localStorage 영속화.

**Architecture:** Electron(메인) + React 19(렌더러) + Vite 번들. 콘텐츠는 파일시스템 기반 MDX를 빌드 타임에 glob으로 수집. 진행 상태는 zustand `persist`로 localStorage에 저장. UI는 HeroUI v3(Tailwind v4 + 컴파운드 컴포넌트).

**Tech Stack:** React 19, Electron, Vite, TypeScript, Tailwind CSS v4, HeroUI v3 (`@heroui/react` + `@heroui/styles`), zustand, MDX (`@mdx-js/rollup`), Zod, Vitest, @testing-library/react, Playwright, pnpm.

---

## File Structure

```
.
├─ electron/
│  ├─ main.ts                        # Electron main process
│  └─ preload.ts                     # Minimal preload (no node integration needed)
├─ src/
│  ├─ main.tsx                       # React entry
│  ├─ App.tsx                        # Root layout (Sidebar + MainArea)
│  ├─ index.css                      # Tailwind + HeroUI + theme vars
│  ├─ content/
│  │  ├─ schema.ts                   # Zod schemas for frontmatter + _meta.json
│  │  ├─ tree.ts                     # ContentTree builder (glob import)
│  │  └─ types.ts                    # Doc, Part, ContentTree types
│  ├─ store/
│  │  ├─ onboarding-store.ts         # zustand store + persist
│  │  └─ selectors.ts                # overallProgress, canComplete
│  ├─ mdx/
│  │  ├─ provider.tsx                # MDXProvider with custom components
│  │  ├─ Check.tsx                   # <Check id="...">라벨</Check>
│  │  ├─ Quiz.tsx                    # <Quiz question options answer />
│  │  ├─ Mission.tsx                 # <Mission> + <MissionNote />
│  │  ├─ Glossary.tsx                # <Glossary term>정의</Glossary>
│  │  └─ Head.tsx                    # <Head title ... /> (frontmatter 대안)
│  ├─ ui/
│  │  ├─ Sidebar.tsx                 # ProgressSection + PartList
│  │  ├─ ProgressSection.tsx         # 전체 진행률 바
│  │  ├─ PartList.tsx                # Part 그룹 목록
│  │  ├─ DocItem.tsx                 # 단일 문서 아이템
│  │  ├─ TopBar.tsx                  # 타입 배지 + 제목 + 이전/다음
│  │  ├─ ContentArea.tsx             # MDX 렌더 + 완료 버튼
│  │  ├─ CompleteButton.tsx
│  │  ├─ ErrorBoundary.tsx
│  │  └─ StorageWarning.tsx          # localStorage 실패 배너
│  └─ lib/
│     └─ storage-check.ts            # localStorage 접근 가능 여부
├─ content/
│  ├─ part-1-account-check/
│  │  ├─ _meta.json
│  │  └─ 01-github.mdx
│  └─ part-2-env-setup/
│     ├─ _meta.json
│     └─ 01-docker.mdx
├─ tests/
│  ├─ unit/
│  │  ├─ schema.test.ts
│  │  ├─ tree.test.ts
│  │  ├─ store.test.ts
│  │  └─ selectors.test.ts
│  ├─ component/
│  │  ├─ Check.test.tsx
│  │  ├─ Quiz.test.tsx
│  │  ├─ Mission.test.tsx
│  │  ├─ CompleteButton.test.tsx
│  │  └─ Sidebar.test.tsx
│  └─ e2e/
│     └─ onboarding.spec.ts
├─ index.html
├─ vite.config.ts
├─ electron.vite.config.ts           # 또는 통합 설정
├─ tsconfig.json
├─ tailwind.config.ts                # v4는 CSS-first지만 plugin 등록용
├─ playwright.config.ts
├─ package.json
└─ pnpm-lock.yaml
```

---

### Task 1: 프로젝트 초기화 (Electron + Vite + React + TS)

**Files:**
- Create: `package.json`, `tsconfig.json`, `electron.vite.config.ts`, `index.html`, `electron/main.ts`, `electron/preload.ts`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: electron-vite 기반 프로젝트 초기화**

`electron-vite`는 Electron + Vite + React + TS 통합 설정을 제공한다.

```bash
pnpm create @quick-start/electron onboarding-app -- --template react-ts
```

이미 `/Users/byeongmin/Desktop/onboarding` 디렉터리가 존재하므로, 생성된 내용을 현재 디렉터리로 병합한다 (필요 시 임시 디렉터리에 생성 후 파일 이동). 기존 `spec/`, `docs/` 는 보존.

- [ ] **Step 2: 필수 의존성 설치**

```bash
pnpm add react@^19 react-dom@^19 zustand @heroui/react @heroui/styles
pnpm add -D typescript vite electron electron-builder @types/react @types/react-dom \
  tailwindcss@next @tailwindcss/vite \
  @mdx-js/rollup @mdx-js/react remark-frontmatter remark-mdx-frontmatter \
  zod vitest @testing-library/react @testing-library/jest-dom jsdom \
  @playwright/test
```

- [ ] **Step 3: `package.json` 스크립트**

```json
{
  "name": "onboarding-app",
  "version": "0.1.0",
  "type": "module",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "package": "electron-vite build && electron-builder",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 4: `electron/main.ts` — 최소 BrowserWindow**

```ts
import { app, BrowserWindow } from 'electron';
import path from 'node:path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

- [ ] **Step 5: `electron/preload.ts` — 빈 preload**

```ts
// Offline-only app. No IPC bridges exposed.
export {};
```

- [ ] **Step 6: `src/main.tsx` + `src/App.tsx` placeholder**

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
```

```tsx
// src/App.tsx
export default function App() {
  return <div className="p-6 text-text">Onboarding App</div>;
}
```

- [ ] **Step 7: `pnpm dev` 실행 확인**

Expected: Electron 창이 열리고 "Onboarding App" 텍스트 표시.

- [ ] **Step 8: Commit**

```bash
git init && git add -A
git commit -m "chore: scaffold electron-vite + react + typescript"
```

---

### Task 2: Tailwind v4 + HeroUI v3 통합

**Files:**
- Create: `src/index.css`
- Modify: `electron.vite.config.ts` (Tailwind Vite 플러그인)

- [ ] **Step 1: Vite 설정에 Tailwind 플러그인 추가**

`electron.vite.config.ts` 의 renderer config에:

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // ... main, preload configs
  renderer: {
    plugins: [react(), tailwindcss()],
  },
});
```

- [ ] **Step 2: `src/index.css` — HeroUI import 순서 준수**

```css
@import "tailwindcss";
@import "@heroui/styles";

:root {
  --bg: #0a0a0c;
  --surface: #141418;
  --surface2: #1c1c22;
  --border: #2a2a33;
  --text: #e8e8ec;
  --text-dim: #7a7a88;
  --accent: #5bff9f;
  --warn: #ff6b6b;
  --mission: #7b93ff;
  --learn: #ffd166;
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: "Noto Sans KR", system-ui, sans-serif;
}

.mono {
  font-family: "JetBrains Mono", monospace;
}
```

- [ ] **Step 3: `<html class="dark">` 적용**

`index.html` 의 `<html>` 태그에 `class="dark"` 추가.

- [ ] **Step 4: HeroUI 스모크 테스트 — `App.tsx`**

```tsx
import { Button } from '@heroui/react';

export default function App() {
  return (
    <div className="p-6">
      <Button variant="primary" onPress={() => alert('ok')}>테스트</Button>
    </div>
  );
}
```

- [ ] **Step 5: `pnpm dev` 실행, 버튼 클릭 확인**

Expected: 다크 배경에 HeroUI primary 버튼이 렌더되고 클릭 시 alert.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: integrate tailwind v4 + heroui v3"
```

---

### Task 3: Vitest 설정

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`

- [ ] **Step 1: `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 2: `tests/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 3: 스모크 테스트로 설정 검증**

`tests/unit/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: 실행**

Run: `pnpm test`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: configure vitest"
```

---

### Task 4: Content 타입 및 Zod 스키마

**Files:**
- Create: `src/content/types.ts`, `src/content/schema.ts`, `tests/unit/schema.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성 — `tests/unit/schema.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { frontmatterSchema, partMetaSchema } from '@/content/schema';

describe('frontmatterSchema', () => {
  it('accepts valid checklist frontmatter', () => {
    const result = frontmatterSchema.safeParse({
      title: 'Test', description: 'desc', type: 'checklist', enforce: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const result = frontmatterSchema.safeParse({
      title: 'T', description: 'd', type: 'bogus', enforce: false,
    });
    expect(result.success).toBe(false);
  });

  it('defaults enforce to false', () => {
    const result = frontmatterSchema.safeParse({
      title: 'T', description: 'd', type: 'learn',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.enforce).toBe(false);
  });

  it('requires title and description', () => {
    expect(frontmatterSchema.safeParse({ type: 'checklist' }).success).toBe(false);
  });
});

describe('partMetaSchema', () => {
  it('requires title and description', () => {
    expect(partMetaSchema.safeParse({ title: 'a', description: 'b' }).success).toBe(true);
    expect(partMetaSchema.safeParse({ title: 'a' }).success).toBe(false);
  });
});
```

- [ ] **Step 2: 실행 (실패 확인)**

Run: `pnpm test schema`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: `src/content/types.ts` 작성**

```ts
export type DocType = 'checklist' | 'mission' | 'learn';

export interface Doc {
  id: string;                  // "part-1-xxx/01-yyy"
  partId: string;              // "part-1-xxx"
  title: string;
  description: string;
  type: DocType;
  enforce: boolean;
  Component: React.ComponentType;
}

export interface Part {
  id: string;                  // folder name "part-1-xxx"
  order: number;               // parsed from "part-{N}-*"
  title: string;
  description: string;
  docs: Doc[];
}

export type ContentTree = Part[];
```

- [ ] **Step 4: `src/content/schema.ts` 작성**

```ts
import { z } from 'zod';

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['checklist', 'mission', 'learn']),
  enforce: z.boolean().default(false),
});

export const partMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type PartMeta = z.infer<typeof partMetaSchema>;
```

- [ ] **Step 5: 실행 (통과 확인)**

Run: `pnpm test schema`
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(content): add frontmatter and part meta schemas"
```

---

### Task 5: ContentTree 빌더 (순수 함수)

**Files:**
- Create: `src/content/tree.ts`, `tests/unit/tree.test.ts`

ContentTree 빌더는 **순수 함수**로 구현해 테스트 가능하게 한다. Vite glob 결과를 그대로 주입받는 형태.

- [ ] **Step 1: 테스트 작성 — `tests/unit/tree.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { buildContentTree, type RawMdxModule, type RawMetaModule } from '@/content/tree';

const Dummy = () => null;

const mdx: Record<string, RawMdxModule> = {
  '/content/part-2-env/01-docker.mdx': {
    default: Dummy,
    frontmatter: { title: 'Docker', description: 'd', type: 'checklist', enforce: false },
  },
  '/content/part-1-account/02-notion.mdx': {
    default: Dummy,
    frontmatter: { title: 'Notion', description: 'd', type: 'checklist', enforce: false },
  },
  '/content/part-1-account/01-github.mdx': {
    default: Dummy,
    frontmatter: { title: 'GitHub', description: 'd', type: 'checklist', enforce: true },
  },
};

const meta: Record<string, RawMetaModule> = {
  '/content/part-1-account/_meta.json': { default: { title: '계정 체크', description: 'a' } },
  '/content/part-2-env/_meta.json':     { default: { title: '환경 세팅', description: 'e' } },
};

describe('buildContentTree', () => {
  it('sorts parts by order prefix', () => {
    const tree = buildContentTree(mdx, meta);
    expect(tree.map(p => p.order)).toEqual([1, 2]);
    expect(tree[0].title).toBe('계정 체크');
  });

  it('sorts docs within part by filename prefix', () => {
    const tree = buildContentTree(mdx, meta);
    expect(tree[0].docs.map(d => d.title)).toEqual(['GitHub', 'Notion']);
  });

  it('assigns doc id as partFolder/docFile', () => {
    const tree = buildContentTree(mdx, meta);
    expect(tree[0].docs[0].id).toBe('part-1-account/01-github');
  });

  it('preserves enforce flag', () => {
    const tree = buildContentTree(mdx, meta);
    expect(tree[0].docs[0].enforce).toBe(true);
    expect(tree[0].docs[1].enforce).toBe(false);
  });

  it('throws if _meta.json missing', () => {
    expect(() => buildContentTree(mdx, {})).toThrow(/missing _meta\.json/i);
  });

  it('throws if frontmatter invalid', () => {
    const bad = { ...mdx, '/content/part-1-account/03-bad.mdx': {
      default: Dummy,
      frontmatter: { title: '', description: 'd', type: 'checklist' },
    }};
    expect(() => buildContentTree(bad as any, meta)).toThrow(/frontmatter/i);
  });
});
```

- [ ] **Step 2: 실행 (실패 확인)**

Run: `pnpm test tree`
Expected: FAIL.

- [ ] **Step 3: `src/content/tree.ts` 작성**

```ts
import type { ContentTree, Doc, Part } from './types';
import { frontmatterSchema, partMetaSchema, type Frontmatter, type PartMeta } from './schema';

export interface RawMdxModule {
  default: React.ComponentType;
  frontmatter: unknown;
}

export interface RawMetaModule {
  default: unknown;
}

const PART_RE = /\/content\/(part-(\d+)-[^/]+)\/([^/]+)\.mdx$/;
const META_RE = /\/content\/(part-\d+-[^/]+)\/_meta\.json$/;
const DOC_FILE_RE = /^(\d+)-/;

export function buildContentTree(
  mdxModules: Record<string, RawMdxModule>,
  metaModules: Record<string, RawMetaModule>,
): ContentTree {
  // Parse part metadata
  const partMeta = new Map<string, PartMeta>();
  for (const [path, mod] of Object.entries(metaModules)) {
    const match = path.match(META_RE);
    if (!match) continue;
    const partId = match[1];
    const parsed = partMetaSchema.safeParse(mod.default);
    if (!parsed.success) {
      throw new Error(`Invalid _meta.json at ${path}: ${parsed.error.message}`);
    }
    partMeta.set(partId, parsed.data);
  }

  // Group docs by part
  const docsByPart = new Map<string, { order: number; doc: Doc }[]>();
  for (const [path, mod] of Object.entries(mdxModules)) {
    const match = path.match(PART_RE);
    if (!match) continue;
    const [, partId, partOrderStr, docFile] = match;

    const fm = frontmatterSchema.safeParse(mod.frontmatter);
    if (!fm.success) {
      throw new Error(`Invalid frontmatter at ${path}: ${fm.error.message}`);
    }

    const docOrderMatch = docFile.match(DOC_FILE_RE);
    if (!docOrderMatch) {
      throw new Error(`Doc file must start with "NN-": ${path}`);
    }
    const order = Number(docOrderMatch[1]);

    const doc: Doc = {
      id: `${partId}/${docFile}`,
      partId,
      title: fm.data.title,
      description: fm.data.description,
      type: fm.data.type,
      enforce: fm.data.enforce,
      Component: mod.default,
    };

    const list = docsByPart.get(partId) ?? [];
    list.push({ order, doc });
    docsByPart.set(partId, list);
  }

  // Build parts
  const parts: Part[] = [];
  for (const [partId, items] of docsByPart.entries()) {
    const meta = partMeta.get(partId);
    if (!meta) throw new Error(`missing _meta.json for ${partId}`);
    const partOrder = Number(partId.match(/^part-(\d+)-/)![1]);
    items.sort((a, b) => a.order - b.order);
    parts.push({
      id: partId,
      order: partOrder,
      title: meta.title,
      description: meta.description,
      docs: items.map(i => i.doc),
    });
  }
  parts.sort((a, b) => a.order - b.order);
  return parts;
}
```

- [ ] **Step 4: 실행 (통과 확인)**

Run: `pnpm test tree`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(content): implement content tree builder"
```

---

### Task 6: MDX Vite 플러그인 통합

**Files:**
- Modify: `electron.vite.config.ts`
- Create: `src/content/index.ts` (글로브 수집 런타임 entry)

- [ ] **Step 1: MDX 플러그인 추가**

`electron.vite.config.ts` renderer:

```ts
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

renderer: {
  plugins: [
    { enforce: 'pre', ...mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
      ],
    }) },
    react(),
    tailwindcss(),
  ],
}
```

- [ ] **Step 2: `src/content/index.ts` — glob 수집**

```ts
import { buildContentTree } from './tree';

const mdxModules = import.meta.glob('/content/**/*.mdx', { eager: true }) as any;
const metaModules = import.meta.glob('/content/**/_meta.json', { eager: true }) as any;

export const contentTree = buildContentTree(mdxModules, metaModules);

export const allDocs = contentTree.flatMap(p => p.docs);

export function findDoc(id: string) {
  return allDocs.find(d => d.id === id);
}
```

- [ ] **Step 3: 샘플 콘텐츠 생성 (최소 2개)**

`content/part-1-account-check/_meta.json`:

```json
{ "title": "계정 체크", "description": "팀 협업 도구 계정 초대를 확인합니다" }
```

`content/part-1-account-check/01-github.mdx`:

```mdx
---
title: GitHub 초대 확인
description: GitHub 조직 초대를 수락합니다
type: checklist
enforce: false
---

<Check id="accept">조직 초대 메일 수락</Check>
<Check id="2fa">2FA 활성화</Check>
```

`content/part-2-env-setup/_meta.json`:

```json
{ "title": "환경 세팅", "description": "로컬 개발 환경을 구성합니다" }
```

`content/part-2-env-setup/01-docker.mdx`:

```mdx
---
title: Docker 설치
description: Docker Desktop을 설치합니다
type: mission
enforce: false
---

<Mission title="미션: Docker 설치" description="Docker Desktop을 설치하고 `docker --version` 결과를 아래에 적어주세요" />
<MissionNote />
```

- [ ] **Step 4: `App.tsx`에서 로드 스모크 테스트**

```tsx
import { contentTree } from '@/content';

export default function App() {
  return (
    <div className="p-6">
      <h1>파트 {contentTree.length}개 로드됨</h1>
      <ul>{contentTree.map(p => <li key={p.id}>{p.title} ({p.docs.length}문서)</li>)}</ul>
    </div>
  );
}
```

- [ ] **Step 5: `pnpm dev` 실행 확인**

Expected: "파트 2개 로드됨" + Part 목록.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(content): integrate mdx plugin and sample content"
```

---

### Task 7: zustand store + persist

**Files:**
- Create: `src/store/onboarding-store.ts`, `tests/unit/store.test.ts`

- [ ] **Step 1: 테스트 작성 — `tests/unit/store.test.ts`**

```ts
import { beforeEach, describe, it, expect } from 'vitest';
import { useOnboardingStore } from '@/store/onboarding-store';

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('onboarding store', () => {
  it('toggles check items by doc+check id', () => {
    const { toggleCheck } = useOnboardingStore.getState();
    toggleCheck('doc1', 'a');
    expect(useOnboardingStore.getState().checks['doc1:a']).toBe(true);
    toggleCheck('doc1', 'a');
    expect(useOnboardingStore.getState().checks['doc1:a']).toBe(false);
  });

  it('records quiz answers', () => {
    useOnboardingStore.getState().setQuizAnswer('doc1', 2);
    expect(useOnboardingStore.getState().quizzes['doc1']).toBe(2);
  });

  it('records mission notes', () => {
    useOnboardingStore.getState().setMissionNote('doc1', 'hello');
    expect(useOnboardingStore.getState().missions['doc1']).toBe('hello');
  });

  it('marks and unmarks completion', () => {
    useOnboardingStore.getState().markComplete('doc1');
    expect(useOnboardingStore.getState().completions['doc1']).toBe(true);
    useOnboardingStore.getState().unmarkComplete('doc1');
    expect(useOnboardingStore.getState().completions['doc1']).toBe(false);
  });

  it('sets current doc', () => {
    useOnboardingStore.getState().setCurrentDoc('doc1');
    expect(useOnboardingStore.getState().currentDocId).toBe('doc1');
  });

  it('reset clears all state', () => {
    const s = useOnboardingStore.getState();
    s.markComplete('d'); s.toggleCheck('d', 'a'); s.reset();
    const after = useOnboardingStore.getState();
    expect(after.completions).toEqual({});
    expect(after.checks).toEqual({});
  });
});
```

- [ ] **Step 2: 실행 (실패 확인)**

Run: `pnpm test store`
Expected: FAIL.

- [ ] **Step 3: `src/store/onboarding-store.ts` 작성**

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OnboardingState {
  completions: Record<string, boolean>;
  checks: Record<string, boolean>;
  quizzes: Record<string, number>;
  missions: Record<string, string>;
  currentDocId: string | null;
  storageAvailable: boolean;

  toggleCheck: (docId: string, checkId: string) => void;
  setQuizAnswer: (docId: string, optionIdx: number) => void;
  setMissionNote: (docId: string, text: string) => void;
  markComplete: (docId: string) => void;
  unmarkComplete: (docId: string) => void;
  setCurrentDoc: (docId: string) => void;
  setStorageAvailable: (ok: boolean) => void;
  reset: () => void;
}

const initial = {
  completions: {}, checks: {}, quizzes: {}, missions: {},
  currentDocId: null as string | null,
  storageAvailable: true,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      toggleCheck: (docId, checkId) => set(s => ({
        checks: { ...s.checks, [`${docId}:${checkId}`]: !s.checks[`${docId}:${checkId}`] },
      })),
      setQuizAnswer: (docId, idx) => set(s => ({
        quizzes: { ...s.quizzes, [docId]: idx },
      })),
      setMissionNote: (docId, text) => set(s => ({
        missions: { ...s.missions, [docId]: text },
      })),
      markComplete: (docId) => set(s => ({
        completions: { ...s.completions, [docId]: true },
      })),
      unmarkComplete: (docId) => set(s => ({
        completions: { ...s.completions, [docId]: false },
      })),
      setCurrentDoc: (docId) => set({ currentDocId: docId }),
      setStorageAvailable: (ok) => set({ storageAvailable: ok }),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'onboarding-state-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (_state, error) => {
        if (error) useOnboardingStore.getState().setStorageAvailable(false);
      },
      partialize: (s) => ({
        completions: s.completions, checks: s.checks, quizzes: s.quizzes,
        missions: s.missions, currentDocId: s.currentDocId,
      }),
    },
  ),
);
```

- [ ] **Step 4: 실행 (통과 확인)**

Run: `pnpm test store`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(store): add zustand store with localStorage persistence"
```

---

### Task 8: Selectors (진행률 + canComplete)

**Files:**
- Create: `src/store/selectors.ts`, `tests/unit/selectors.test.ts`

`canComplete` 가 `doc` 의 파생 데이터(체크리스트 항목 id 목록 등)를 필요로 한다. 하지만 이 목록은 MDX 파싱 결과에서 얻기 어려우므로, **실용적 접근**: `canComplete` 는 store에 등록된 checks/quizzes/missions 로 판정한다. 등록된 항목 ID가 doc에 속하는지 여부만 prefix(`${docId}:`)로 판별.

- [ ] **Step 1: 테스트 — `tests/unit/selectors.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { overallProgress, canComplete } from '@/store/selectors';
import type { Doc } from '@/content/types';

const Dummy = () => null;
const doc = (id: string, type: Doc['type'], enforce = false): Doc => ({
  id, partId: 'p', title: 't', description: 'd', type, enforce, Component: Dummy,
});

describe('overallProgress', () => {
  it('is completed count over total', () => {
    expect(overallProgress({ a: true, b: false, c: true }, 4)).toBeCloseTo(0.5);
  });
  it('is 0 with no docs', () => {
    expect(overallProgress({}, 0)).toBe(0);
  });
});

describe('canComplete', () => {
  it('returns true when enforce is false regardless of state', () => {
    expect(canComplete(doc('d', 'checklist', false), {
      checks: {}, quizzes: {}, missions: {},
    } as any)).toBe(true);
  });

  it('checklist with enforce requires at least one check and all checked', () => {
    const d = doc('d', 'checklist', true);
    const state = { checks: { 'd:a': true, 'd:b': true }, quizzes: {}, missions: {} } as any;
    expect(canComplete(d, state)).toBe(true);

    const partial = { checks: { 'd:a': true, 'd:b': false }, quizzes: {}, missions: {} } as any;
    expect(canComplete(d, partial)).toBe(false);

    const empty = { checks: {}, quizzes: {}, missions: {} } as any;
    expect(canComplete(d, empty)).toBe(false);
  });

  it('mission requires non-empty trimmed note', () => {
    const d = doc('d', 'mission', true);
    expect(canComplete(d, { checks:{}, quizzes:{}, missions:{ d: '  ' } } as any)).toBe(false);
    expect(canComplete(d, { checks:{}, quizzes:{}, missions:{ d: 'ok' } } as any)).toBe(true);
  });

  it('learn requires quiz answer recorded (any value)', () => {
    const d = doc('d', 'learn', true);
    expect(canComplete(d, { checks:{}, quizzes:{}, missions:{} } as any)).toBe(false);
    expect(canComplete(d, { checks:{}, quizzes:{ d: 1 }, missions:{} } as any)).toBe(true);
  });
});
```

> 참고: "정답 맞춤" 이 아니라 "답을 선택함" 기준으로 완료 인정 — 자유 모드 철학. 퀴즈 피드백은 Quiz 컴포넌트에서 즉시 보여주되 완료 게이팅은 선택 자체로 충분.

- [ ] **Step 2: 실행 (실패 확인)**

- [ ] **Step 3: `src/store/selectors.ts` 작성**

```ts
import type { Doc } from '@/content/types';
import type { OnboardingState } from './onboarding-store';

export function overallProgress(
  completions: Record<string, boolean>,
  totalDocs: number,
): number {
  if (totalDocs === 0) return 0;
  const done = Object.values(completions).filter(Boolean).length;
  return done / totalDocs;
}

export function canComplete(doc: Doc, s: Pick<OnboardingState, 'checks' | 'quizzes' | 'missions'>): boolean {
  if (!doc.enforce) return true;
  switch (doc.type) {
    case 'checklist': {
      const prefix = `${doc.id}:`;
      const keys = Object.keys(s.checks).filter(k => k.startsWith(prefix));
      if (keys.length === 0) return false;
      return keys.every(k => s.checks[k]);
    }
    case 'mission': {
      return (s.missions[doc.id] ?? '').trim().length > 0;
    }
    case 'learn': {
      return s.quizzes[doc.id] !== undefined;
    }
  }
}
```

- [ ] **Step 4: 실행 (통과 확인)**

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(store): add progress and canComplete selectors"
```

---

### Task 9: 커스텀 MDX 컴포넌트 — Check

**Files:**
- Create: `src/mdx/Check.tsx`, `tests/component/Check.test.tsx`

- [ ] **Step 1: 테스트 — `tests/component/Check.test.tsx`**

```tsx
import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Check } from '@/mdx/Check';
import { useOnboardingStore } from '@/store/onboarding-store';
import { DocContext } from '@/mdx/provider';

function renderInDoc(ui: React.ReactNode, docId = 'doc1') {
  return render(<DocContext.Provider value={docId}>{ui}</DocContext.Provider>);
}

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('<Check>', () => {
  it('renders label', () => {
    renderInDoc(<Check id="a">초대 수락</Check>);
    expect(screen.getByText('초대 수락')).toBeInTheDocument();
  });

  it('toggles store state on click', async () => {
    const user = userEvent.setup();
    renderInDoc(<Check id="a">초대 수락</Check>);
    await user.click(screen.getByRole('checkbox'));
    expect(useOnboardingStore.getState().checks['doc1:a']).toBe(true);
  });
});
```

- [ ] **Step 2: 실행 (실패 확인)**

- [ ] **Step 3: `src/mdx/Check.tsx`**

```tsx
import { Checkbox, Label, Description } from '@heroui/react';
import { useContext } from 'react';
import { DocContext } from './provider';
import { useOnboardingStore } from '@/store/onboarding-store';

interface Props {
  id: string;
  hint?: string;
  children: React.ReactNode;
}

export function Check({ id, hint, children }: Props) {
  const docId = useContext(DocContext);
  if (!docId) throw new Error('<Check> must be inside DocContext');
  const key = `${docId}:${id}`;
  const checked = useOnboardingStore(s => !!s.checks[key]);
  const toggle = useOnboardingStore(s => s.toggleCheck);

  return (
    <Checkbox isSelected={checked} onChange={() => toggle(docId, id)}>
      <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
      <Checkbox.Content>
        <Label>{children}</Label>
        {hint && <Description>{hint}</Description>}
      </Checkbox.Content>
    </Checkbox>
  );
}
```

- [ ] **Step 4: `src/mdx/provider.tsx` (초안 — DocContext만 먼저)**

```tsx
import { createContext } from 'react';
export const DocContext = createContext<string | null>(null);
```

- [ ] **Step 5: 실행 (통과 확인)**

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(mdx): add <Check> component"
```

---

### Task 10: 커스텀 MDX 컴포넌트 — Quiz

**Files:**
- Create: `src/mdx/Quiz.tsx`, `tests/component/Quiz.test.tsx`

- [ ] **Step 1: 테스트 — `tests/component/Quiz.test.tsx`**

```tsx
import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Quiz } from '@/mdx/Quiz';
import { useOnboardingStore } from '@/store/onboarding-store';
import { DocContext } from '@/mdx/provider';

const wrap = (ui: React.ReactNode) => (
  <DocContext.Provider value="doc1">{ui}</DocContext.Provider>
);

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
});

describe('<Quiz>', () => {
  it('shows correct feedback on right answer', async () => {
    const user = userEvent.setup();
    render(wrap(<Quiz question="Q" options={['A','B','C']} answer={1} />));
    await user.click(screen.getByLabelText('B'));
    expect(screen.getByText(/정답/)).toBeInTheDocument();
    expect(useOnboardingStore.getState().quizzes['doc1']).toBe(1);
  });

  it('shows wrong feedback on incorrect answer', async () => {
    const user = userEvent.setup();
    render(wrap(<Quiz question="Q" options={['A','B','C']} answer={1} />));
    await user.click(screen.getByLabelText('A'));
    expect(screen.getByText(/다시/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: `src/mdx/Quiz.tsx`**

```tsx
import { RadioGroup, Radio, Label } from '@heroui/react';
import { useContext } from 'react';
import { DocContext } from './provider';
import { useOnboardingStore } from '@/store/onboarding-store';

interface Props {
  question: string;
  options: string[];
  answer: number;
}

export function Quiz({ question, options, answer }: Props) {
  const docId = useContext(DocContext)!;
  const selected = useOnboardingStore(s => s.quizzes[docId]);
  const setAnswer = useOnboardingStore(s => s.setQuizAnswer);

  const answered = selected !== undefined;
  const correct = answered && selected === answer;

  return (
    <div className="my-4 rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-4">
      <p className="mb-3 font-medium">💬 {question}</p>
      <RadioGroup
        value={selected?.toString() ?? ''}
        onChange={v => setAnswer(docId, Number(v))}
      >
        {options.map((opt, i) => (
          <Radio key={i} value={i.toString()}>
            <Label>{opt}</Label>
          </Radio>
        ))}
      </RadioGroup>
      {answered && (
        <p className={`mt-3 text-sm ${correct ? 'text-[var(--accent)]' : 'text-[var(--warn)]'}`}>
          {correct ? '✅ 정답!' : '❌ 다시 확인해보세요.'}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 실행 및 커밋**

```bash
pnpm test Quiz && git add -A && git commit -m "feat(mdx): add <Quiz> component"
```

---

### Task 11: 커스텀 MDX 컴포넌트 — Mission + Glossary + Head

**Files:**
- Create: `src/mdx/Mission.tsx`, `src/mdx/Glossary.tsx`, `src/mdx/Head.tsx`, `tests/component/Mission.test.tsx`

- [ ] **Step 1: 테스트 — `Mission.test.tsx`**

```tsx
import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MissionNote } from '@/mdx/Mission';
import { useOnboardingStore } from '@/store/onboarding-store';
import { DocContext } from '@/mdx/provider';

beforeEach(() => { localStorage.clear(); useOnboardingStore.getState().reset(); });

describe('<MissionNote>', () => {
  it('saves typed text to store', async () => {
    const user = userEvent.setup();
    render(
      <DocContext.Provider value="doc1"><MissionNote /></DocContext.Provider>
    );
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(useOnboardingStore.getState().missions['doc1']).toBe('hello');
  });
});
```

- [ ] **Step 2: `src/mdx/Mission.tsx`**

```tsx
import { TextArea, Label } from '@heroui/react';
import { useContext } from 'react';
import { DocContext } from './provider';
import { useOnboardingStore } from '@/store/onboarding-store';

interface MissionProps {
  title: string;
  description: string;
}

export function Mission({ title, description }: MissionProps) {
  return (
    <div className="my-4 rounded-lg border-l-4 border-[var(--mission)] bg-[var(--surface2)] p-4">
      <h4 className="mb-1 font-semibold text-[var(--mission)]">{title}</h4>
      <p className="text-sm text-[var(--text-dim)]">{description}</p>
    </div>
  );
}

export function MissionNote() {
  const docId = useContext(DocContext)!;
  const value = useOnboardingStore(s => s.missions[docId] ?? '');
  const setNote = useOnboardingStore(s => s.setMissionNote);

  return (
    <TextArea value={value} onChange={v => setNote(docId, v)}>
      <Label>체험 후 느낀 점, 궁금한 점을 자유롭게 적어주세요</Label>
      <TextArea.Input rows={6} />
    </TextArea>
  );
}
```

- [ ] **Step 3: `src/mdx/Glossary.tsx`**

```tsx
interface Props { term: string; children: React.ReactNode; }
export function Glossary({ term, children }: Props) {
  return (
    <div className="my-2 rounded border border-[var(--border)] bg-[var(--surface2)] p-3">
      <dt className="font-semibold text-[var(--learn)]">{term}</dt>
      <dd className="text-sm text-[var(--text-dim)]">{children}</dd>
    </div>
  );
}
```

- [ ] **Step 4: `src/mdx/Head.tsx`**

Head 는 frontmatter의 대안으로, ContentTree 빌더는 frontmatter 우선 사용. 본 컴포넌트는 렌더 시 메타 표시용.

```tsx
interface Props { title: string; date?: string; description?: string; }
export function Head({ title, date, description }: Props) {
  return (
    <header className="mb-6 border-b border-[var(--border)] pb-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-[var(--text-dim)]">{description}</p>}
      {date && <p className="mono text-xs text-[var(--text-dim)]">{date}</p>}
    </header>
  );
}
```

- [ ] **Step 5: `src/mdx/provider.tsx` 확장 — MDXProvider로 자동 주입**

```tsx
import { MDXProvider } from '@mdx-js/react';
import { createContext } from 'react';
import { Check } from './Check';
import { Quiz } from './Quiz';
import { Mission, MissionNote } from './Mission';
import { Glossary } from './Glossary';
import { Head } from './Head';

export const DocContext = createContext<string | null>(null);

const components = { Check, Quiz, Mission, MissionNote, Glossary, Head };

export function MdxComponents({ children }: { children: React.ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
```

- [ ] **Step 6: 실행 및 커밋**

```bash
pnpm test && git add -A && git commit -m "feat(mdx): add Mission, Glossary, Head components + provider"
```

---

### Task 12: UI 레이아웃 셸 (App + 기본 구조)

**Files:**
- Modify: `src/App.tsx`
- Create: `src/ui/Sidebar.tsx` (stub), `src/ui/MainArea.tsx` (stub)

- [ ] **Step 1: `src/App.tsx` 레이아웃**

```tsx
import { Sidebar } from './ui/Sidebar';
import { MainArea } from './ui/MainArea';
import { StorageWarning } from './ui/StorageWarning';
import { useOnboardingStore } from './store/onboarding-store';
import { useEffect } from 'react';
import { contentTree, allDocs } from './content';

export default function App() {
  const currentDocId = useOnboardingStore(s => s.currentDocId);
  const setCurrentDoc = useOnboardingStore(s => s.setCurrentDoc);

  useEffect(() => {
    if (currentDocId && allDocs.find(d => d.id === currentDocId)) return;
    if (allDocs[0]) setCurrentDoc(allDocs[0].id);
  }, []);

  return (
    <div className="flex h-screen">
      <StorageWarning />
      <Sidebar tree={contentTree} />
      <MainArea />
    </div>
  );
}
```

- [ ] **Step 2: `src/ui/StorageWarning.tsx`**

```tsx
import { useOnboardingStore } from '@/store/onboarding-store';

export function StorageWarning() {
  const ok = useOnboardingStore(s => s.storageAvailable);
  if (ok) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--warn)] p-2 text-center text-sm text-black">
      진행 상황이 저장되지 않을 수 있습니다 (localStorage 접근 불가)
    </div>
  );
}
```

- [ ] **Step 3: stub 컴포넌트 (다음 태스크에서 채움)**

```tsx
// src/ui/Sidebar.tsx
import type { ContentTree } from '@/content/types';
export function Sidebar({ tree }: { tree: ContentTree }) {
  return <aside className="w-[260px] border-r border-[var(--border)] bg-[var(--surface)]" />;
}

// src/ui/MainArea.tsx
export function MainArea() { return <main className="flex-1 overflow-auto" />; }
```

- [ ] **Step 4: 실행 — 레이아웃 확인 및 커밋**

```bash
pnpm dev  # 사이드바 + 메인 빈 영역 확인
git add -A && git commit -m "feat(ui): app shell layout with storage warning"
```

---

### Task 13: Sidebar — Progress + PartList + DocItem

**Files:**
- Create: `src/ui/ProgressSection.tsx`, `src/ui/PartList.tsx`, `src/ui/DocItem.tsx`
- Modify: `src/ui/Sidebar.tsx`
- Create: `tests/component/Sidebar.test.tsx`

- [ ] **Step 1: 테스트 — `Sidebar.test.tsx`**

```tsx
import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/ui/Sidebar';
import { useOnboardingStore } from '@/store/onboarding-store';
import type { ContentTree } from '@/content/types';

const Dummy = () => null;
const tree: ContentTree = [{
  id: 'p1', order: 1, title: '파트 1', description: 'd',
  docs: [
    { id: 'p1/01', partId: 'p1', title: '문서 A', description: '', type: 'checklist', enforce: false, Component: Dummy },
    { id: 'p1/02', partId: 'p1', title: '문서 B', description: '', type: 'mission', enforce: false, Component: Dummy },
  ],
}];

beforeEach(() => { localStorage.clear(); useOnboardingStore.getState().reset(); });

describe('<Sidebar>', () => {
  it('renders part title and doc titles', () => {
    render(<Sidebar tree={tree} />);
    expect(screen.getByText('파트 1')).toBeInTheDocument();
    expect(screen.getByText('문서 A')).toBeInTheDocument();
  });

  it('shows completion checkmark for completed docs', () => {
    useOnboardingStore.getState().markComplete('p1/01');
    render(<Sidebar tree={tree} />);
    const item = screen.getByText('문서 A').closest('[data-doc-id]');
    expect(item).toHaveAttribute('data-completed', 'true');
  });

  it('navigates on click', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<Sidebar tree={tree} />);
    await user.click(screen.getByText('문서 B'));
    expect(useOnboardingStore.getState().currentDocId).toBe('p1/02');
  });
});
```

- [ ] **Step 2: `src/ui/ProgressSection.tsx`**

```tsx
import { ProgressBar, Label } from '@heroui/react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { overallProgress } from '@/store/selectors';
import { allDocs } from '@/content';

export function ProgressSection() {
  const pct = useOnboardingStore(s => overallProgress(s.completions, allDocs.length)) * 100;
  return (
    <div className="border-b border-[var(--border)] p-4">
      <ProgressBar aria-label="전체 진행률" value={pct} color="success">
        <Label>전체 진행률</Label>
        <ProgressBar.Output />
        <ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
```

- [ ] **Step 3: `src/ui/DocItem.tsx`**

```tsx
import { useOnboardingStore } from '@/store/onboarding-store';
import type { Doc } from '@/content/types';

export function DocItem({ doc }: { doc: Doc }) {
  const completed = useOnboardingStore(s => !!s.completions[doc.id]);
  const active = useOnboardingStore(s => s.currentDocId === doc.id);
  const setCurrent = useOnboardingStore(s => s.setCurrentDoc);

  return (
    <button
      data-doc-id={doc.id}
      data-completed={completed}
      data-active={active}
      onClick={() => setCurrent(doc.id)}
      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-[var(--surface2)]
        ${active ? 'bg-[var(--surface2)] text-[var(--accent)]' : 'text-[var(--text)]'}`}
    >
      <span className={`w-4 text-xs ${completed ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}>
        {completed ? '✓' : '○'}
      </span>
      <span>{doc.title}</span>
    </button>
  );
}
```

- [ ] **Step 4: `src/ui/PartList.tsx`**

```tsx
import type { ContentTree } from '@/content/types';
import { DocItem } from './DocItem';

export function PartList({ tree }: { tree: ContentTree }) {
  return (
    <nav className="overflow-y-auto">
      {tree.map(part => (
        <div key={part.id} className="py-2">
          <h3 className="px-4 py-1 mono text-xs uppercase text-[var(--text-dim)]">{part.title}</h3>
          {part.docs.map(d => <DocItem key={d.id} doc={d} />)}
        </div>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: `src/ui/Sidebar.tsx` 업데이트**

```tsx
import type { ContentTree } from '@/content/types';
import { ProgressSection } from './ProgressSection';
import { PartList } from './PartList';

export function Sidebar({ tree }: { tree: ContentTree }) {
  return (
    <aside className="flex w-[260px] flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <ProgressSection />
      <PartList tree={tree} />
    </aside>
  );
}
```

- [ ] **Step 6: 실행 및 커밋**

```bash
pnpm test Sidebar && git add -A && git commit -m "feat(ui): sidebar with progress and part list"
```

---

### Task 14: TopBar + 이전/다음 네비게이션

**Files:**
- Create: `src/ui/TopBar.tsx`

- [ ] **Step 1: `src/ui/TopBar.tsx`**

```tsx
import { Button } from '@heroui/react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { allDocs, findDoc } from '@/content';

const TYPE_LABEL = { checklist: 'CHECKLIST', mission: 'MISSION', learn: 'LEARN' };
const TYPE_COLOR = {
  checklist: 'var(--accent)',
  mission: 'var(--mission)',
  learn: 'var(--learn)',
} as const;

export function TopBar() {
  const currentDocId = useOnboardingStore(s => s.currentDocId);
  const setCurrent = useOnboardingStore(s => s.setCurrentDoc);
  const doc = currentDocId ? findDoc(currentDocId) : null;
  if (!doc) return null;

  const idx = allDocs.findIndex(d => d.id === doc.id);
  const prev = idx > 0 ? allDocs[idx - 1] : null;
  const next = idx < allDocs.length - 1 ? allDocs[idx + 1] : null;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3">
      <div className="flex items-center gap-3">
        <span
          className="mono rounded px-2 py-1 text-xs font-bold"
          style={{ background: TYPE_COLOR[doc.type] + '22', color: TYPE_COLOR[doc.type] }}
        >
          {TYPE_LABEL[doc.type]}
        </span>
        <h2 className="font-semibold">{doc.title}</h2>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" isDisabled={!prev} onPress={() => prev && setCurrent(prev.id)}>◀ 이전</Button>
        <Button variant="primary" isDisabled={!next} onPress={() => next && setCurrent(next.id)}>다음 ▶</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add -A && git commit -m "feat(ui): topbar with type badge and prev/next navigation"
```

---

### Task 15: CompleteButton + 스토리지 연동 테스트

**Files:**
- Create: `src/ui/CompleteButton.tsx`, `tests/component/CompleteButton.test.tsx`

- [ ] **Step 1: 테스트 — `CompleteButton.test.tsx`**

```tsx
import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CompleteButton } from '@/ui/CompleteButton';
import { useOnboardingStore } from '@/store/onboarding-store';
import type { Doc } from '@/content/types';

const Dummy = () => null;
const make = (over: Partial<Doc> = {}): Doc => ({
  id: 'd1', partId: 'p', title: 't', description: '',
  type: 'checklist', enforce: false, Component: Dummy, ...over,
});

beforeEach(() => { localStorage.clear(); useOnboardingStore.getState().reset(); });

describe('<CompleteButton>', () => {
  it('marks complete on press', async () => {
    const user = userEvent.setup();
    render(<CompleteButton doc={make()} />);
    await user.click(screen.getByRole('button'));
    expect(useOnboardingStore.getState().completions['d1']).toBe(true);
  });

  it('is disabled when enforce true and checklist not satisfied', () => {
    render(<CompleteButton doc={make({ enforce: true, type: 'checklist' })} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables when enforce true and checks all true', () => {
    useOnboardingStore.getState().toggleCheck('d1', 'a');
    render(<CompleteButton doc={make({ enforce: true, type: 'checklist' })} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('shows completed label when already complete', () => {
    useOnboardingStore.getState().markComplete('d1');
    render(<CompleteButton doc={make()} />);
    expect(screen.getByRole('button')).toHaveTextContent(/완료됨/);
  });
});
```

- [ ] **Step 2: `src/ui/CompleteButton.tsx`**

```tsx
import { Button, Tooltip } from '@heroui/react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { canComplete } from '@/store/selectors';
import type { Doc } from '@/content/types';

export function CompleteButton({ doc }: { doc: Doc }) {
  const completed = useOnboardingStore(s => !!s.completions[doc.id]);
  const ok = useOnboardingStore(s => canComplete(doc, s));
  const mark = useOnboardingStore(s => s.markComplete);
  const unmark = useOnboardingStore(s => s.unmarkComplete);

  const disabled = !completed && !ok;
  const btn = (
    <Button
      variant={completed ? 'secondary' : 'primary'}
      isDisabled={disabled}
      onPress={() => (completed ? unmark(doc.id) : mark(doc.id))}
    >
      {completed ? '✓ 완료됨' : '완료로 표시'}
    </Button>
  );

  if (disabled) {
    return (
      <Tooltip>
        <Tooltip.Trigger>{btn}</Tooltip.Trigger>
        <Tooltip.Content>필수 항목을 먼저 완료하세요</Tooltip.Content>
      </Tooltip>
    );
  }
  return btn;
}
```

- [ ] **Step 3: 실행 및 커밋**

```bash
pnpm test CompleteButton && git add -A && git commit -m "feat(ui): complete button with enforce-aware gating"
```

---

### Task 16: ContentArea + ErrorBoundary + MainArea 통합

**Files:**
- Create: `src/ui/ContentArea.tsx`, `src/ui/ErrorBoundary.tsx`
- Modify: `src/ui/MainArea.tsx`

- [ ] **Step 1: `src/ui/ErrorBoundary.tsx`**

```tsx
import { Component, type ReactNode } from 'react';

interface Props { docId: string; children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidUpdate(prev: Props) {
    if (prev.docId !== this.props.docId) this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="m-6 rounded border border-[var(--warn)] bg-[var(--surface2)] p-4">
          <h3 className="mb-2 font-semibold text-[var(--warn)]">문서를 렌더링할 수 없습니다</h3>
          <p className="mono text-xs text-[var(--text-dim)]">{this.props.docId}</p>
          <p className="mt-2 text-sm">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: `src/ui/ContentArea.tsx`**

```tsx
import { useOnboardingStore } from '@/store/onboarding-store';
import { findDoc } from '@/content';
import { DocContext, MdxComponents } from '@/mdx/provider';
import { ErrorBoundary } from './ErrorBoundary';
import { CompleteButton } from './CompleteButton';

export function ContentArea() {
  const currentDocId = useOnboardingStore(s => s.currentDocId);
  if (!currentDocId) return <div className="p-6 text-[var(--text-dim)]">문서를 선택하세요</div>;
  const doc = findDoc(currentDocId);
  if (!doc) return <div className="p-6">문서를 찾을 수 없습니다</div>;

  const Body = doc.Component;
  return (
    <ErrorBoundary docId={doc.id}>
      <DocContext.Provider value={doc.id}>
        <MdxComponents>
          <article className="prose prose-invert mx-auto max-w-3xl p-8">
            <h1 className="mb-1 text-2xl font-bold">{doc.title}</h1>
            <p className="mb-6 text-[var(--text-dim)]">{doc.description}</p>
            <Body />
            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <CompleteButton doc={doc} />
            </div>
          </article>
        </MdxComponents>
      </DocContext.Provider>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 3: `src/ui/MainArea.tsx`**

```tsx
import { TopBar } from './TopBar';
import { ContentArea } from './ContentArea';

export function MainArea() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-auto"><ContentArea /></div>
    </main>
  );
}
```

- [ ] **Step 4: `pnpm dev` 엔드투엔드 확인**

Expected:
- 사이드바에 Part 1, Part 2 표시
- 첫 문서(GitHub) 자동 선택
- 체크박스 클릭 → 상태 유지
- 다음 버튼 → Docker 문서로 이동, 미션 노트 입력 → 저장됨
- 앱 재시작 후에도 상태 복원

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -m "feat(ui): wire content area with MDX rendering and error boundary"
```

---

### Task 17: 잘못된 currentDocId fallback 및 storage 감지 보강

**Files:**
- Modify: `src/App.tsx`, `src/lib/storage-check.ts`

- [ ] **Step 1: `src/lib/storage-check.ts`**

```ts
export function isLocalStorageAvailable(): boolean {
  try {
    const k = '__probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: `App.tsx` 에서 마운트 시 검사**

```tsx
import { isLocalStorageAvailable } from './lib/storage-check';

// 기존 useEffect 확장:
useEffect(() => {
  useOnboardingStore.getState().setStorageAvailable(isLocalStorageAvailable());

  const current = useOnboardingStore.getState().currentDocId;
  if (current && !allDocs.find(d => d.id === current)) {
    // 이전 상태의 docId가 현재 콘텐츠에 없음 — 첫 문서로 fallback
    setCurrentDoc(allDocs[0]?.id ?? null);
  } else if (!current && allDocs[0]) {
    setCurrentDoc(allDocs[0].id);
  }
}, []);
```

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "feat: storage availability check and stale docId fallback"
```

---

### Task 18: E2E 테스트 (Playwright + Electron)

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/onboarding.spec.ts`

- [ ] **Step 1: `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: { trace: 'on-first-retry' },
});
```

- [ ] **Step 2: `tests/e2e/onboarding.spec.ts`**

```ts
import { test, expect, _electron as electron } from '@playwright/test';
import path from 'node:path';

test('navigates freely and persists completion', async () => {
  const app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
  });
  const win = await app.firstWindow();

  await expect(win.getByText('GitHub 초대 확인')).toBeVisible();
  await win.getByRole('button', { name: /Docker 설치/ }).click();
  await expect(win.getByText(/미션: Docker 설치/)).toBeVisible();

  await win.getByRole('textbox').fill('Docker version 24');
  await win.getByRole('button', { name: /완료로 표시/ }).click();
  await expect(win.getByRole('button', { name: /완료됨/ })).toBeVisible();

  await app.close();

  // Relaunch: completion should persist (via userData)
  const app2 = await electron.launch({ args: [path.join(__dirname, '../../out/main/index.js')] });
  const win2 = await app2.firstWindow();
  await win2.getByRole('button', { name: /Docker 설치/ }).click();
  await expect(win2.getByRole('button', { name: /완료됨/ })).toBeVisible();
  await app2.close();
});
```

- [ ] **Step 3: 빌드 후 실행**

```bash
pnpm build
pnpm test:e2e
```

Expected: 1 passed.

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "test(e2e): electron launch + persistence smoke test"
```

---

### Task 19: 패키징 설정 (electron-builder)

**Files:**
- Modify: `package.json` (build 설정)

- [ ] **Step 1: `package.json` 에 electron-builder 설정**

```json
{
  "build": {
    "appId": "com.foodlogic.onboarding",
    "productName": "Developer Onboarding",
    "files": ["out/**/*"],
    "mac": { "target": "dmg", "category": "public.app-category.developer-tools" },
    "win": { "target": "nsis" }
  }
}
```

- [ ] **Step 2: 패키징 실행**

```bash
pnpm package
```

Expected:
- macOS: `dist/Developer Onboarding-0.1.0.dmg`
- Windows: `dist/Developer Onboarding Setup 0.1.0.exe`

- [ ] **Step 3: 산출물 수동 실행 스모크 테스트**

`.dmg` 또는 `.exe` 열어 첫 화면 로드 확인.

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "chore: configure electron-builder packaging"
```

---

### Task 20: 최종 검증 + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: 전체 테스트 실행**

```bash
pnpm typecheck && pnpm test && pnpm test:e2e
```

Expected: 모든 테스트 통과, 타입 에러 없음.

- [ ] **Step 2: `README.md`**

```markdown
# Developer Onboarding App

신규 개발자 온보딩용 오프라인 Electron 데스크톱 앱.

## 개발

```
pnpm install
pnpm dev
```

## 콘텐츠 작성

`content/part-{N}-{slug}/` 아래에 MDX 파일 추가.

- `_meta.json`: Part 제목/설명
- `NN-{slug}.mdx`: 문서 (frontmatter 필수)

frontmatter:
```yaml
---
title: 제목
description: 설명
type: checklist | mission | learn
enforce: false
---
```

커스텀 컴포넌트: `<Check>`, `<Quiz>`, `<Mission>`, `<MissionNote>`, `<Glossary>`, `<Head>`.

## 테스트

```
pnpm test         # unit + component
pnpm test:e2e     # electron e2e
```

## 빌드

```
pnpm package   # .dmg / .exe 산출
```
```

- [ ] **Step 3: 최종 커밋**

```bash
git add -A && git commit -m "docs: add README"
```

---

## Spec 커버리지 체크

| Spec 요구사항 | Task |
|---------------|------|
| React + Electron 오프라인 앱 | 1, 19 |
| Tailwind v4 + HeroUI v3 | 2 |
| zustand + localStorage | 7, 17 |
| MDX 콘텐츠 시스템 | 6 |
| 파일시스템 기반 자동 수집 | 5, 6 |
| `_meta.json` Part 메타 | 4, 5 |
| frontmatter 스키마 + Zod 검증 | 4, 5 |
| `<Check>`, `<Quiz>`, `<Mission>`, `<Glossary>`, `<Head>` | 9, 10, 11 |
| 사이드바 (진행률 + Part 리스트) | 13 |
| TopBar (배지 + 이전/다음) | 14 |
| 자유 모드 + 옵셔널 `enforce` | 8, 15 |
| 완료 버튼 (유저 클릭) | 15 |
| 전체 진행률 계산 (단순 비율) | 8, 13 |
| 에러 핸들링 (storage, 잘못된 docId, MDX 런타임) | 12, 16, 17 |
| 다크 테마 | 2 |
| Unit / Component / E2E 테스트 | 4-15, 18 |
| 패키징 | 19 |
