import type { Metadata } from "next";
import { science_gothic } from "@/utils/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMS Launchpad",
  description: "Modern Content Management System",
};

import { ThemeContextProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={science_gothic.variable}>
      <body>
        <ThemeContextProvider>{children}</ThemeContextProvider>
      </body>
    </html>
  );
}
