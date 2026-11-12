import type { Metadata } from "next";
import { Suspense } from "react";
import { HallOfFame, HallOfFameFallback } from "@/components/hall-of-fame";

export const metadata: Metadata = {
  title: "Salón de la Fama",
};

export default function SalonPage() {
  // useSearchParams needs a Suspense boundary under cacheComponents
  return (
    <Suspense fallback={<HallOfFameFallback />}>
      <HallOfFame />
    </Suspense>
  );
}
