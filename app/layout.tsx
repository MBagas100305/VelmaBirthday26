import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Little Celebration for Velma",
  description: "Undangan digital ulang tahun yang hangat, elegan, dan personal."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
