import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapPalette — Instant Color Palettes from Images",
  description:
    "Drop an image to extract dominant colors instantly. Get hex, RGB, HSL codes. Export as CSS, Tailwind, SCSS, or JSON. All client-side, no backend.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
