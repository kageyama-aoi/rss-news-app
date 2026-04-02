import { Noto_Sans_JP } from "next/font/google";

import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans-jp"
});

export const metadata = {
  title: "News Hub",
  description:
    "RSSニュースを取得、要約、保存、検索できるApple HIGベースのニュースワークスペース"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={notoSansJp.variable}>
      <body>{children}</body>
    </html>
  );
}
