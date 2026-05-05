# blaster

A TypeScript sandbox-adventure prototype with deterministic seeded runs, city simulation, shops, and a final mission flow.

## Requirements

- Node.js 20+ (or current LTS)
- npm

## Install

```bash
npm install
```

## Run

- `npm run dev` - build and run the simulation CLI (`src/cli.ts`)
- `npm run play` - build and run the interactive terminal game (`src/play.ts`)
- `npm run web` - start Vite dev server

You can pass a seed to keep runs reproducible:

```bash
npm run play -- --seed my-seed
```

## Quality Checks

- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Build

```bash
npm run build
```

Compiled output is generated in `dist/`.

## Project Structure

- `src/core/` - random and weighted-selection utilities
- `src/domain/` - shared models and types
- `src/systems/` - simulation systems (attacks, city, progression, shops, game loop)
- `src/ui/` - terminal command parsing and display helpers
- `test/` - Vitest coverage for core gameplay flows

## Gameplay Notes

The MVP loop includes:

- Daily progression and attack simulation
- Resource management (money, food, water)
- Shop purchases (food, water, weapons)
- City damage tracking and fail conditions
- Final mission progression with post-victory choices
