import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://attentionlab.ai";
const SITE_TITLE = "Attention Labs — Making Humans Intelligent with AI";
const SITE_DESCRIPTION =
  "Attention Labs builds AI to discover drug therapies for the brain. Home of BBB-Nuke, the state-of-the-art platform for designing drugs that cross the blood-brain barrier.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Attention Labs",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Attention Labs",
    "BBB-Nuke",
    "blood-brain barrier",
    "CNS drug discovery",
    "AI drug discovery",
    "ADHD",
    "ATTN001",
    "neuroscience AI",
  ],
  authors: [{ name: "Attention Labs" }],
  creator: "Attention Labs",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Attention Labs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Attention Labs — Making Humans Intelligent with AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: "@attentionlabsAI",
    creator: "@attentionlabsAI",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-[#0a0a0a]">
        {children}
      </body>
    </html>
  );
}
