import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aniimo Brasil",
    template: "%s | Aniimo Brasil",
  },
  description:
    "Portal brasileiro de informações, ferramentas e comunidade sobre Aniimo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
