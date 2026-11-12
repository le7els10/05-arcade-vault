# SPEC 01 — MVP visual: pantallas de Arcade Vault

> **Status:** Aprobado
> **Depends on:** —
> **Date:** 2026-11-11
> **Objective:** Portar a Next.js (App Router) las cinco pantallas de `references/templates/` con datos mock y estado en localStorage, sin implementar ningún juego real.

---

## Por qué existe esta spec

Las plantillas de `references/templates/` son un prototipo SPA (React UMD + Babel en el navegador) con router por hash.
El tema visual ya está portado en `app/styles/arcade-vault.css` y `app/globals.css` (commit `e905079`).
Esta spec convierte el prototipo en rutas reales de Next.js 16, manteniendo el aspecto idéntico, para tener un MVP navegable sobre el que construir los juegos en specs futuras.

---

## Scope

**In:**

- Rutas App Router:
  - `/` → Biblioteca (hero, búsqueda por nombre, chips de categoría, grid de tarjetas con efecto tilt, estado "NO HAY RESULTADOS").
  - `/juegos/[id]` → Detalle (portada, tags, descripción, stat strip, botones JUGAR AHORA / VOLVER AL VAULT, leaderboard top 10).
  - `/juegos/[id]/jugar` → Reproductor (HUD, CRT con arena CSS animada, puntuación simulada, PAUSA/REANUDAR, FIN, SALIR, modal de fin de juego con guardado de puntuación).
  - `/auth` → Auth (pestañas INICIAR SESIÓN / CREAR CUENTA, campo email solo en "crear", JUGAR COMO INVITADO, botones sociales decorativos).
  - `/salon` → Salón de la Fama (pestañas por juego vía `?juego=<id>`, podio top 3, tabla de 12 filas, fila "TU MEJOR MARCA" si hay usuario).
- `app/not-found.tsx` con estilo arcade para ids de juego inexistentes y rutas desconocidas.
- Nav global (logo, links con estado activo, contador "CRÉDITOS · 03", botón login/usuario, hamburguesa con panel móvil) y footer global, montados en `app/layout.tsx`.
- Datos mock tipados (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) portados desde `references/templates/data.jsx`.
- Sesión mock y puntuaciones en localStorage con las claves de la plantilla (`av_user`, `av_scores`).
- Logout directo al pulsar el botón de usuario del Nav (igual que la plantilla).
- Reutilizar las clases CSS existentes de `app/styles/arcade-vault.css`; añadir solo las que falten respecto a `references/templates/styles.css`.
- Textos de UI en español, idénticos a la plantilla.

**Out of scope (for future specs):**

- Cualquier juego jugable (Bloque Buster, Caída, Serpentina, etc.).
- Autenticación real, backend, base de datos o API.
- Validación de formularios más allá de lo que hace la plantilla.
- Login social funcional (Google / GitHub).
- Leaderboards reales: el Salón y el Detalle siguen usando `seededScores`, no `av_scores`.
- Lógica real del contador de créditos.
- Menú desplegable de usuario.
- Migración de estilos a utilidades Tailwind.
- Tests automatizados (no hay framework configurado).

---

## Data model

```ts
// lib/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;          // slug, p. ej. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;       // clase CSS, p. ej. "cover-bricks"
  color: GameColor;
  best: number;
  plays: string;       // ya formateado, p. ej. "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;        // "DD/MM/2026"
}

export const GAMES: Game[];                       // 8 juegos, copiados de data.jsx
export const CATS: ("TODOS" | GameCategory)[];    // ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]
export const PLAYERS: string[];
export function getGame(id: string): Game | undefined;
export function seededScores(seed: number, count?: number): ScoreRow[]; // determinista, mismo algoritmo
```

```ts
// lib/storage.ts — solo cliente, todo envuelto en try/catch
export interface User { name: string }            // máx. 10 caracteres, mayúsculas
export interface SavedScore { game: string; score: number; name: string; at: number }

// Claves (las mismas de la plantilla, sin versionado)
"av_user"   // JSON User | null
"av_scores" // JSON SavedScore[]
```

Convenciones:

- Números formateados con `toLocaleString("es-ES")`.
- Semillas de `seededScores` iguales a la plantilla: Detalle `id.length * 17 + 3` (10 filas), Salón `id.length * 23 + 7` (12 filas).
- `?juego=` inválido o ausente en `/salon` → se usa `GAMES[0].id`.

---

## Estructura de archivos

```
app/
  layout.tsx                    (modificado: UserProvider + Nav + Footer)
  page.tsx                      (reemplazado: Biblioteca)
  not-found.tsx                 (nuevo)
  juegos/[id]/page.tsx          (nuevo: Detalle)
  juegos/[id]/jugar/page.tsx    (nuevo: Reproductor)
  auth/page.tsx                 (nuevo)
  salon/page.tsx                (nuevo)
  styles/arcade-vault.css       (solo si faltan clases)
lib/
  games.ts
  storage.ts
components/
  user-provider.tsx   ("use client": contexto con user, login, logout, saveScore)
  nav.tsx             ("use client")
  footer.tsx
  game-card.tsx       ("use client": tilt con ref)
  library.tsx         ("use client": búsqueda + chips)
  game-player.tsx     ("use client": simulación)
  auth-form.tsx       ("use client")
  hall-of-fame.tsx    ("use client": lee ?juego=)
```

Las páginas son Server Components que resuelven el juego y delegan la interactividad a los componentes cliente.

---

## Implementation plan

1. **Datos mock.** Crear `lib/games.ts` con tipos, `GAMES`, `CATS`, `PLAYERS`, `getGame` y `seededScores`. Verificar: `npx tsc --noEmit` sin errores.
2. **Paridad de CSS.** Comparar `references/templates/styles.css` con `app/styles/arcade-vault.css` y añadir las clases que falten (covers, CRT, modal, podio, auth, panel móvil). Verificar: la home actual sigue renderizando igual.
3. **Sesión mock.** Crear `lib/storage.ts` y `components/user-provider.tsx`. Leer localStorage solo tras montar (sin mismatch de hidratación). Verificar: `npm run build` OK.
4. **Shell global.** Crear `components/nav.tsx` y `components/footer.tsx`; montarlos en `app/layout.tsx` dentro de `UserProvider`, con `<main className="av-main">`. Links con `next/link`; estado activo con `usePathname` (Biblioteca activa también en `/juegos/*`). Verificar: Nav y footer visibles en `/`; hamburguesa abre y cierra el panel a ancho móvil.
5. **Biblioteca.** Crear `components/game-card.tsx` y `components/library.tsx`; reemplazar `app/page.tsx`. Verificar: buscar "zzz" muestra "NO HAY RESULTADOS"; chip PUZZLE deja solo CAÍDA; click en tarjeta navega a `/juegos/<id>`.
6. **Detalle + 404.** Crear `app/juegos/[id]/page.tsx` (con `generateStaticParams` desde `GAMES`, `notFound()` si no existe) y `app/not-found.tsx`. Verificar: `/juegos/caida` muestra leaderboard de 10 filas; `/juegos/xyz` muestra la 404 arcade.
7. **Reproductor.** Crear `components/game-player.tsx` y `app/juegos/[id]/jugar/page.tsx`. Simulación igual a la plantilla: +10–99 puntos cada 220 ms, nivel sube al cruzar múltiplos de 2500, PAUSA detiene el contador, FIN abre el modal, GUARDAR PUNTUACIÓN escribe en `av_scores` y muestra "▸ PUNTUACIÓN GUARDADA_", JUGAR DE NUEVO reinicia. Verificar manualmente cada botón.
8. **Auth.** Crear `components/auth-form.tsx` y `app/auth/page.tsx`. Submit → `login({ name })` (mayúsculas, máx. 10, `PLAYER1` por defecto) y navega a `/`. JUGAR COMO INVITADO → `logout()` y navega a `/`. Verificar: tras login el Nav muestra el nombre; al recargar se conserva.
9. **Salón de la Fama.** Crear `components/hall-of-fame.tsx` (con `useSearchParams` dentro de un `<Suspense>`, requerido por `cacheComponents`) y `app/salon/page.tsx`. Pestañas actualizan `?juego=` con `router.replace`. Verificar: `/salon?juego=rocas` abre la pestaña ROCAS; con sesión aparece la fila amarilla "TU MEJOR MARCA".
10. **Limpieza.** Eliminar el contenido placeholder anterior de `app/page.tsx` si quedó algo, revisar `metadata` por página (título por juego en Detalle). Verificar: `npm run lint` y `npm run build` sin errores.

---

## Acceptance criteria

- [ ] `npm run build` termina sin errores de tipos ni de prerender.
- [ ] `npm run lint` termina sin errores.
- [ ] Las rutas `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth` y `/salon` existen y renderizan su pantalla.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación en ninguna de las cinco rutas.
- [ ] En `/`, escribir "caí" en la búsqueda deja solo la tarjeta CAÍDA.
- [ ] En `/`, el chip VERSUS deja solo DUELO PIXEL.
- [ ] En `/`, una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Click en una tarjeta navega a `/juegos/<id>` del juego pulsado.
- [ ] `/juegos/bloque-buster` muestra 10 filas en "MEJORES PUNTUACIONES" y el mismo orden en cada recarga.
- [ ] `/juegos/no-existe` muestra la página 404 arcade con botón de volver a `/`.
- [ ] "▶ JUGAR AHORA" navega a `/juegos/<id>/jugar`.
- [ ] En el Reproductor la puntuación sube sola; PAUSA la detiene y muestra "EN PAUSA"; REANUDAR la reactiva.
- [ ] FIN abre el modal "FIN DEL JUEGO" con la puntuación final.
- [ ] GUARDAR PUNTUACIÓN añade una entrada `{ game, score, name, at }` a `localStorage["av_scores"]`.
- [ ] JUGAR DE NUEVO reinicia puntuación a 0, vidas a 3 y nivel a 01.
- [ ] SALIR vuelve a `/juegos/<id>`.
- [ ] En `/auth`, la pestaña CREAR CUENTA muestra el campo de correo y la de INICIAR SESIÓN lo oculta.
- [ ] Enviar el formulario de `/auth` guarda `av_user`, navega a `/` y el Nav muestra el nombre en mayúsculas.
- [ ] Tras recargar la página, el Nav sigue mostrando el usuario.
- [ ] Pulsar el botón de usuario del Nav cierra sesión y borra `av_user`.
- [ ] `/salon` sin parámetro selecciona BLOQUE BUSTER; `/salon?juego=caida` selecciona CAÍDA.
- [ ] Cambiar de pestaña en el Salón actualiza `?juego=` en la URL.
- [ ] El Salón muestra podio (02, 01, 03) y 12 filas en la tabla.
- [ ] Con sesión iniciada el Salón muestra la fila "▸ TU MEJOR MARCA EN <JUEGO>"; sin sesión no aparece.
- [ ] El link activo del Nav es "Biblioteca" en `/` y `/juegos/*`, y "Salón de la Fama" en `/salon`.
- [ ] A 375 px de ancho no hay scroll horizontal y la hamburguesa abre el panel móvil.
- [ ] No existe código de ningún juego real en el repo.

---

## Decisions

- **Yes:** rutas App Router reales. URLs compartibles, prefetch y Server Components; el router por hash de la plantilla no aporta nada en Next.
- **No:** SPA con hash. Replicaría un hack del prototipo y anularía las ventajas de Next.
- **Yes:** simulación completa del Reproductor. Permite validar HUD, pausa y modal de fin antes de tener juegos.
- **No:** Reproductor estático. Dejaría sin probar el flujo de guardado de puntuación.
- **Yes:** localStorage con claves `av_user` y `av_scores`, sin versionar. Es un mock temporal; se sustituirá por backend en otra spec.
- **No:** sesión solo en memoria. El Nav perdería el usuario al recargar y el flujo se vería roto.
- **Yes:** reutilizar las clases de `app/styles/arcade-vault.css`. Ya están portadas y garantizan paridad visual.
- **No:** reescribir en Tailwind. Mucho trabajo y riesgo de diferencias visuales sin beneficio en el MVP.
- **Yes:** `lib/` para datos y `components/` para UI. Separación clara y reutilizable entre rutas.
- **No:** colocar componentes dentro de `app/`. Varias pantallas comparten piezas (Nav, tarjetas).
- **Yes:** `notFound()` + `app/not-found.tsx` arcade. Comportamiento estándar de Next y coherente con el tema.
- **No:** redirigir a `/` en ids inválidos. Oculta errores de enlace.
- **Yes:** `?juego=` en el Salón. Compartible y sobrevive a la recarga.
- **No:** estado local para la pestaña del Salón.
- **Yes:** logout directo desde el botón de usuario, como en la plantilla.
- **No:** menú desplegable de usuario. Componente nuevo fuera de la plantilla.
- **Yes:** Detalle y Salón siguen usando `seededScores`, no las puntuaciones guardadas. Mantiene el MVP visual; leaderboards reales van en otra spec.

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Mismatch de hidratación al leer localStorage en el render | Leer `av_user` solo tras montar (`useEffect` / `useSyncExternalStore` con snapshot de servidor `null`). |
| `useSearchParams` sin `<Suspense>` rompe el build con `cacheComponents` | Envolver `HallOfFame` en `<Suspense>` en `app/salon/page.tsx`; revisar `node_modules/next/dist/docs/` antes de escribir. |
| `params` asíncrono en Next 16 | Usar `PageProps<"/juegos/[id]">` y `await params`, según la doc local. |
| Clases CSS faltantes respecto a la plantilla | Paso 2 del plan compara ambos archivos antes de construir pantallas. |
| localStorage bloqueado (modo privado) | Todo acceso en `try/catch`; la app funciona sin persistir. |
| Intervalo de la simulación sigue corriendo al salir | Limpiar el `setInterval` en el cleanup del efecto. |

---

## What is **not** in this spec

- Ningún juego jugable.
- Autenticación real, backend o base de datos.
- Login social funcional.
- Leaderboards construidos con puntuaciones reales.
- Lógica de créditos.
- Menú desplegable de usuario.
- Migración a Tailwind.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
