import EditEntryForm from "@/components/layouts/contests/components/Edit-Entry-Form";
import { Suspense } from "react";

const EditEntry = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditEntryForm />
    </Suspense>
  );
};

export default EditEntry;