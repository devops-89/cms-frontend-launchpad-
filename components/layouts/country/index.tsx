"use client";
import React, { useState } from "react";
import {
  Box,
  Card,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CountryController } from "@/api/countryControllers";
import { COUNTRY_TABLE_HEADER } from "@/utils/constant";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import CountryModal from "@/components/widgets/modals/Country-Modal";
import { useSnackbar } from "@/context/SnackbarContext";

const getStatusStyles = (isActive: boolean) => {
  if (isActive) {
    return { bgcolor: "#dcfce7", color: "#166534" }; // Active
  }
  return { bgcolor: "#fee2e2", color: "#991b1b" }; // Inactive
};

const CountryTable = () => {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<number | null>(null);
  
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState<{ country: any, newValue: boolean } | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: countriesData, isPending } = useQuery({
    queryKey: ["countries"],
    queryFn: CountryController.getAllCountries,
  });

  const countries = countriesData?.data || [];

  const createMutation = useMutation({
    mutationFn: CountryController.createCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      handleCloseModal();
      showSnackbar("Country added successfully", "success");
    },
    onError: (error: any) => {
      showSnackbar(error?.response?.data?.message || "Failed to add country", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: any }) =>
      CountryController.updateCountry(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      handleCloseModal();
      showSnackbar("Country updated successfully", "success");
    },
    onError: (error: any) => {
      showSnackbar(error?.response?.data?.message || "Failed to update country", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: CountryController.deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      closeDeleteModal();
      showSnackbar("Country deleted successfully", "success");
    },
    onError: (error: any) => {
      showSnackbar(error?.response?.data?.message || "Failed to delete country", "error");
    },
  });

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCountryToDelete(null);
  };

  const handleOpenModal = (country?: any) => {
    if (country) {
      setEditingCountry(country);
    } else {
      setEditingCountry(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCountry(null);
  };

  const handleSubmit = (values: any) => {
    const payload = {
      name: values.name,
      code: values.code,
      phoneCode: values.phoneCode,
      currencyCode: values.currencyCode,
      isActive: values.isActive,
    };
    if (editingCountry) {
      updateMutation.mutate({ id: editingCountry.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClick = (id: number) => {
    setCountryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (countryToDelete !== null) {
      deleteMutation.mutate(countryToDelete);
    }
  };

  const handleStatusChangeClick = (country: any, newValue: boolean) => {
    if (country.isActive === newValue) return;
    setStatusChangeData({ country, newValue });
    setStatusConfirmOpen(true);
  };

  const closeStatusConfirm = () => {
    setStatusConfirmOpen(false);
    setStatusChangeData(null);
  };

  const confirmStatusChange = () => {
    if (statusChangeData) {
      const { country, newValue } = statusChangeData;
      const payload = {
        name: country.name,
        code: country.code,
        phoneCode: country.phoneCode,
        currencyCode: country.currencyCode,
        isActive: newValue,
      };
      updateMutation.mutate({ id: country.id, payload });
      closeStatusConfirm();
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedCountries = [...countries].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const paginatedCountries = sortedCountries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 1 }}>
      <Breadcrumb
        title="Country Management"
        data={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Country Management", href: "/country-management" },
        ]}
      />

      <Card sx={{ mt: 2, border: "1px solid #eeeeee", p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Country List</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
          >
            Add Country
          </Button>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {COUNTRY_TABLE_HEADER.map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : countries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No countries found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCountries.map((country: any) => (
                  <TableRow key={country.id}>
                    <TableCell>{country.name}</TableCell>
                    <TableCell>{country.code}</TableCell>
                    <TableCell>{country.phoneCode}</TableCell>
                    <TableCell>{country.currencyCode}</TableCell>
                    <TableCell>
                      <Select
                        value={country.isActive ? "true" : "false"}
                        size="small"
                        onChange={(e) => handleStatusChangeClick(country, e.target.value === "true")}
                        variant="standard"
                        disableUnderline
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          width: "90px",
                          "& .MuiSelect-select": {
                            py: 0.5,
                            px: 1,
                            justifyContent: "center",
                            borderRadius: "6px",
                            bgcolor: getStatusStyles(country.isActive).bgcolor,
                            color: getStatusStyles(country.isActive).color,
                            display: "flex",
                            alignItems: "center",
                          },
                          "& .MuiSvgIcon-root": {
                            color: getStatusStyles(country.isActive).color,
                          },
                        }}
                      >
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Inactive</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenModal(country)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(country.id)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={countries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <CountryModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialValues={editingCountry}
        isEdit={!!editingCountry}
      />

      <Dialog open={deleteModalOpen} onClose={closeDeleteModal}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this country? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusConfirmOpen} onClose={closeStatusConfirm}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status of <strong>{statusChangeData?.country?.name}</strong> to <strong>{statusChangeData?.newValue ? "Active" : "Inactive"}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusConfirm} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CountryTable;
