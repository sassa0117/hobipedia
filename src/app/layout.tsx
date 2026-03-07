import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Hobipedia - ホビーコレクターWiki",
  description:
    "アニメグッズ・一番くじの相場データベース&コレクション管理。DiscogsのようなホビーコレクターのためのWiki。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
