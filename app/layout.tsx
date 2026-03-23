import type { Metadata } from "next";
import { science_gothic } from "@/utils/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMS Launchpad",
  description: "Modern Content Management System",
};

import { ThemeContextProvider } from "@/context/ThemeContext";
import { FormProvider } from "@/context/FormContext";
import LayoutWrapper from "@/components/widgets/Layout-Wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={science_gothic.variable}>
      <body>
        <ThemeContextProvider>
          <FormProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </FormProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
