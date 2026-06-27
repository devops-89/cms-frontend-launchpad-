import React, { Suspense } from "react";
import ViewUserDetails from "@/components/layouts/contests/components/View-User-Details";

const ViewUser = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewUserDetails />
    </Suspense>
  );
};

export default ViewUser;
