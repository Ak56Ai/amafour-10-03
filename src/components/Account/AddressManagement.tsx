import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, MapPin, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AddressForm from './AddressForm';

interface Address {
  id: string;
  label: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  is_default: boolean;
}

const AddressManagement: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserAndAddresses();
    }
  }, [user]);

  const fetchUserAndAddresses = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user?.id)
        .single();

      setUserProfile(profile);

      if (profile) {
        // Get addresses
        const { data: addressesData, error } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', profile.id)
          .order('is_default', { ascending: false });

        if (error) {
          console.error('Error fetching addresses:', error);
        } else {
          setAddresses(addressesData || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (addressData: any) => {
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .insert([{ ...addressData, user_id: userProfile.id }]);

      if (error) {
        console.error('Error adding address:', error);
        return;
      }

      setShowAddForm(false);
      fetchUserAndAddresses();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateAddress = async (addressId: string, addressData: any) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .update(addressData)
        .eq('id', addressId);

      if (error) {
        console.error('Error updating address:', error);
        return;
      }

      setEditingAddress(null);
      fetchUserAndAddresses();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('Error deleting address:', error);
        return;
      }

      fetchUserAndAddresses();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!userProfile) return;

    try {
      // First, set all addresses as non-default
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userProfile.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) {
        console.error('Error setting default address:', error);
        return;
      }

      fetchUserAndAddresses();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Addresses</h1>
          <p className="text-gray-600">Manage your shipping addresses</p>
        </div>

        {/* Add Address Button */}
        {!showAddForm && !editingAddress && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-6 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Address
          </button>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Address</h2>
            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Edit Address Form */}
        {editingAddress && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Address</h2>
            <AddressForm
              initialData={editingAddress}
              onSubmit={(data) => handleUpdateAddress(editingAddress.id, data)}
              onCancel={() => setEditingAddress(null)}
            />
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                  address.is_default ? 'border-orange-200' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{address.label}</span>
                        {address.is_default && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            <Check className="h-3 w-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-gray-700 space-y-1">
                        <p>{address.address_line1}</p>
                        {address.address_line2 && <p>{address.address_line2}</p>}
                        <p>
                          {address.city}, {address.state} {address.pincode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Set as default
                      </button>
                    )}
                    <button
                      onClick={() => setEditingAddress(address)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
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
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
              <p className="text-gray-600 mb-6">Add your first address to start shopping</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManagement;