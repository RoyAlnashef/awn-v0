import type { Metadata } from "next";
import { Figtree, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "A Wright Network",
  description:
    "The private, invite-only professional network for touring live entertainment crew.",
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
      className={cn("bg-background", "font-sans", figtree.variable, merriweatherHeading.variable)}
    >
      <body className="antialiased">
        <ThemeProvider defaultTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
