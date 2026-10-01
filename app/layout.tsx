import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { DM_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CapacitorNativeRoot } from "@/components/capacitor-native-root";
import { ErrorReporter } from "@/components/error-reporter";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CAPACITOR_SAFE_AREA_BOOT_SCRIPT } from "@/lib/capacitor/safe-area-boot-script";
import { cn } from "@/lib/utils";

const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "A Wright Network",
  description:
    "The private, invite-only professional network for live entertainment crew.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "bg-background",
        "font-sans",
        satoshi.variable,
        dmMono.variable,
      )}
    >
      <head>
        <Script
          id="capacitor-safe-area-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: CAPACITOR_SAFE_AREA_BOOT_SCRIPT }}
        />
      </head>
      <body className="antialiased">
        <Suspense fallback={null}>
          <CapacitorNativeRoot />
        </Suspense>
        <ThemeProvider defaultTheme="dark">
          {children}
          <ErrorReporter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
