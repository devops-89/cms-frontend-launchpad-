"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionControllers } from "@/api/permissionControllers";
import { usePathname } from "next/navigation";

export interface Permission {
  id: string;
  role_id: string;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface PermissionContextType {
  permissions: Permission[];
  hasPermission: (module: string, action?: 'canView' | 'canCreate' | 'canEdit' | 'canDelete') => boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isAdmin: boolean;
  forceRefresh: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [tokenRole, setTokenRole] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Only load user from localStorage on client side
    const isJudgePanel = window.location.pathname.startsWith('/judge-panel');
    const userStr = isJudgePanel ? localStorage.getItem("judge_user") : localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Failed to parse user for permissions", error);
      }
    } else {
      setUser(null);
    }
    const token = isJudgePanel ? localStorage.getItem("judge_access_token") : localStorage.getItem("token");
    if (token) {
      try {
        const payloadStr = atob(token.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        if (payload.role) {
          setTokenRole(payload.role);
        }
      } catch (error) {
        console.error("Failed to parse token", error);
      }
    } else {
      setTokenRole(null);
    }
    setIsInitializing(false);
  }, [pathname]);

  const forceRefresh = () => {
    setIsInitializing(true);
    // The useEffect will automatically run on the next pathname change (router.push),
    // or we could manually re-run the logic here, but simply setting isInitializing 
    // to true will bring up the FullScreenLoader immediately.
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ["all-permissions"] });
    }
  }, [user, queryClient]);

  const { data: allPermissionsData, isPending } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: permissionControllers.getAllPermissions,
    enabled: !!user, // Only fetch if we have a user
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const permissions: Permission[] = React.useMemo(() => {
    if (!allPermissionsData?.data || !user) return [];
    
    // Filter permissions for the currently logged in user's role
    const userRoleId = user.role_id || user.roleEntity?.id;
    if (!userRoleId) return []; 

    return allPermissionsData.data.filter((p: any) => p.role_id === userRoleId);
  }, [allPermissionsData, user]);

  const hasPermission = (moduleName: string, action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' = 'canView'): boolean => {
    const effectiveRole = user?.role || tokenRole || user?.roleEntity?.name;
    
    // Admin bypass: if role is admin, they have access to EVERYTHING.
    if (effectiveRole?.toLowerCase() === "admin") return true;

    // Judge bypass (temporary if needed)
    if (effectiveRole?.toUpperCase() === "JUDGE") return true;

    // Find the permission object for the requested module
    const perm = permissions.find(p => p.module === moduleName);
    
    if (!perm) return false;
    return !!perm[action];
  };

  const effectiveRole = user?.role || tokenRole || user?.roleEntity?.name;
  const isAdmin = effectiveRole?.toUpperCase() === "ADMIN";

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, isLoading: isPending && !!user, isInitializing, isAdmin, forceRefresh }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};
