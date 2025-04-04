
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { API_URL, USER_ID } from "../App";
import { Cart, OrderResponse } from "../types";

interface CheckoutPageProps {
  updateCartCount: (count: number) => void;
}

interface CheckoutFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;

  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

const shippingSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  zipCode: yup
    .string()
    .required("ZIP code is required")
    .matches(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
});

const paymentSchema = yup.object().shape({
  cardNumber: yup
    .string()
    .required("Card number is required")
    .matches(/^\d{16}$/, "Card number must be 16 digits"),
  cardExpiry: yup
    .string()
    .required("Expiration date is required")
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format must be MM/YY"),
  cardCvv: yup
    .string()
    .required("CVV is required")
    .matches(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

const checkoutSchema = shippingSchema.concat(paymentSchema);

const CheckoutPage: React.FC<CheckoutPageProps> = ({ updateCartCount }) => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);
  const navigate = useNavigate();

  const steps = ["Shipping Information", "Payment Details", "Review Order"];

  const methods = useForm<CheckoutFormData>({
    resolver: yupResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = methods;

  const getCurrentStepSchema = () => {
    return activeStep === 0 ? shippingSchema : paymentSchema;
  };

  const isCurrentStepValid = () => {
    if (activeStep === 0) {
      const { name, email, address, city, zipCode } = methods.getValues();
      try {
        shippingSchema.validateSync(
          { name, email, address, city, zipCode },
          { abortEarly: false }
        );
        return true;
      } catch (error) {
        return false;
      }
    } else if (activeStep === 1) {
      const { cardNumber, cardExpiry, cardCvv } = methods.getValues();
      try {
        paymentSchema.validateSync(
          { cardNumber, cardExpiry, cardCvv },
          { abortEarly: false }
        );
        return true;
      } catch (error) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const fetchCart = async (): Promise<void> => {
      try {
        const response = await axios.get(`${API_URL}/cart/${USER_ID}`);
        setCart(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleNext = () => {
    if (activeStep === 0) {
      const { name, email, address, city, zipCode } = methods.getValues();
      try {
        shippingSchema.validateSync(
          { name, email, address, city, zipCode },
          { abortEarly: false }
        );
        setActiveStep((prevStep) => prevStep + 1);
      } catch (error) {
        methods.trigger(["name", "email", "address", "city", "zipCode"]);
      }
    } else if (activeStep === 1) {
      const { cardNumber, cardExpiry, cardCvv } = methods.getValues();
      try {
        paymentSchema.validateSync(
          { cardNumber, cardExpiry, cardCvv },
          { abortEarly: false }
        );
        setActiveStep((prevStep) => prevStep + 1);
      } catch (error) {
        methods.trigger(["cardNumber", "cardExpiry", "cardCvv"]);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setProcessingOrder(true);

    try {
      const response = await axios.post(`${API_URL}/checkout/${USER_ID}`, {
        shippingAddress: {
          name: data.name,
          email: data.email,
          address: data.address,
          city: data.city,
          zipCode: data.zipCode,
        },
        paymentInfo: {
          cardNumber: data.cardNumber,
          cardExpiry: data.cardExpiry,
          cardCvv: data.cardCvv,
        },
      });

      setOrderDetails(response.data);
      setOrderCompleted(true);
      setProcessingOrder(false);

      updateCartCount(0);
    } catch (error: any) {
      console.error("Error completing checkout:", error);
      alert(error.response?.data?.error || "Error completing checkout");
      setProcessingOrder(false);
    }
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

  if (cart.items.length === 0 && !orderCompleted) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button variant="contained" component={Link} to="/" sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  if (orderCompleted && orderDetails) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Order Confirmed!
          </Typography>

          <Typography variant="body1" paragraph>
            Thank you for your purchase. Your order has been confirmed.
          </Typography>

          <Box sx={{ mb: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>

            <Typography variant="body1">
              <strong>Order ID:</strong> {orderDetails.order.id}
            </Typography>

            <Typography variant="body1">
              <strong>Total:</strong> $
              {orderDetails.order.discountedTotal
                ? orderDetails.order.discountedTotal.toFixed(2)
                : orderDetails.order.total.toFixed(2)}
            </Typography>

            {orderDetails.order.discountAmount && (
              <Typography variant="body1">
                <strong>Discount Applied:</strong> $
                {orderDetails.order.discountAmount.toFixed(2)}
              </Typography>
            )}
          </Box>

          {orderDetails.newDiscountCode && (
            <Box
              sx={{
                bgcolor: "primary.light",
                color: "primary.contrastText",
                p: 3,
                borderRadius: 1,
                mb: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Congratulations!
              </Typography>

              <Typography variant="body1" paragraph>
                You've received a new discount code for your next purchase:
              </Typography>

              <Chip
                label={orderDetails.newDiscountCode}
                color="secondary"
                sx={{ py: 2, px: 1, fontSize: "1.1rem", fontWeight: "bold" }}
              />

              <Typography variant="body2" sx={{ mt: 2 }}>
                Use this code for 10% off your next order!
              </Typography>
            </Box>
          )}

          <Button variant="contained" component={Link} to="/" sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Shipping Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Full Name"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Email"
                          type="email"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Address"
                          error={!!errors.address}
                          helperText={errors.address?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="City"
                          error={!!errors.city}
                          helperText={errors.city?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="zipCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="ZIP Code"
                          error={!!errors.zipCode}
                          helperText={errors.zipCode?.message}
                          required
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Payment Details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="cardNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Card Number"
                          placeholder="1234567890123456"
                          error={!!errors.cardNumber}
                          helperText={errors.cardNumber?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="cardExpiry"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Expiration Date (MM/YY)"
                          placeholder="MM/YY"
                          error={!!errors.cardExpiry}
                          helperText={errors.cardExpiry?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="cardCvv"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="CVV"
                          placeholder="123"
                          error={!!errors.cardCvv}
                          helperText={errors.cardCvv?.message}
                          required
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ mb: 3 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Shipping Address</strong>
                  </Typography>
                  <Typography variant="body2">
                    {methods.getValues().name}
                    <br />
                    {methods.getValues().address}
                    <br />
                    {methods.getValues().city}, {methods.getValues().zipCode}
                    <br />
                    {methods.getValues().email}
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    <strong>Payment Method</strong>
                  </Typography>
                  <Typography variant="body2">
                    Card ending in {methods.getValues().cardNumber.slice(-4)}
                  </Typography>
                </Paper>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1">Subtotal</Typography>
                  <Typography variant="subtitle1">
                    ${cart.total.toFixed(2)}
                  </Typography>
                </Box>

                {cart.discountAmount && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1">Discount</Typography>
                    <Typography variant="subtitle1" color="error">
                      -${cart.discountAmount.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">
                    ${(cart.discountedTotal || cart.total).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>

              <div>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={processingOrder}
                  >
                    {processingOrder ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!isCurrentStepValid()}
                  >
                    Next
                  </Button>
                )}
              </div>
            </Box>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default CheckoutPage;
