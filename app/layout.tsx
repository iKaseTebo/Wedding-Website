import type { Metadata } from "next";
import localFont from "next/font/local";
import { Alegreya_Sans } from "next/font/google";
import "./globals.css";

const display = localFont({
  src: "../public/Bright-Font.otf",
  variable: "--font-display",
  display: "swap",
});

const body = Alegreya_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Rebecca & Kase | Wedding",
  description: "Retro 70s disco wedding celebration and RSVP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
