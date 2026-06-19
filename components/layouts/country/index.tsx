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
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CountryController } from "@/api/countryControllers";
import { COUNTRY_TABLE_HEADER } from "@/utils/constant";
import Breadcrumb from "@/components/widgets/Breadcrumb";
import CountryModal from "@/components/widgets/modals/Country-Modal";
import { useSnackbar } from "@/context/SnackbarContext";

const CountryTable = () => {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<number | null>(null);

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
                countries.map((country: any) => (
                  <TableRow key={country.id}>
                    <TableCell>{country.name}</TableCell>
                    <TableCell>{country.code}</TableCell>
                    <TableCell>{country.phoneCode}</TableCell>
                    <TableCell>{country.currencyCode}</TableCell>
                    <TableCell>{country.isActive ? "Active" : "Inactive"}</TableCell>
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
    </Box>
  );
};

export default CountryTable;
