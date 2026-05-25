import type { Metadata } from "next";
import ScreeningPage from "./ScreeningPage";

export const metadata: Metadata = {
  title: "1 Billion Compound Screen",
  description:
    "BBB-Nuke screened 1 billion compounds for blood-brain barrier penetration. Explore the chemical space in an interactive 3D map — clustered by scaffold, fingerprint, and data provenance.",
  openGraph: {
    title: "BBB-Nuke: 1 Billion Compound Screen — Attention Labs",
    description:
      "Explore the largest BBB permeability screen ever conducted. Interactive 3D chemical space visualization of 1B compounds scored by BBB-Nuke.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return <ScreeningPage />;
}
