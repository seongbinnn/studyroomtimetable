import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모여, 스터디 | 함께 맞추는 가능 시간",
  description: "그룹 스터디룸 시간을 쉽고 빠르게 맞춰보세요.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
