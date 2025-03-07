import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import AuthProvider from "@/components/authProvider";
import { Navbar } from "@/components/navbar";
import { poppins } from "@/config/fonts";
import { siteConfig } from "@/config/site";



export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          `${poppins.className}`,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        <AuthProvider>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
            {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <span>Made with ❤️.{" "} {new Date().getFullYear()}</span>
            </footer>
          </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
