import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PaymentMethod {
  id: string;
  method_type: string;
  provider: string;
  last_four: string;
  is_default: boolean;
  created_at: string;
}

const PaymentMethods: React.FC = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserAndPaymentMethods();
    }
  }, [user]);

  const fetchUserAndPaymentMethods = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user?.id)
        .single();

      setUserProfile(profile);

      if (profile) {
        // Get payment methods
        const { data: methods, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', profile.id)
          .order('is_default', { ascending: false });

        if (error) {
          console.error('Error fetching payment methods:', error);
        } else {
          setPaymentMethods(methods || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    if (!userProfile) return;

    try {
      // First, set all methods as non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userProfile.id);

      // Then set the selected method as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId);

      if (error) {
        console.error('Error setting default payment method:', error);
        return;
      }

      fetchUserAndPaymentMethods();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) {
        console.error('Error deleting payment method:', error);
        return;
      }

      fetchUserAndPaymentMethods();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Methods</h1>
          <p className="text-gray-600">Manage your saved payment methods</p>
        </div>

        {/* Add Payment Method Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-6 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Payment Method
          </button>
        )}

        {/* Add Payment Method Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Payment Method</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Payment methods are securely processed during checkout. 
                This section is for display purposes. Actual payment processing is handled by Razorpay.
              </p>
            </div>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                  method.is_default ? 'border-orange-200' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 capitalize">
                          {method.provider} {method.method_type}
                        </span>
                        {method.is_default && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            <Check className="h-3 w-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        •••• •••• •••• {method.last_four}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Set as default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMethod(method.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
              <p className="text-gray-600 mb-6">Add a payment method to make checkout faster</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Payment Method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;