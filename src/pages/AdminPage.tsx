import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { AdminStats } from "../types";
import { API_URL } from "../App";

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [adminKey, setAdminKey] = useState<string>("");
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<any>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAuthentication = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/admin/stats`, {
        params: { adminKey },
      });

      setStats(response.data);
      setAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error("Authentication failed:", error);
      setSnackbar({
        open: true,
        message: "Authentication failed. Invalid admin key.",
        severity: "error",
      });
      setLoading(false);
    }
  };

  const generateDiscountCode = async (): Promise<void> => {
    try {
      const response = await axios.post(`${API_URL}/admin/generate-discount`, {
        adminKey,
      });

      setSnackbar({
        open: true,
        message: `New discount code generated: ${response.data.discountCode}`,
        severity: "success",
      });

      const statsResponse = await axios.get(`${API_URL}/admin/stats`, {
        params: { adminKey },
      });

      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error generating discount code:", error);
      setSnackbar({
        open: true,
        message: "Error generating discount code",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (): void => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  if (!authenticated) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 8 }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Admin Login
          </Typography>

          <form onSubmit={handleAuthentication}>
            <TextField
              fullWidth
              margin="normal"
              label="Admin Key"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Admin Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={generateDiscountCode}
          startIcon={<Add />}
        >
          Generate Discount Code
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h3" component="div">
              {stats.totalOrders}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Items Purchased
            </Typography>
            <Typography variant="h3" component="div">
              {stats.itemsPurchased}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h3" component="div">
              ${stats.totalPurchaseAmount.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Discounts
            </Typography>
            <Typography variant="h3" component="div">
              ${stats.totalDiscountAmount.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Discount Codes
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Generated At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.discountCodes.map((code) => (
                  <TableRow key={code.code}>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {code.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{code.discount}%</TableCell>
                    <TableCell>
                      <Chip
                        label={code.used ? "Used" : "Available"}
                        color={code.used ? "default" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(code.generatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPage;
