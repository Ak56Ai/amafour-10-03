import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar } from 'lucide-react';
import { OrderService } from '../services/orderService';
import { OrderData } from '../types/order';


const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[OrderSuccess] Component mounted with orderId:', orderId);
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    console.log('[OrderSuccess] Fetching order details for:', orderId);
    
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const orderData = await OrderService.getOrder(orderId!);
      
      console.log('[OrderSuccess] Order data received:', orderData);
      setOrder(orderData);
      setError(null);
    } catch (err: any) {
      console.error('[OrderSuccess] Error fetching order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatOrderNumber = (order: OrderData) => {
    // Use Razorpay order ID if available, otherwise use our order ID
    if (order.razorpay_order_id) {
      return order.razorpay_order_id;
    }
    if (order.order_number) {
      return order.order_number;
    }
    return `RM${order.id.slice(0, 8).toUpperCase()}`;
  };

  const formatOrderNumberOld = (order: OrderData) => {
    // Use Razorpay order ID if available, otherwise use our order ID
    if (order.razorpay_order_id) {
      return order.razorpay_order_id;
    }
    return `RM${order.id.slice(0, 8).toUpperCase()}`;
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error Loading Order' : 'Order not found'}
          </h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <Link to="/" className="text-orange-600 hover:text-orange-700">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            order.order_status === 'failed' ? 'bg-red-100' : 'bg-green-100'
          }`}>
            <CheckCircle className={`h-8 w-8 ${
              order.order_status === 'failed' ? 'text-red-600' : 'text-green-600'
            }`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {order.order_status === 'failed' ? 'Order Failed' : 'Order Placed Successfully!'}
          </h1>
          <p className="text-gray-600">
            {order.order_status === 'failed' 
              ? 'There was an issue with your order. Please contact support.'
              : 'Thank you for your purchase. Your order has been confirmed.'
            }
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
              <p className="text-gray-600">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Total</h3>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
              <p className="text-gray-600 capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.order_status)}`}>
                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Date</h3>
              <p className="text-gray-600">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          {order.razorpay_payment_id && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-mono text-sm text-gray-900">{order.razorpay_payment_id}</p>
                </div>
                {order.razorpay_order_id && (
                  <div>
                    <p className="text-sm text-gray-600">Razorpay Order ID</p>
                    <p className="font-mono text-sm text-gray-900">{order.razorpay_order_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.order_items && order.order_items.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={
                        item.variant?.product?.images?.[0]?.image_url || 
                        'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=100'
                      }
                      alt={item.variant?.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=100';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.variant?.product?.name || 'Product'}
                      </h4>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          {item.variant.weight} {item.variant.weight_unit} × {item.quantity}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(order.total_amount - order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.address && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="text-gray-700">
                <p>{order.address.address_line1}</p>
                {order.address.address_line2 && <p>{order.address.address_line2}</p>}
                <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
              </div>
            </div>
          )}

          {order.order_status !== 'failed' && (
            <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Processing</p>
                  <p className="text-sm text-gray-600">
                    {order.order_status === 'confirmed' 
                      ? "Your order is confirmed and being prepared for shipment"
                      : "We're preparing your items for shipment"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shipped via Shiprocket</p>
                  <p className="text-sm text-gray-600">Your order will be shipped through our delivery partner</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Estimated Delivery</p>
                  <p className="text-sm text-gray-600">{getEstimatedDelivery()}</p>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {order.order_status !== 'failed' && (
            <Link
              to="/orders"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-center"
            >
              Track Your Order
            </Link>
          )}
          <Link
            to="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          {order.order_status !== 'failed' && (
            <p>You will receive an email confirmation shortly with your order details.</p>
          )}
          <p className="mt-2">
            Need help? <Link to="/contact" className="text-orange-600 hover:text-orange-700">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;