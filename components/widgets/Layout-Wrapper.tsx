"use client";

import { usePathname } from "next/navigation";
import React from "react";
import Header from "./Header";
import JudgeSidebar from "./JudgeSidebar";
import LayoutProvider from "./Layout-Provider";
import Modal from "./Modal";
import Sidebar from "./Sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const pathname = usePathname();
  
  // Define paths where Sidebar and Header should be hidden
  const hideLayoutPaths = ["/",
                          "/forgot-password",
                          "/reset-password",
                          "/verify-otp",
                          ];
  const isLoginPage = hideLayoutPaths.includes(pathname);
  const isJudgePanel = pathname.startsWith('/judge-panel');

  React.useEffect(() => {
    // Session separation between judge and admin prevents the need to check role here.
    // Auth guard is handled by Header.tsx and specific hooks.
  }, [pathname]);

  if (isLoginPage) {
    return (
      <>
        <Modal />
        <LayoutProvider isFullWidth>{children}</LayoutProvider>
      </>
    );
  }

  return (
    <>
      {isJudgePanel ? <JudgeSidebar /> : <Sidebar />}
      <Header />
      <Modal />
      <LayoutProvider>{children}</LayoutProvider>
    </>
  );
};

export default LayoutWrapper;
