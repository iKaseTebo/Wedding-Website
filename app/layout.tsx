import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Alegreya_Sans, Yeseva_One } from "next/font/google";
import "./globals.css";

const display = Yeseva_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
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
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
