import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SplitScene",
  description: "Mobile-first auth workspace",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#534AB7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>

      <body className="h-full w-full bg-[#E8E6F0] font-sans">
        <div className="flex h-dvh w-full items-start justify-center">
          <div className="relative flex h-dvh w-full max-w-(--max-width) flex-col overflow-hidden bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_40px_rgba(0,0,0,0.12)]">
            <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-2">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
