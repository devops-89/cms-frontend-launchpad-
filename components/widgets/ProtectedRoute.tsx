"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/context/PermissionContext";
import { Box, Typography } from "@mui/material";
import FullScreenLoader from "@/components/widgets/FullScreenLoader";

export const ProtectedRoute = ({ children, moduleName }: { children: React.ReactNode, moduleName: string }) => {
  const { hasPermission, isLoading, isAdmin } = usePermissions();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAdmin) {
        setHasAccess(true);
      } else {
        setHasAccess(hasPermission(moduleName, "canView"));
      }
      setIsReady(true);
    }
  }, [isLoading, isAdmin, hasPermission, moduleName]);

  if (isLoading || !isReady) {
    return <FullScreenLoader open={true} message="Checking Permissions..." />;
  }

  if (!hasAccess) {
    return (
      <Box sx={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" color="error" fontWeight="bold">
          403 Forbidden
        </Typography>
        <Typography variant="body1">
          You do not have permission to view the {moduleName} module.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};
