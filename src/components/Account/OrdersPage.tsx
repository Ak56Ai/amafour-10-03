import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { OrderData } from '../../types/order';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    console.log('[Orders] Fetching orders for user:', user?.id);
    
    try {
      setLoading(true);
      setError(null);

      // Get user profile first
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user?.id)
        .single();

      if (profileError) {
        console.error('[Orders] Error fetching user profile:', profileError);
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }

      if (!profile) {
        console.error('[Orders] No user profile found');
        throw new Error('User profile not found');
      }

      console.log('[Orders] User profile found:', profile.id);

      // Fetch orders with related data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            variant:product_variants (
              id,
              weight,
              weight_unit,
              product:products (
                name,
                images:product_images (image_url)
              )
            )
          ),
          address:user_addresses (
            id,
            label,
            address_line1,
            address_line2,
            city,
            state,
            country,
            pincode
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('[Orders] Error fetching orders:', ordersError);
        throw new Error(`Failed to fetch orders: ${ordersError.message}`);
      }

      console.log('[Orders] Orders fetched successfully:', ordersData?.length || 0, 'orders');
      setOrders(ordersData || []);
    } catch (err: any) {
      console.error('[Orders] Error in fetchOrders:', err);
      setError(err.message || 'Failed to load orders');
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
    return `RM${order.id.slice(0, 8).toUpperCase()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">
            {orders.length === 0 ? 'No orders found' : `${orders.length} order${orders.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Order #{formatOrderNumber(order)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                        {getStatusIcon(order.order_status)}
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Items ({order.order_items.length})</h4>
                    <div className="space-y-3">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={
                              item.variant?.product?.images?.[0]?.image_url || 
                              'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=100'
                            }
                            alt={item.variant?.product?.name || 'Product'}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=100';
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {item.variant?.product?.name || 'Product'}
                            </p>
                            {item.variant && (
                              <p className="text-xs text-gray-600">
                                {item.variant.weight} {item.variant.weight_unit} × {item.quantity}
                              </p>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <p className="text-sm text-gray-600">
                          +{order.order_items.length - 3} more item{order.order_items.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {order.payment_status}
                    </p>
                  </div>
                  {order.razorpay_payment_id && (
                    <div>
                      <p className="text-gray-600">Payment ID</p>
                      <p className="font-mono text-xs text-gray-900">
                        {order.razorpay_payment_id}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/order-success/${order.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Link>
                  {order.order_status === 'delivered' && (
                    <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm">
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">When you place your first order, it will appear here.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;