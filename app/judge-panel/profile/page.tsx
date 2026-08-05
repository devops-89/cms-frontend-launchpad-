"use client";

import JudgePanelLayout from "@/components/layouts/JudgePanel";
import { Profile } from "@/components/layouts/Profile";
import { useEffect, useState } from "react";

export default function JudgeProfilePage() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const storedToken = sessionStorage.getItem("judge_access_token") || "";
    setToken(storedToken);
  }, []);

  return (
    <JudgePanelLayout>
      <Profile mode="judge" token={token} />
    </JudgePanelLayout>
  );
}
