import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Badge,
  Button,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ProductsPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";

export const USER_ID = "user-123";
export const API_URL = "http://localhost:5000/api";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

const App: React.FC = () => {
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const fetchCartCount = async (): Promise<void> => {
      try {
        const response = await axios.get(`${API_URL}/cart/${USER_ID}`);
        const itemCount =
          response.data.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          ) || 0;
        setCartCount(itemCount);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();
  }, []);

  const updateCartCount = (count: number): void => {
    setCartCount(count);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ flexGrow: 1, textDecoration: "none", color: "white" }}
            >
              ShopEasy
            </Typography>

            <Button color="inherit" component={Link} to="/admin">
              Admin
            </Button>

            <IconButton color="inherit" component={Link} to="/cart">
              <Badge badgeContent={cartCount} color="secondary">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route
              path="/"
              element={<ProductsPage updateCartCount={updateCartCount} />}
            />
            <Route
              path="/cart"
              element={<CartPage updateCartCount={updateCartCount} />}
            />
            <Route
              path="/checkout"
              element={<CheckoutPage updateCartCount={updateCartCount} />}
            />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
