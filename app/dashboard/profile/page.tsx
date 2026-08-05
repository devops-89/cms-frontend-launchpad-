"use client";

import DashboardLayout from "@/components/layouts/Dashboard";
import { Profile } from "@/components/layouts/Profile";
import { useEffect, useState } from "react";

export default function AdminProfilePage() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token") || "";
    setToken(storedToken);
  }, []);

  return (
    <DashboardLayout>
      <Profile mode="admin" token={token} />
    </DashboardLayout>
  );
}
