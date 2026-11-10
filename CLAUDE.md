# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault: an online platform for playing games and competing for the highest score. The repo is currently a fresh Create Next App scaffold (`app/layout.tsx`, `app/page.tsx`), so most of the product is still to be built.

Work follows **Spec Driven Design** with the `/spec` and `/spec-impl` skills from `Klerith/fernando-skills` (install with `npx skills@latest add Klerith/fernando-skills`). Write a spec first, then implement against it. `references/` is an empty folder meant for reference material.


## Skills
Usa siempre /frontend-design y /ui-ux-pro-max para cuando necesites aplicar interfaces de usuario

## Commands

- `npm run dev`: dev server (Turbopack) at http://localhost:3000
- `npm run build`: production build (also type-checks)
- `npm run start`: serve the production build
- `npm run lint`: ESLint (flat config: `eslint-config-next` core-web-vitals + typescript)
- `npx tsc --noEmit`: type-check only

No test framework is configured yet.

## Stack and non-obvious configuration

- **Next.js 16.4 (App Router) + React 19.3 + TypeScript (strict)**. APIs differ from older Next.js. Check `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`, …) before using any Next API.
- `next.config.ts` turns on **`cacheComponents`** and **`partialPrefetching`**, which change how caching and dynamic rendering behave (`"use cache"`, Suspense boundaries around dynamic data). Read the docs on these before you write data fetching. It also turns on `experimental.agentFeedback`.
- **Tailwind CSS v4** is loaded through the `@tailwindcss/turbopack` loader rule in `next.config.ts`. There is no PostCSS config and no `tailwind.config.*`. Theme tokens live in `app/globals.css` through `@import "tailwindcss"` and `@theme inline`, and dark mode uses `prefers-color-scheme`.
- Route props use the globally generated helper types (e.g. `LayoutProps<"/">`, `PageProps<...>`) instead of hand-written prop types.
- Import alias: `@/*` maps to the repo root.
- Fonts: Geist and Geist Mono through `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`.
