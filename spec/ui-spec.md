# Onboarding UI Specification

## Technical Stack

- **Framework**: React + Electron
- **State Management**: zustand
- **UI Library**: [HeroUI v3](https://heroui.com/) (Tailwind CSS v4 + React Aria)
- **Content Format**: MDX with custom components
- **Data Persistence**: LocalStorage (offline-first, no external communication)
- **Documentation Reference**: [HeroUI v3 Docs](https://heroui.com/docs/react/getting-started) - See [llms-full.txt](https://heroui.com/react/llms-full.txt) for component reference

### Design Philosophy

The app should be packaged as an Electron executable for offline use. All data (checklist state, quiz answers, mission notes) must persist in localStorage. Users cannot proceed without completing required items.

## Custom MDX Components

### Check Component

When writing MDX content, authors can use the custom Check component:

```mdx
계정 추가 확인 리스트
<Check>Github</Check>
<Check>Google Email</Check>
```

The Check component renders as an interactive checkbox item with:
- Visual checkmark when completed
- Optional hint text below the label
- Click interaction to toggle state
- Persisted state in localStorage

### Head/Frontmatter Component

Content pages can define metadata via frontmatter or a custom Head component:

**Frontmatter format:**

```yaml
---
title: Page Title
date: 2024-01-01
description: Page description
part: 1
step: 2
---
```

**Or Head component:**

```mdx
<Head
  title="Page Title"
  date="2024-01-01"
  description="Page description"
  part={1}
  step={2}
/>
```

These metadata values render in the top bar and sidebar navigation.

## Layout Structure

### Sidebar

The left sidebar contains two main sections:

1. **Progress Section** (top)
   - Overall completion percentage
   - Visual progress bar
   - Updates based on completed steps

2. **Part List Section** (below)
   - Chapter/Part headers (e.g., "세팅", "서비스 체험", "이해")
   - Individual step items with:
     - Step number or completion checkmark
     - Step title
     - Active state highlighting
     - Completed state styling

### Main Content Area

- **Top Bar**: Sticky header showing:
  - Chapter badge (CHECKLIST / MISSION / LEARN)
  - Current step title
  - Previous/Next navigation buttons

- **Content Area**: Scrollable main content with:
  - Step header (number, title, description)
  - MDX-rendered body content
  - Interactive components (checklists, quizzes, missions)
  - Animations on step transitions

## UI Components (from onboarding-prototype.html)

### Content Types

1. **CHECKLIST** - Interactive task lists with checkboxes
2. **MISSION** - Open-ended prompts with textarea input
3. **LEARN** - Educational content with glossary and quizzes

### Checklist Component

```tsx
<ChecklistBox checked={boolean} onClick={toggleCheck}>
  <CheckMark>{checked ? '✓' : ''}</CheckMark>
  <Content>
    <Label>Task name</Label>
    <Hint>Additional guidance text</Hint>
  </Content>
</ChecklistBox>
```

### Mission Component

```tsx
<MissionCard>
  <MissionTitle>미션 1: 제목</MissionTitle>
  <MissionDescription>설명 텍스트</MissionDescription>
</MissionCard>
<MissionTextarea
  placeholder="체험 후 느낀 점, 궁금한 점을 자유롭게 적어주세요..."
  value={notes}
  onChange={saveNotes}
/>
```

### Quiz Component

```tsx
<QuizWrap>
  <QuizQuestion>💬 질문 텍스트</QuizQuestion>
  <QuizOption
    selected={selected}
    correct={answered && isCorrect}
    wrong={answered && !isCorrect}
    onClick={selectOption}
  >
    <Radio />
    <span>옵션 텍스트</span>
  </QuizOption>
  <QuizFeedback show={answered} type={correct ? 'correct' : 'wrong'}>
    {correct ? '✅ 정답!' : '❌ 다시 확인해보세요.'}
  </QuizFeedback>
</QuizWrap>
```

### Glossary Component

```tsx
<GlossaryItem>
  <GlossaryTerm>MAU</GlossaryTerm>
  <GlossaryDefinition>Monthly Active Users. 월간 활성 사용자 수</GlossaryDefinition>
</GlossaryItem>
```

## Visual Design System

### Colors (Dark Theme)

```css
--bg: #0a0a0c;              /* Main background */
--surface: #141418;          /* Sidebar, cards */
--surface2: #1c1c22;         /* Elevated surfaces */
--border: #2a2a33;           /* Borders, dividers */
--text: #e8e8ec;             /* Primary text */
--text-dim: #7a7a88;         /* Secondary text */
--accent: #5bff9f;           /* Success, completion */
--accent-dim: rgba(91,255,159,0.08);
--warn: #ff6b6b;             /* Error, wrong answers */
--mission: #7b93ff;          /* Mission cards */
--mission-dim: rgba(123,147,255,0.08);
--learn: #ffd166;            /* Quiz, learning */
--learn-dim: rgba(255,209,102,0.08);
--radius: 12px;              /* Border radius */
```

### Typography

- **Font**: Noto Sans KR (Korean), JetBrains Mono (code)
- **Mono Font**: Used for badges, numbers, code

## HeroUI v3 Component Mapping

Use these HeroUI v3 components for the implementation:

| UI Element | HeroUI v3 Component |
|------------|---------------------|
| Buttons | `<Button>` with semantic variants (`primary`, `secondary`, `tertiary`) |
| Checkboxes | `<Checkbox>` with compound pattern (`Checkbox.Control`, `Checkbox.Indicator`) |
| Radio Options | `<Radio>` with `Radio.Group` for quiz options |
| Text Input | `<TextField>` for mission notes |
| Cards | `<Card>` with compound pattern (`Card.Header`, `Card.Content`) |
| Progress | Custom or `<Progress>` bar component |
| Navigation | Sidebar with custom styling |
| Modals | `<Modal>` with compound pattern if needed for confirmations |

**Reference**: For component details, fetch docs from `https://heroui.com/docs/react/components/{component-name}.mdx`

## Navigation State

### State Structure (stored in localStorage)

```typescript
interface OnboardingState {
  checks: Record<string, boolean>;      // { "stepIdx-checkIdx": true }
  quizzes: Record<number, number>;      // { stepIdx: selectedOption }
  missions: Record<number, string>;     // { stepIdx: notes }
  currentStep: number;                  // Current step index
}
```

### Completion Logic

A step is considered "done" when:
- **CHECKLIST**: All items are checked
- **LEARN with quiz**: Correct answer is selected
- **MISSION**: Non-empty notes are saved

Users cannot proceed to the next step until the current step is completed (or can freely navigate but completion is tracked - to be decided).

## Animations

- **Page transitions**: Fade-up animation when changing steps
- **Check completion**: Smooth checkmark animation
- **Hover states**: Color transitions on interactive elements
- **Toast notifications**: Slide-up animation for completion messages

## Toast Notifications

Display feedback for:
- Step completion: "✅ 모두 완료!"
- Quiz correct answer: "✅ 정답!"
- Errors/warnings as needed

Toast slides up from bottom center and auto-dismisses after 2 seconds.

## Content Structure Example

```typescript
const steps = [
  {
    chapter: '세팅',
    type: 'checklist',
    title: '팀원 연락처 등록',
    desc: '팀 슬랙, 연락처를 저장하고 인사해보세요.',
    checklist: [
      { label: '팀원 연락처 저장', hint: '팀 디렉토리에서 전체 연락처를 내려받으세요' },
      { label: '팀 채팅방에 인사 남기기', hint: '"안녕하세요, 새로 합류한 OOO입니다!" 한 줄이면 충분합니다' },
    ],
    body: `> 💡 연락처는 [팀 디렉토리 링크]에서 CSV로 다운로드할 수 있습니다.`
  },
  {
    chapter: '서비스 체험',
    type: 'mission',
    title: '서비스 직접 사용해보기',
    desc: '설명을 듣기 전에, 먼저 우리 서비스를 사용자 관점에서 체험합니다.',
    missions: [
      { title: '미션 1: 회원가입부터 시작', desc: '테스트 계정으로 서비스에 가입하고, 프로필을 완성해보세요.' },
    ]
  },
  {
    chapter: '이해',
    type: 'learn',
    title: '로드맵',
    desc: '우리 제품이 어디로 가고 있는지 큰 그림을 봅니다.',
    body: `## 2024 로드맵 개요...`,
    quiz: {
      question: '현재 우리 제품은 어떤 단계에 있나요?',
      options: ['Phase 1: 기반', 'Phase 2: 확장', 'Phase 3: 성장'],
      answer: 1
    }
  }
];
```

## MDX Rendering

The app should render MDX content including:
- Headers (h2, h3)
- Paragraphs
- Lists (ul, ol)
- Code blocks with syntax highlighting
- Blockquotes with accent styling
- Custom components (Check, Head)
- Images and placeholders

## Technical Constraints

1. **Electron packaging**: App must run as a standalone executable
2. **Offline-first**: No external API calls, all data local
3. **LocalStorage persistence**: All state survives app restarts
4. **Progress tracking**: Users cannot skip uncompleted steps
5. **HeroUI v3 only**: Use v3 patterns (no Provider, compound components)
6. **Tailwind CSS v4**: Required for HeroUI v3 compatibility
7. **MDX support**: Content authored in MDX format
8. **Accessibility**: Follow React Aria patterns from HeroUI

## Key Implementation Notes

- Import order: Tailwind CSS first, then `@heroui/styles`
- Use `onPress` not `onClick` for better accessibility
- Theme switching via `class="dark"` on html element
- CSS variables use `oklch` color space
- No `HeroUIProvider` needed in v3
- Use semantic variants: `primary`, `secondary`, `tertiary`, `danger`, `ghost`, `outline`
