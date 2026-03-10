import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Package, CreditCard, Settings, HelpCircle, Heart, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const AccountDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profiles } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user?.id)
        .limit(1);

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;
      setUserProfile(profile);

      // Fetch recent orders (mock data for now)
      // const { data: orders } = await supabase
      //   .from('orders')
      //   .select('*')
      //   .eq('user_id', profile?.id)
      //   .order('created_at', { ascending: false })
      //   .limit(3);

      // setRecentOrders(orders || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Account
          </h1>
          <p className="text-gray-600">
            Welcome back, {userProfile?.first_name || 'User'}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/orders"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <Package className="h-8 w-8 text-orange-500 group-hover:text-orange-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Orders</h3>
                    <p className="text-sm text-gray-600">Track, return, or buy things again</p>
                  </div>
                </Link>

                <Link
                  to="/addresses"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <MapPin className="h-8 w-8 text-orange-500 group-hover:text-orange-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Addresses</h3>
                    <p className="text-sm text-gray-600">Edit addresses for orders and gifts</p>
                  </div>
                </Link>

                <Link
                  to="/account/payment-methods"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <CreditCard className="h-8 w-8 text-orange-500 group-hover:text-orange-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                    <p className="text-sm text-gray-600">Manage your payment options</p>
                  </div>
                </Link>

                <Link
                  to="/account/profile"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <User className="h-8 w-8 text-orange-500 group-hover:text-orange-600 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Account Settings</h3>
                    <p className="text-sm text-gray-600">Change your name, email & password</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <Link to="/orders" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  View all orders
                </Link>
              </div>
              
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Order #{order.razorpay_order_id || order.order_number || order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(order.total_amount)}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.order_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            order.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.order_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">When you place your first order, it will appear here.</p>
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">More Ways to Shop</h3>
              <div className="space-y-3">
                <Link
                  to="/wishlist"
                  className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <Heart className="h-5 w-5 mr-3" />
                  Your Wish List
                </Link>
                <Link
                  to="/recommendations"
                  className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <Star className="h-5 w-5 mr-3" />
                  Recommended for you
                </Link>
                <Link
                  to="/browsing-history"
                  className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Your browsing history
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Link
                  to="/help"
                  className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <HelpCircle className="h-5 w-5 mr-3" />
                  Help Center
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <User className="h-5 w-5 mr-3" />
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;