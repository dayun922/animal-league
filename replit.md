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

## Artifacts

### 학점 포기자 (Credit Abandoner) — `/`
- **Kind**: react-vite web app
- **Dir**: `artifacts/credit-abandoner/`
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
- **State**: Global GameContext (no backend needed)
