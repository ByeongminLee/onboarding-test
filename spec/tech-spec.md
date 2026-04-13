# Tech Spec - Onboarding Application

## 1. Technology Stack

### Core Framework
- **React** - UI framework
- **Electron** - Desktop application framework for creating standalone executables

### Rationale
Web-based React development allows easy web developer onboarding. Electron packaging enables offline usage without internet dependency, distributing as a standalone executable.

## 2. State Management

- **zustand** - Global state management
- Local persistence via localStorage for all user data

## 3. UI Framework

- **HeroUI** (https://heroui.com/)
- Documentation reference: https://heroui.com/react/llms-full.txt
- Tailwind CSS-based component library

## 4. MDX Content System

### Centralized Content
- All onboarding content authored in MDX format
- Custom table of contents and part organization
- Future-proof: content structure customizable after initial implementation

### Custom MDX Components
- `<Check>` component for checklists
- Example usage:
  ```mdx
  계정 추가 확인 리스트
  <Check> Github
  <Check> Google Email
  ```

### Frontmatter / Custom Header Support
Frontmatter format:
```yaml
---
title:
date:
description:
part: 1
step: 2
---
```

OR custom head component:
```mdx
<Head title="" Date="" ... >
```

## 5. Data Storage

- **localStorage** for all data persistence
- No external database or server communication
- User progress (checklists, confirmations) preserved locally
- Prevents navigation past unchecked items

## 6. Offline Functionality

- No external communication required
- Fully self-contained Electron application
- All assets and content bundled with the application

## 7. Build and Packaging

- Electron packaging for distribution
- Cross-platform executable generation
- No build-time external dependencies

## 8. Content Structure

### Part 1. Account Check
- GitHub, Notion, Discord, Google Calendar invitation verification
- Checkbox UI component for confirming each invitation

### Part 2. Environment Setup
- Docker, Python, and frontend test environment
- Backend developer focus (includes frontend for future needs)
- Development environment setup
- Deployment environment configuration

#### Development Environment
- Backend: env setup, Docker installation details (Redis, PostgreSQL, etc.)
- Frontend: env setup, `pnpm bootstrap dev` for automated setup, access via port:3000

#### Deployment Environment
- Backend: stg similar to dev; prod uses cloud DB, stg uses local DB (cost optimization ~200,000 KRW)
- Frontend: stg and prod nearly identical

#### Test Environment
- Email authentication: test+{N}@foodlogic.co.kr -> fixed code 01234
- Phone authentication: 01012341234 -> fixed code 01234

### Part 3. Development Process
- Full process (planning through QA to deployment)
- Developer-to-developer process

### Part 4. Development Communication / Documentation
- API Documentation
  - Legacy: Notion-based
  - Current: MD file management via http://localhost:8000/llms.txt (AI-generated)
- Branch Strategy
  - dev -> stg -> prod progression
  - Deployment pages follow same branch structure

### Part 5. Code - Application Layer
- Core business logic
- Payment/Plans
- Other application-level concerns

### Part 6. Cloud
- Currently in use
- Future learning requirements

### Part 7. CI/CD
- Continuous integration/deployment configuration

### Part 8. Monitoring and Data Analysis
- CS developer support requirements
- Application-level logging
- Analytics logging (primarily frontend)

### Part 9. Future Issues / Considerations
- Outstanding problems
- Topics requiring further discussion

## 9. UI Layout Reference

Based on `onboarding-prototype.html`:
- Left sidebar with two sections:
  1. Overall progress section
  2. Individual part list section

## 10. Design Principles

- Maintain all content from skill-spec.md exactly as specified
- Support future content customization
- Enable web developers to contribute easily
- Provide offline-first experience
