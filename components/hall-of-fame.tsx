"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/components/user-provider";
import { GAMES, formatScore, getGame, seededScores } from "@/lib/games";

export function HallHead() {
  return (
    <div className="hall-head">
      <h1>SALÓN DE LA FAMA</h1>
      <p className="pixel" style={{ fontSize: 10 }}>LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA</p>
    </div>
  );
}

/** Suspense fallback while search params resolve on the client. */
export function HallOfFameFallback() {
  return (
    <div className="av-hall fade-in">
      <HallHead />
    </div>
  );
}

export function HallOfFame() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const game = getGame(searchParams.get("juego") ?? "") ?? GAMES[0];
  const tab = game.id;
  const rows = useMemo(() => seededScores(tab.length * 23 + 7, 12), [tab]);
  const youRank = user ? Math.floor(8 + (tab.length % 4)) : null;
  const youScore = user ? rows[5].score - 2400 : null;

  const selectTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("juego", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="av-hall fade-in">
      <HallHead />

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            className={"chip" + (tab === g.id ? " active" : "")}
            aria-pressed={tab === g.id}
            onClick={() => selectTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{rows[1].name}</div>
          <div className="score">{formatScore(rows[1].score)}</div>
          <div className="date">{rows[1].date}</div>
        </div>
        <div className="podium-slot gold">
          <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>CAMPEÓN</div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>01</div>
          <div className="name">{rows[0].name}</div>
          <div className="score" style={{ fontSize: 20 }}>{formatScore(rows[0].score)}</div>
          <div className="date">{rows[0].date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{rows[2].name}</div>
          <div className="score">{formatScore(rows[2].score)}</div>
          <div className="date">{rows[2].date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={tab + r.name}
            className={"tr" + (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{formatScore(r.score)}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div className="tr you" style={{ animationDelay: `${rows.length * 50 + 50}ms` }}>
              <div className="rk" style={{ color: "var(--yellow)" }}>#{String(youRank).padStart(2, "0")}</div>
              <div className="pl" style={{ color: "var(--yellow)" }}>{user.name}</div>
              <div className="sc" style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}>
                {formatScore(youScore || 9999)}
              </div>
              <div className="dt">11/05/2026</div>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/juegos" className="btn lg">VOLVER A LA BIBLIOTECA</Link>
      </div>
    </div>
  );
}
