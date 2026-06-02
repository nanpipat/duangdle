import type { Metadata } from "next";
import { Itim, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const itim = Itim({
  variable: "--font-itim",
  subsets: ["latin", "thai"],
  weight: "400",
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "เซียมซีรายวัน",
  description: "เขย่าเซียมซีเพื่อรับดวงประจำวันที่ล็อกไว้หนึ่งใบต่อวัน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${itim.variable} ${notoThai.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
