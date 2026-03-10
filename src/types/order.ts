export interface OrderData {
  id: string;
  user_id: string;
  address_id: string;
  total_amount: number;
  shipping_cost: number;
  payment_method: string;
  shipping_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  order_number?: string;
  created_at: string;
  order_items?: OrderItem[];
  address?: OrderAddress;
}

export interface CreateOrderData {
  user_id: string;
  address_id: string;
  total_amount: number;
  shipping_cost: number;
  payment_method: string;
  shipping_method?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  variant?: {
    id: string;
    weight: number;
    weight_unit: string;
    product: {
      name: string;
      images: Array<{ image_url: string }>;
    };
  };
}

export interface OrderAddress {
  id: string;
  label: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface UpdateOrderPaymentData {
  payment_status: 'pending' | 'completed' | 'failed';
  order_status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  asin: string;
  quantity: number;
  price_at_time: number;
  product_name: string;
  product_image: string;
  variant_weight: number;
  variant_weight_unit: string;
  created_at: string;
}

export interface AddToCartData {
  price: number;
  name: string;
  image: string;
  weight: number;
  weightUnit: string;
}