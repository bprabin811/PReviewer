import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import AuthProvider from "@/components/authProvider";
import { Navbar } from "@/components/navbar";
import { poppins } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { Footer } from "@/components/footer";



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
            <main className="container mx-auto max-w-7xl pt-4 px-6 flex-grow">
            {children}
            </main>
            <Footer/>
          </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
