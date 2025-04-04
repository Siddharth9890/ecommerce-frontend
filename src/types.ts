export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discountCode?: string;
  discountAmount?: number;
  discountedTotal?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  discountCode?: string;
  discountAmount?: number;
  discountedTotal?: number;
  shippingAddress: ShippingAddress;
  paymentInfo: {
    cardNumber: string;
  };
  timestamp: string;
  status: string;
}

export interface OrderResponse {
  order: Order;
  newDiscountCode?: string;
}

export interface DiscountCode {
  code: string;
  used: boolean;
  discount: number;
  generatedAt: string;
}

export interface AdminStats {
  itemsPurchased: number;
  totalPurchaseAmount: number;
  discountCodes: DiscountCode[];
  totalDiscountAmount: number;
  totalOrders: number;
}
