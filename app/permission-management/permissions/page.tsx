"use client";

import React from "react";
import PermissionManagement from "@/components/layouts/user/components/Permission-Management";
import { ProtectedRoute } from "@/components/widgets/ProtectedRoute";

const PermissionsPage = () => {
  return (
    <ProtectedRoute moduleName="Roles & Permissions">
      <PermissionManagement />
    </ProtectedRoute>
  );
};

export default PermissionsPage;
