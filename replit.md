# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project Structure (Dual Layout)

### Replit 전용 (프리뷰/배포)
- **`artifacts/credit-abandoner/`** — Replit 아티팩트 워크플로우가 관리; 변경 금지
- **`artifacts/api-server/`** — Replit API 서버 아티팩트

### VS Code 팀 협업용 독립 패키지 (main codebase)
- **`frontend/`** — 독립 React+Vite 패키지 (`credit-abandoner-frontend`)
  - `npm install && npm run dev` 로 로컬 실행 가능
  - `.env.example` → `.env` 로 복사 후 `VITE_API_BASE_URL` 설정
- **`backend/`** — 독립 Express 패키지 (`credit-abandoner-backend`)
  - `npm install && npm run dev` 로 로컬 실행 가능
  - `.env.example` → `.env` 로 복사 후 `DATABASE_URL` 설정

### 중요 환경 토글
- `DB_FEATURES_ENABLED` in `frontend/src/contexts/PlayerContext.tsx`
  - `false` (기본값): 익명 플레이어, 점수 제출 없음, 리더보드 숨김
  - `true`: DB 연동 전체 활성화 (입력창, 리더보드, 점수 제출)

## Artifacts

### 학점 포기자 (Credit Abandoner) — `/`
- **Kind**: react-vite web app
- **Dir**: `artifacts/credit-abandoner/` (Replit 프리뷰 전용) / `frontend/` (팀 개발)
- **Description**: A hilarious Korean university mini-game collection app. "공부 빼고 다 재밌는 사람들의 대결"
- **Features**:
  - Home lobby with lion mascot, tier badge, and total score
  - Game Select screen with 4 colorful game cards
  - Game 1: 교수님 가방 닫기 (Professor Bag Reaction Speed Game)
  - Game 2: 드랍쉽 (Delivery Box Dodge Game)
  - Game 3: 커피 연타 (Coffee Button Mash Game)
  - Game 4: 열공 모드 (Study White Noise Concentration Game)
  - 8-tier ranking system (제적 위기 → 명예 교수) based on percentile
  - localStorage persistence for all scores and tiers
- **Tech**: React + Vite, Tailwind CSS, framer-motion, wouter, lucide-react
- **State**: GameContext (local scores/tier) + PlayerContext (nickname/schoolId, localStorage)
- **Backend**: PostgreSQL `schools` (16 universities) + `scores` tables; API at `/api`
- **Routes**: `/entry` (player setup) → `/` (home) → `/select` → `/game1-4`, `/leaderboard`
- **Leaderboard**: Real-time, 15s auto-refresh, per-game or overall, filterable by school
