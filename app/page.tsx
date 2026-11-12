import type { Metadata } from "next";
import { HomeLanding } from "@/components/home-landing";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function Home() {
  return <HomeLanding />;
}
