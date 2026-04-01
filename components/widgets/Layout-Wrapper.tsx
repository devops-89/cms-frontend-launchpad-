"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import LayoutProvider from "./Layout-Provider";
import Modal from "./Modal";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const pathname = usePathname();
  
  // Define paths where Sidebar and Header should be hidden
  const hideLayoutPaths = ["/"];
  const isLoginPage = hideLayoutPaths.includes(pathname);

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
      <Sidebar />
      <Header />
      <Modal />
      <LayoutProvider>{children}</LayoutProvider>
    </>
  );
};

export default LayoutWrapper;
