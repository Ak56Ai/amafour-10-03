import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { OrderService } from '../services/orderService';
import { PaymentService } from '../services/paymentService';
import { OrderAddress } from '../types/order';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string;
}

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<OrderAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<OrderAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    console.log('[Checkout] Component mounted, user:', user?.id, 'cart items:', cartItems.length);
    
    if (!user) {
      console.log('[Checkout] No user found, redirecting to signin');
      navigate('/signin');
      return;
    }

    if (cartItems.length === 0) {
      console.log('[Checkout] No cart items, redirecting to cart');
      navigate('/cart');
      return;
    }

    fetchUserData();
  }, [user, cartItems, navigate]);

  const fetchUserData = async () => {
    console.log('[Checkout] Fetching user data');
    
    try {
      if (!user?.id) return;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, mobile')
        .eq('auth_id', user.id)
        .single();

      if (profileError) {
        console.error('[Checkout] Error fetching user profile:', profileError);
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }

      if (!profile) {
        console.error('[Checkout] No user profile found');
        throw new Error('User profile not found');
      }
      setUserProfile(profile);
      console.log('[Checkout] User profile fetched:', profile);

      // Get addresses
      const { data: addressesData, error: addressError } = await supabase
        .from('user_addresses')
        .select(`
          id,
          label,
          address_line1,
          address_line2,
          city,
          state,
          country,
          pincode,
          is_default
        `)
        .eq('user_id', profile.id)
        .order('is_default', { ascending: false });

      if (addressError) {
        console.error('[Checkout] Error fetching addresses:', addressError);
        throw new Error(`Failed to fetch addresses: ${addressError.message}`);
      }

      const addresses = addressesData || [];
      setAddresses(addresses);
      console.log('[Checkout] Addresses fetched:', addresses);
      
      // Set default address
      const defaultAddress = addresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        console.log('[Checkout] Default address selected:', defaultAddress);
      } else if (addresses.length > 0) {
        setSelectedAddress(addresses[0]);
        console.log('[Checkout] First address selected:', addresses[0]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to load checkout data. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const createOrder = async () => {
    console.log('[Checkout] Creating order');
    
    if (!userProfile || !selectedAddress) return null;

    try {
      const orderId = await OrderService.createOrder({
        user_id: userProfile.id,
        address_id: selectedAddress.id,
        total_amount: total,
        shipping_cost: shipping,
        payment_method: paymentMethod,
        shipping_method: 'standard'
      });

      console.log('[Checkout] Order created with ID:', orderId);
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const addOrderItems = async (orderId: string) => {
    console.log('[Checkout] Adding order items for order:', orderId);
    
    try {
      const orderItems = cartItems.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price_at_time
      }));
      
      await OrderService.addOrderItems(orderId, orderItems);
      console.log('[Checkout] Order items added successfully');
    } catch (error) {
      console.error('[Checkout] Error adding order items:', error);
      throw error;
    }
  };

  const handleRazorpayPayment = async () => {
    console.log('[Checkout] Starting Razorpay payment process');

    if (processingOrder) return;

    try {
      setLoading(true);
      setProcessingOrder(true);

      // 1️⃣ Create order in DB
      const orderId = await createOrder();
      if (!orderId) throw new Error("Order creation failed");

      // 2️⃣ Add items
      await addOrderItems(orderId);

      // 3️⃣ Create Razorpay order
      const { data, error } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            amount: total * 100,
            receipt: orderId
          }
        }
      );

      if (error || !data?.id) {
        throw new Error("Failed to create Razorpay order");
      }

      const razorpayOrderId = data.id;

      // 4️⃣ Save Razorpay order ID
      await supabase
        .from("orders")
        .update({ razorpay_order_id: razorpayOrderId })
        .eq("id", orderId);

      console.log("[Checkout] Razorpay order:", razorpayOrderId);

      // 5️⃣ Open checkout
      await PaymentService.openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        orderId: razorpayOrderId,
        amount: total * 100,
        currency: "INR",

        name: "RegionalMart",
        description: "Order Payment",

        prefill: {
          name: `${userProfile?.first_name} ${userProfile?.last_name}`,
          email: userProfile?.email || "",
          contact: userProfile?.mobile || ""
        },

        onSuccess: async (response) => {
          console.log("[Checkout] Payment success", response);

          if (
            !response?.razorpay_payment_id ||
            !response?.razorpay_order_id ||
            !response?.razorpay_signature
          ) {
            alert("Payment verification failed.");
            return;
          }

          try {
            // Verify payment
            const verify = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: orderId
                }
              }
            );

            if (verify.error) {
              throw new Error("Verification failed");
            }

            // Update order
            await supabase
            .from("orders")
            .update<any>({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_status: "paid",
              order_status: "confirmed"
            })
              .eq("id", orderId)
              .eq("payment_status", "pending");

            await clearCart();

            navigate(`/order-success/${orderId}`);

          } catch (err) {
            console.error("Order update failed", err);
            alert("Payment successful but verification failed.");
          }
        },

        onError: async (error) => {
          console.error("[Checkout] Payment failed:", error);

          try {
            await OrderService.markOrderFailed(orderId);
          } catch (err) {
            console.error("Failed to mark order failed", err);
          }

          alert("Payment failed. Try again.");
        },

        onDismiss: () => {
          console.log("[Checkout] Razorpay closed");
          setProcessingOrder(false);
        }
      });

    } catch (error) {
      console.error("[Checkout] Payment error:", error);
      alert("Payment could not be processed.");
    } finally {
      setLoading(false);
      setProcessingOrder(false);
    }
  };

  const handleCashOnDelivery = async () => {
    console.log('[Checkout] Starting COD order process');
    
    if (processingOrder) {
      console.log('[Checkout] Order already processing, ignoring request');
      return;
    }

    try {
      setLoading(true);
      setProcessingOrder(true);

      const orderId = await createOrder();
      if (!orderId) {
        throw new Error('Failed to create order');
      }

      // Add order items
      await addOrderItems(orderId);

      // Update order for COD
      await OrderService.updateOrderForCOD(orderId);
      console.log('[Checkout] Order updated for COD');

      // Clear cart
      await clearCart();
      console.log('[Checkout] Cart cleared');

      // Small delay to ensure order is updated
      setTimeout(() => {
        // Redirect to success page
        navigate(`/order-success/${orderId}`);
      }, 500);
    } catch (error) {
      console.error('[Checkout] Error placing COD order:', error);
      alert('Something went wrong, but your order may already be placed. Check orders page.');
    } finally {
      setLoading(false);
      setProcessingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    console.log('[Checkout] Place order clicked, payment method:', paymentMethod);
    
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    if (processingOrder) {
      console.log('[Checkout] Order already processing');
      return;
    }
    
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCashOnDelivery();
    }
  };

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress?.id === address.id}
                        onChange={() => setSelectedAddress(address)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">
                            {address.label}
                            {address.is_default && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-gray-700 text-sm">
                            <p>{address.address_line1}</p>
                            {address.address_line2 && <p>{address.address_line2}</p>}
                            <p>{address.city}, {address.state} {address.pincode}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No addresses found</p>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Online Payment</div>
                    <div className="text-sm text-gray-600">Pay securely with Razorpay (Cards, UPI, Net Banking)</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when your order is delivered</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product_image || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{item.product_name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">{formatPrice(item.price_at_time * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="h-6 w-6 text-green-600 mb-1" />
                  <span className="text-xs text-gray-600">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center">
                  <Package className="h-6 w-6 text-blue-600 mb-1" />
                  <span className="text-xs text-gray-600">Fast Delivery</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress || processingOrder}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading || processingOrder ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By placing your order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;