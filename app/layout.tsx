import type { Metadata, Viewport } from "next";
import { DM_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CapacitorNativeRoot } from "@/components/capacitor-native-root";
import { ErrorReporter } from "@/components/error-reporter";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{function sync(){var c=window.Capacitor;if(!c||!c.isNativePlatform||!c.isNativePlatform())return;document.documentElement.classList.add("capacitor-native");var ios=c.getPlatform&&c.getPlatform()==="ios";function m(p){var d=document.createElement("div");d.style.cssText="position:fixed;visibility:hidden;"+p;document.documentElement.appendChild(d);var s=getComputedStyle(d);var v=p.indexOf("padding-top")===0?parseFloat(s.paddingTop)||0:parseFloat(s.paddingBottom)||0;d.remove();return v;}var top=m("padding-top:env(safe-area-inset-top,0px)");var bottom=m("padding-bottom:env(safe-area-inset-bottom,0px)");if(ios){if(top===0)top=47;if(bottom===0)bottom=34;}document.documentElement.style.setProperty("--site-header-inset-top",top+"px");document.documentElement.style.setProperty("--safe-area-inset-bottom",bottom+"px");}sync();document.addEventListener("DOMContentLoaded",sync);setTimeout(sync,0);setTimeout(sync,100);}catch(e){}})();`,
          }}
        />
        <CapacitorNativeRoot />
        <ThemeProvider defaultTheme="dark">
          {children}
          <ErrorReporter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
