import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pantalla no encontrada",
};

export default function NotFound() {
  return (
    <section className="av-hero fade-in" style={{ minHeight: "60vh" }}>
      <div className="pixel neon-magenta" style={{ fontSize: 12, letterSpacing: "0.2em" }} aria-hidden="true">
        ERROR 404
      </div>
      <h1 className="flicker" style={{ marginTop: 16 }}>
        PANTALLA NO ENCONTRADA
      </h1>
      <div className="sub">
        ESTE CARTUCHO NO ESTÁ EN EL VAULT <span className="blink">_</span>
      </div>
      <p style={{ color: "var(--ink-dim)", maxWidth: 520, margin: "20px auto 0" }}>
        El enlace está roto o el juego ya no existe. Vuelve a la biblioteca para elegir otro.
      </p>
      <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="btn lg pulse">
          VOLVER AL VAULT
        </Link>
        <Link href="/salon" className="btn ghost lg">
          SALÓN DE LA FAMA
        </Link>
      </div>
    </section>
  );
}
