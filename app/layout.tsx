import type { Metadata } from "next";
import { science_gothic } from "@/utils/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ignite Innovation",
  description: "Modern Content Management System",
};

import { ThemeContextProvider } from "@/context/ThemeContext";
import { FormProvider } from "@/context/FormContext";
import { SnackbarProvider } from "@/context/SnackbarContext";
import QueryProvider from "@/context/QueryProvider";
import { PermissionProvider } from "@/context/PermissionContext";
import LayoutWrapper from "@/components/widgets/Layout-Wrapper";

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={science_gothic.variable}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <QueryProvider>
            <ThemeContextProvider>
              <FormProvider>
                <SnackbarProvider>
                  <PermissionProvider>
                    <LayoutWrapper>{children}</LayoutWrapper>
                  </PermissionProvider>
                </SnackbarProvider>
              </FormProvider>
            </ThemeContextProvider>
          </QueryProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
