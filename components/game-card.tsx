"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { formatScore, type Game } from "@/lib/games";

export function GameCard({ game }: { game: Game }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const href = `/juegos/${game.id}`;
  const open = () => router.push(href);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };
  const onLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  };

  const btnColor = game.color === "magenta" ? "magenta" : game.color === "yellow" ? "yellow" : "";

  return (
    <div
      ref={tiltRef}
      className="card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => router.prefetch(href)}
      onClick={open}
    >
      <div className="cover">
        <div className={"cover-bg " + game.cover}></div>
        <div className="label">{game.cat}</div>
      </div>
      <div className="meta">
        <div className="title">{game.title}</div>
        <div className="desc">{game.short}</div>
        <div className="row">
          <div className="score-badge">
            <span>MEJOR PUNTUACIÓN</span>
            <b>{formatScore(game.best)}</b>
          </div>
          <button
            className={"btn " + btnColor}
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
          >
            JUGAR
          </button>
        </div>
      </div>
    </div>
  );
}
