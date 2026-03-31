export const metadata = {
  title: "RSS News App",
  description: "複数のRSSニュースを取得して表示するアプリ"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
