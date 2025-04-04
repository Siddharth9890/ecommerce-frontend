import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { API_URL, USER_ID } from "../App";
import { Cart } from "../types";

interface CartPageProps {
  updateCartCount: (count: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ updateCartCount }) => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [discountCode, setDiscountCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<any>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCart = async (): Promise<void> => {
      try {
        const response = await axios.get(`${API_URL}/cart/${USER_ID}`);
        setCart(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setLoading(false);
        setSnackbar({
          open: true,
          message: "Error loading cart",
          severity: "error",
        });
      }
    };

    fetchCart();
  }, []);

  const updateQuantity = async (
    productId: number,
    quantity: number
  ): Promise<void> => {
    try {
      const response = await axios.post(`${API_URL}/cart/${USER_ID}/update`, {
        productId,
        quantity,
      });
      setCart(response.data);

      const itemCount = response.data.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      updateCartCount(itemCount);
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      setSnackbar({
        open: true,
        message: "Error updating quantity",
        severity: "error",
      });
    }
  };

  const removeItem = async (productId: number): Promise<void> => {
    try {
      const response = await axios.post(`${API_URL}/cart/${USER_ID}/remove`, {
        productId,
      });
      setCart(response.data);

      const itemCount = response.data.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      updateCartCount(itemCount);

      setSnackbar({
        open: true,
        message: "Item removed from cart",
        severity: "success",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      setSnackbar({
        open: true,
        message: "Error removing item",
        severity: "error",
      });
    }
  };

  const applyDiscount = async (): Promise<void> => {
    if (!discountCode) {
      setSnackbar({
        open: true,
        message: "Please enter a discount code",
        severity: "error",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/cart/${USER_ID}/apply-discount`,
        {
          discountCode,
        }
      );
      setCart(response.data);
      setSnackbar({
        open: true,
        message: "Discount applied successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error applying discount:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error applying discount code",
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

  if (loading) {
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
        Your Cart
      </Typography>

      {cart.items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Button variant="contained" component={Link} to="/" sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell component="th" scope="row">
                        {item.name}
                      </TableCell>
                      <TableCell align="center">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Remove />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => removeItem(item.productId)}
                          edge="end"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>

              <List>
                <ListItem>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body1">
                    ${cart.total.toFixed(2)}
                  </Typography>
                </ListItem>

                {cart.discountAmount && (
                  <ListItem>
                    <ListItemText primary="Discount" />
                    <Typography variant="body1" color="error">
                      -${cart.discountAmount.toFixed(2)}
                    </Typography>
                  </ListItem>
                )}

                <Divider sx={{ my: 1 }} />

                <ListItem>
                  <ListItemText
                    primary="Total"
                    primaryTypographyProps={{ fontWeight: "bold" }}
                  />
                  <Typography variant="h6">
                    ${(cart.discountedTotal || cart.total).toFixed(2)}
                  </Typography>
                </ListItem>
              </List>

              <Box display="flex" sx={{ mt: 2, mb: 3 }}>
                <TextField
                  size="small"
                  label="Discount Code"
                  variant="outlined"
                  fullWidth
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button variant="outlined" onClick={applyDiscount}>
                  Apply
                </Button>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                component={Link}
                to="/checkout"
              >
                Proceed to Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

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

export default CartPage;
