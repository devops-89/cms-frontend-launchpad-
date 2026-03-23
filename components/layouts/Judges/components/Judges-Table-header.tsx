import React from "react";
import { TableHead, TableRow, TableCell, Checkbox, Box, Typography } from "@mui/material";
import { JUDGES_TABLE_HEADER } from "@/utils/constant";

interface JudgesTableHeaderProps {
  colors: Record<string, string>;
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
}

const JudgesTableHeader: React.FC<JudgesTableHeaderProps> = ({
  colors,
  selectedCount,
  totalCount,
  onSelectAll,
}) => {
  return (
    <TableHead>
      <TableRow sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
        <TableCell padding="checkbox">
          <Checkbox
            size="small"
            indeterminate={selectedCount > 0 && selectedCount < totalCount}
            checked={totalCount > 0 && selectedCount === totalCount}
            onChange={(e) => onSelectAll(e.target.checked)}
          />
        </TableCell>
        {JUDGES_TABLE_HEADER.map((h, i) => (
          <TableCell
            key={h}
            align={i === JUDGES_TABLE_HEADER.length - 1 ? "right" : "left"}
            sx={{
              color: colors.TEXT_PRIMARY,
              fontWeight: 700,
              fontSize: "0.8rem",
              borderBottom: `1px solid ${colors.BORDER}`,
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {h}
              {h === "Name" && (
                <Typography
                  variant="caption"
                  sx={{ color: colors.TEXT_SECONDARY, fontSize: 16 }}
                >
                  ↑
                </Typography>
              )}
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default JudgesTableHeader;
