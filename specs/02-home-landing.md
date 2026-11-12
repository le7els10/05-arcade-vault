# SPEC 02 — Home landing de Arcade Vault

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-11-12
> **Objective:** Portar a `/` la landing de `references/templates/home-about/home.jsx` con datos mock y aspecto idéntico, moviendo la Biblioteca a `/juegos` y dejando fuera la vista About.

---

## Por qué existe esta spec

La SPEC 01 dejó un MVP navegable donde `/` es la Biblioteca. La nueva referencia `references/templates/home-about/` agrega una landing de marketing (hero, features, juegos destacados, stats, actividad, precios, CTA final) y una vista "Acerca de".
Esta spec porta **solo la landing**. About queda para una spec futura.

Comparado con `references/templates/`, el `styles.css` de la referencia solo **agrega** bloques: no cambia ninguna clase existente. El `nav.jsx` solo agrega los links "Inicio" y "Acerca de".

---

## Scope

**In:**

- Nueva ruta `/` → Home landing, con las secciones de `home.jsx` en el mismo orden y con los mismos textos:
  1. **Hero:** siluetas pixel flotantes (`FloatingSilhouettes`, s1–s8), eyebrow "▸ INSERTA UNA MONEDA_", título en tres líneas, subtítulo, CTAs "▶ EXPLORAR JUEGOS" y "✦ CREAR CUENTA", e indicador "DESLIZA ▼".
  2. **// 01 ¿POR QUÉ ARCADE VAULT?:** 4 `feature-card` con iconos pixel SVG (`FeatureIcon`: GAMEPAD, FREE, TROPHY, ROCKET).
  3. **// 02 JUEGOS DISPONIBLES AHORA:** `mini-rail` con los primeros 6 de `GAMES` y el botón "VER TODOS LOS JUEGOS →".
  4. **Stats:** 3 `stat-block` ("12+ JUEGOS", "MILES DE PARTIDAS", "GLOBAL RANKING").
  5. **// 03 ACTIVIDAD EN VIVO:** ticker "ÚLTIMAS PUNTUACIONES" (7 filas) y "TOP JUGADORES · HOY" (5 filas con barra) con el botón "VER SALÓN →".
  6. **// 04 PRECIOS:** `price-card` "JUGADOR VAULT $0" con el sello "FREE PLAY" y 3 FAQ.
  7. **CTA final:** "¿LISTO PARA JUGAR?" y "INSERTAR MONEDA →".
- Animación de aparición al hacer scroll (`.reveal` → `.reveal.in`) con `IntersectionObserver` (threshold 0.12, se desconecta tras revelar), igual que `useReveal`.
- La Biblioteca se mueve de `/` a `/juegos` sin cambios funcionales.
- Navegación de los CTAs:
  - EXPLORAR JUEGOS, VER TODOS LOS JUEGOS e INSERTAR MONEDA → `/juegos`.
  - CREAR CUENTA y EMPEZAR GRATIS → `/auth`, siempre, haya sesión o no (igual que la plantilla).
  - Mini-card → `/juegos/<id>`.
  - VER SALÓN → `/salon`.
- Nav: se agrega el link **"Inicio"** (`/`) antes de "Biblioteca", en desktop y en el panel móvil. "Biblioteca" pasa a `/juegos`. El logo va a `/`.
- Reubicación de links internos que hoy apuntan a `/` (decisión "mixta"):
  - A `/juegos`: "VOLVER AL VAULT" (detalle y modal del reproductor) y "VOLVER A LA BIBLIOTECA" (salón).
  - Se quedan en `/` (Home): el botón de `app/not-found.tsx` y los redirects de `auth-form.tsx` (submit y JUGAR COMO INVITADO).
- CSS: se agregan a `app/styles/arcade-vault.css` **solo** los bloques de la home de `home-about/styles.css`: `HOME PAGE` (líneas 930–1069), `ACTIVITY` (1621–1671) y `PRICING` (1672–1725).
- `prefers-reduced-motion: reduce`: `.reveal` se muestra directo (sin transición), y se apagan las animaciones de la home (flotado de siluetas, bounce de "DESLIZA", `pulse` de los botones de la home, `tickin`/`pulse-led` del ticker).
- Datos mock de la landing hardcodeados como en la plantilla, en un módulo tipado.
- Commitear `references/templates/home-about/` **sin** `home-about.zip` ni `arcade-vault-standalone.html`.

**Out of scope (for future specs):**

- La vista **About** (`about.jsx`), su ruta, su CSS (`ABOUT PAGE`, 1071–1147) y el link "Acerca de" del nav.
- El bloque CSS `GAMEPAD` (1151–1620) y `/* misc */ .divider`.
- Datos reales o derivados en Actividad / Stats (no se calculan desde `seededScores`, `PLAYERS`, `av_scores` ni `GAMES.length`).
- CTAs que cambian según la sesión.
- Cambios en la Biblioteca, el detalle, el reproductor, auth o el salón, más allá del cambio de `href`.
- Redirects de la URL antigua (no hace falta: `/` sigue existiendo y ahora es la Home).
- Migración a utilidades Tailwind y tests automatizados.

---

## Data model

Datos estáticos de la landing, copiados literalmente de `home.jsx`:

```ts
// lib/home.ts
import type { GameColor } from "@/lib/games"; // "cyan" | "magenta" | "yellow" | "green"

export type FeatureIconKind = "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";

export interface HomeFeature {
  icon: FeatureIconKind;
  title: string;       // "JUEGOS CLÁSICOS"
  desc: string;
  color: GameColor;
}

export interface HomeStat {
  value: string;       // "12+"
  unit: string;        // "JUEGOS"
  sub: string;         // "Y CONTANDO"
}

export interface RecentScore {
  player: string;      // "NEONFOX"
  game: string;        // "Caída" (texto libre, igual que la plantilla)
  score: number;       // 184220
  ago: string;         // "hace 2 min"
  color: GameColor;
}

export interface TopPlayer {
  rank: number;        // 1..5
  player: string;
  score: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FEATURES: HomeFeature[];      // 4
export const HOME_STATS: HomeStat[];            // 3
export const RECENT_SCORES: RecentScore[];      // 7
export const TOP_PLAYERS_TODAY: TopPlayer[];    // 5
export const PRICING_PERKS: string[];           // 6 ("✔ Acceso a todos los juegos", …)
export const PRICING_FAQ: FaqItem[];            // 3
```

- Las puntuaciones se formatean con `toLocaleString("es-ES")`, como en la plantilla.
- El ancho de la barra del top es `100 - i * 16` %; el ticker escalona `animationDelay` en `i * 60` ms; las feature cards escalonan `transitionDelay` en `i * 80` ms y los stats en `i * 90` ms.
- No hay persistencia nueva: no se lee ni se escribe localStorage.

---

## Estructura de archivos

```
app/
  page.tsx                 ← MODIFICA: renderiza <HomeLanding /> + metadata
  juegos/
    page.tsx               ← NUEVO: renderiza <Library /> (movido desde app/page.tsx) + metadata
  styles/arcade-vault.css  ← MODIFICA: + bloques HOME PAGE, ACTIVITY, PRICING + reduced-motion
  not-found.tsx            ← sin cambios (sigue a "/")
  juegos/[id]/page.tsx     ← MODIFICA: VOLVER AL VAULT → /juegos
components/
  home-landing.tsx         ← NUEVO: Server Component con todas las secciones
  home-reveal.tsx          ← NUEVO: "use client", efecto IntersectionObserver sobre .reveal
  home-art.tsx             ← NUEVO: FloatingSilhouettes + FeatureIcon (SVG, sin estado)
  mini-card.tsx            ← NUEVO: tarjeta mini con next/link a /juegos/<id>
  nav.tsx                  ← MODIFICA: link Inicio, Biblioteca → /juegos, estados activos
  game-player.tsx          ← MODIFICA: VOLVER AL VAULT → /juegos
  hall-of-fame.tsx         ← MODIFICA: VOLVER A LA BIBLIOTECA → /juegos
  auth-form.tsx            ← sin cambios (sigue a "/")
lib/
  home.ts                  ← NUEVO: tipos y datos mock de la landing
references/templates/home-about/  ← se commitea (sin .zip ni standalone .html)
```

---

## Implementation plan

1. **Mover la Biblioteca.** Crear `app/juegos/page.tsx` que renderiza `<Library />` con `metadata` (título "Biblioteca"). Dejar `app/page.tsx` renderizando `<Library />` temporalmente. Verificar: `/juegos` y `/` muestran la Biblioteca; `npx tsc --noEmit` OK.
2. **Nav y links.** En `components/nav.tsx`: agregar la sección `"inicio"` (activa solo con `pathname === "/"`), poner "Inicio" antes de "Biblioteca" en desktop y en el panel móvil, y que "Biblioteca" apunte a `/juegos` (activa en `/juegos` y `/juegos/*`). Logo → `/`. Cambiar a `/juegos` los `href` de `app/juegos/[id]/page.tsx`, `components/game-player.tsx` y `components/hall-of-fame.tsx`. Verificar: en `/juegos/caida` está activa "Biblioteca" y VOLVER AL VAULT lleva a `/juegos`.
3. **CSS de la home.** Agregar a `app/styles/arcade-vault.css` los bloques `HOME PAGE`, `ACTIVITY` y `PRICING` copiados literalmente, y un bloque `@media (prefers-reduced-motion: reduce)` que deje `.reveal` visible sin transición y apague `float`, `bounce`, `pulse`, `tickin` y `pulse-led` dentro de `.home`. Verificar: las páginas existentes se ven igual que antes.
4. **Datos.** Crear `lib/home.ts` según el Data model. Verificar: `npx tsc --noEmit` OK.
5. **Arte y tarjetas.** Crear `components/home-art.tsx` (`FloatingSilhouettes`, `FeatureIcon`, con los SVG copiados tal cual y `aria-hidden` en las siluetas) y `components/mini-card.tsx` (`next/link` a `/juegos/<id>`, con `cover-bg ${game.cover}`, título y categoría).
6. **Landing.** Crear `components/home-landing.tsx` (Server Component) con las 7 secciones, usando `next/link` con clases `btn` para los CTAs. Crear `components/home-reveal.tsx` (`"use client"`) que en `useEffect` observa `.reveal` y agrega `in`. Reemplazar `app/page.tsx` por `<HomeLanding />` con `metadata`. Verificar: `/` se ve como `home-about/arcade-vault-standalone.html` sección por sección (desktop y ~375px de ancho).
7. **Cierre.** Commitear `references/templates/home-about/` excluyendo `home-about.zip` y `arcade-vault-standalone.html`. Verificar: `npm run lint` y `npm run build` sin errores.

---

## Acceptance criteria

- [ ] `/` muestra la landing con las 7 secciones en el orden y con los textos de `home.jsx`.
- [ ] `/juegos` muestra la Biblioteca con búsqueda y chips funcionando igual que antes en `/`.
- [ ] El hero muestra 8 siluetas flotando, que no capturan clics (`pointer-events: none`) y tienen `aria-hidden="true"`.
- [ ] La sección // 02 muestra exactamente 6 mini-cards (las primeras 6 de `GAMES`); al hacer clic en una se navega a `/juegos/<id>`.
- [ ] EXPLORAR JUEGOS, VER TODOS LOS JUEGOS e INSERTAR MONEDA llevan a `/juegos`.
- [ ] CREAR CUENTA y EMPEZAR GRATIS llevan a `/auth`, también con sesión iniciada.
- [ ] VER SALÓN lleva a `/salon`.
- [ ] El ticker tiene 7 filas y el top tiene 5, con puntuaciones en formato `es-ES` (p. ej. `184.220`).
- [ ] Las secciones con `.reveal` arrancan ocultas y aparecen al entrar en el viewport.
- [ ] Con `prefers-reduced-motion: reduce` emulado, todas las secciones se ven sin hacer scroll y no hay animaciones de flotado, bounce ni pulse en la home.
- [ ] El nav muestra "Inicio · Biblioteca · Salón de la Fama" (desktop y panel móvil); "Inicio" está activo solo en `/` y "Biblioteca" en `/juegos` y `/juegos/*`.
- [ ] No aparece ningún link "Acerca de".
- [ ] VOLVER AL VAULT (detalle y modal del reproductor) y VOLVER A LA BIBLIOTECA (salón) llevan a `/juegos`.
- [ ] El botón del 404, el submit de auth y JUGAR COMO INVITADO llevan a `/`.
- [ ] A 375px de ancho no hay scroll horizontal en `/`.
- [ ] `app/styles/arcade-vault.css` no tiene clases `.about*` ni `.gp*`.
- [ ] `references/templates/home-about/` está commiteada sin `.zip` ni `arcade-vault-standalone.html`.
- [ ] `npm run lint` y `npm run build` terminan sin errores.

---

## Decisions

- **La Biblioteca va a `/juegos`.** Encaja con `/juegos/[id]` y permite que "Biblioteca" quede activa en todo `/juegos/*`. Descartado: `/biblioteca` (rompe la jerarquía de URLs) y dejar la Home en otra ruta (la referencia la trata como página de inicio).
- **Links mixtos.** Lo que dice "Vault/Biblioteca" va a `/juegos`; el 404 y los redirects de auth van a la Home. Descartado: mandar todo a `/juegos` o todo a `/`.
- **Datos hardcodeados como en la plantilla.** Mantiene la línea de la SPEC 01 (todo mock). Descartado: derivarlos de `seededScores`/`GAMES`, porque "12+" y el "hoy" del top no corresponden con los mocks actuales.
- **CTAs sin depender de la sesión.** La Home no necesita `UserProvider` y puede ser Server Component. Descartado: adaptar los CTAs a la sesión.
- **Solo el CSS de la home.** Portar ABOUT o GAMEPAD agregaría código muerto. Cada uno entra con su propia spec.
- **Server Component + una isla cliente para el reveal.** Solo `home-reveal.tsx` es `"use client"`; el resto se renderiza en el servidor. Descartado: toda la landing como cliente (como el SPA de la plantilla).
- **Respetar `prefers-reduced-motion`.** Es una mejora de accesibilidad sobre la plantilla; con motion normal el aspecto es idéntico.
- **Sin link "Acerca de".** Evita links rotos mientras About no existe.
- **Referencia commiteada sin binarios pesados.** El `.zip` y el standalone de 1,4 MB son redundantes con los `.jsx` y el `.css`.

---

## Risks

- **Flash de contenido con `.reveal`.** Si el JS no hidrata, las secciones `.reveal` quedan en `opacity: 0`. Mitigación: aceptable en el MVP (la plantilla hace lo mismo). Con reduced-motion se ven siempre.
- **El reveal y la navegación cliente.** Al volver a `/` con navegación cliente, el efecto tiene que volver a observar los nodos nuevos. Mitigación: `HomeReveal` se monta dentro de la Home y desconecta el observer al desmontarse.
- **El "_" del eyebrow no parpadea.** En la plantilla, `.blink` solo está definido bajo `.av-hero .sub`, así que el `_` del hero queda fijo. Se mantiene fiel a la plantilla; si se quiere que parpadee, es un cambio explícito aparte.
- **Colisión de nombres de keyframes.** `fadeIn`, `slideIn` y `spinpix` ya existen en el CSS actual. Al copiar los bloques, verificar que no queden `@keyframes` duplicados (`float`, `bounce`, `tickin`, `pulse-led` son nuevos).
- **`cacheComponents`.** La Home no usa datos dinámicos ni `useSearchParams`, así que no necesita `<Suspense>`. Si en el futuro lee la sesión, va a necesitar uno.

---

## What is **not** in this spec

- Vista About y link "Acerca de".
- Gamepad / controles táctiles.
- Datos reales de actividad, ranking o stats.
- Cambios de comportamiento en Biblioteca, Detalle, Reproductor, Auth o Salón.
