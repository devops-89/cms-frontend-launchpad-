import React from "react";
import AddJudgeForm from "./components/Add-judge-form";
import { Box } from "@mui/material";
import Breadcrumb from "@/components/widgets/Breadcrumb";

const AddJudgelayout = () => {
  return (
    <div>
      <Box>
        <Breadcrumb
          title="Add Judge"
          data={[
            {
              title: "Dashboard",
              href: "/dashboard",
            },
            {
              title: "Judges",
              href: "/user-management/judges",
            },
            {
              title: "Add Judge",
              href: "/user-management/judges/add-judge",
            },
          ]}
        />
      </Box>
      <AddJudgeForm />
    </div>
  );
};

export default AddJudgelayout;
