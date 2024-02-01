import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@radix-ui/themes/styles.css";

import { Theme } from "@radix-ui/themes";
import Navbar from "@/components/Navbar/Navbar";

import "./globals.css";
import AuthProvider from "@/components/AuthProvider/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider session={session}>
          <header>
            <Navbar />
          </header>
          <main>
            <Theme>{children}</Theme>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
