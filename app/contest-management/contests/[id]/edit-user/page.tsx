import React, { Suspense } from "react";
import EditUserForm from "@/components/layouts/contests/components/Edit-User-Form";

const EditUser = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditUserForm />
    </Suspense>
  );
};

export default EditUser;
