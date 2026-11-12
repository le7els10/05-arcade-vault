import type { Metadata } from "next";
import { Courier_Prime, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Nav, NavView } from "@/components/nav";
import { UserProvider } from "@/components/user-provider";
import "./globals.css";

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Arcade Vault · Portal Retro", template: "%s · Arcade Vault" },
  description: "Juega clásicos arcade y compite por la puntuación más alta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${pressStart.variable} ${jetbrainsMono.variable} ${courierPrime.variable}`}
    >
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) inject attributes into <body> before hydration */}
      <body suppressHydrationWarning>
        <div className="av-bg" aria-hidden="true" />
        <div className="av-noise" aria-hidden="true" />
        <UserProvider>
          <div className="av-root">
            {/* usePathname suspends on dynamic params not covered by generateStaticParams */}
            <Suspense fallback={<NavView pathname={null} />}>
              <Nav />
            </Suspense>
            <main className="av-main">{children}</main>
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
