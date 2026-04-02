import "./globals.css";

export const metadata = {
  title: "News Hub",
  description:
    "RSSニュースを取得、要約、保存、検索できるApple HIGベースのニュースワークスペース"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
