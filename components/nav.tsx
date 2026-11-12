"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/components/user-provider";

type Section = "biblioteca" | "salon" | "auth";

function isActive(pathname: string | null, section: Section): boolean {
  if (!pathname) return false;
  if (section === "biblioteca") return pathname === "/" || pathname.startsWith("/juegos");
  return pathname === `/${section}` || pathname.startsWith(`/${section}/`);
}

/** Nav markup. `pathname` is null in the Suspense fallback (no active link). */
export function NavView({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useUser();
  const router = useRouter();
  const close = () => setOpen(false);
  const cls = (s: Section) => (isActive(pathname, s) ? "active" : "");

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close} aria-label="Arcade Vault — inicio">
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={cls("biblioteca")} onClick={close}>Biblioteca</Link>
          <Link href="/salon" className={cls("salon")} onClick={close}>Salón de la Fama</Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={logout}>{user.name} ▾</button>
        ) : (
          <button className="btn auth-btn" onClick={() => router.push("/auth")}>Iniciar Sesión</button>
        )}
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú" aria-expanded={open}>≡</button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close}></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")} inert={!open}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>MENÚ</div>
        <Link href="/" className={cls("biblioteca")} onClick={close}>Biblioteca</Link>
        <Link href="/salon" className={cls("salon")} onClick={close}>Salón de la Fama</Link>
        <Link href="/auth" className={cls("auth")} onClick={close}>{user ? "Cuenta" : "Iniciar Sesión"}</Link>
        <div style={{ flex: 1 }}></div>
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>CRÉDITOS · 03</div>
      </aside>
    </>
  );
}

export function Nav() {
  const pathname = usePathname();
  return <NavView pathname={pathname} />;
}
