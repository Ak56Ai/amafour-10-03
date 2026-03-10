import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { CartItem, AddToCartData } from '../types/order';

interface UserProfile {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Cart {
  id: string;
  user_id: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (variantId: string, asin: string, quantity: number, productDetails: AddToCartData) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const getUserProfile = async (): Promise<UserProfile | null> => {
    console.log('[Cart] Getting user profile for user:', user?.id);
    
    if (!user) {
      console.log('[Cart] No user found');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, auth_id, first_name, last_name, email')
        .eq('auth_id', user.id)
        .single();

      if (error) {
        console.error('[Cart] Supabase error fetching user profile:', error);
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      if (!data) {
        console.error('[Cart] No user profile found');
        throw new Error('User profile not found');
      }

      console.log('[Cart] User profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('[Cart] Error in getUserProfile:', error);
      throw error;
    }
  };

  const getOrCreateCart = async (userId: string): Promise<Cart> => {
    console.log('[Cart] Getting or creating cart for user:', userId);
    
    try {
      // Check if user has a cart
      const { data: carts, error: fetchError } = await supabase
        .from('carts')
        .select('id, user_id')
        .eq('user_id', userId)
        .limit(1);

      if (fetchError) {
        console.error('[Cart] Supabase error fetching cart:', fetchError);
        throw new Error(`Failed to fetch cart: ${fetchError.message}`);
      }

      let cart = carts && carts.length > 0 ? carts[0] : null;

      if (!cart) {
        console.log('[Cart] No cart found, creating new cart');
        
        // Create new cart
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert([{ user_id: userId }])
          .select('id, user_id')
          .single();

        if (createError) {
          console.error('[Cart] Supabase error creating cart:', createError);
          throw new Error(`Failed to create cart: ${createError.message}`);
        }

        if (!newCart) {
          console.error('[Cart] No cart returned from insert');
          throw new Error('Failed to create cart: No cart returned');
        }

        cart = newCart;
        console.log('[Cart] New cart created successfully:', cart);
      } else {
        console.log('[Cart] Existing cart found:', cart);
      }

      return cart;
    } catch (error) {
      console.error('[Cart] Error in getOrCreateCart:', error);
      throw error;
    }
  };

  const refreshCart = async (): Promise<void> => {
    console.log('[Cart] Refreshing cart');
    
    if (!user) {
      console.log('[Cart] No user, skipping cart refresh');
      return;
    }

    try {
      setLoading(true);
      
      const profile = await getUserProfile();
      if (!profile) {
        console.log('[Cart] No profile found, clearing cart items');
        setCartItems([]);
        return;
      }

      const cart = await getOrCreateCart(profile.id);
      if (!cart) {
        console.log('[Cart] No cart found, clearing cart items');
        setCartItems([]);
        return;
      }

      // Fetch cart items with optimized query
      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          cart_id,
          variant_id,
          asin,
          quantity,
          price_at_time,
          product_name,
          product_image,
          variant_weight,
          variant_weight_unit,
          created_at
        `)
        .eq('cart_id', cart.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Cart] Supabase error fetching cart items:', error);
        throw new Error(`Failed to fetch cart items: ${error.message}`);
      }

      console.log('[Cart] Cart items fetched successfully:', items);
      setCartItems(items || []);
    } catch (error) {
      console.error('[Cart] Error in refreshCart:', error);
      // Don't throw error to prevent UI crashes, just log it
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (variantId: string, asin: string, quantity: number, productDetails: AddToCartData): Promise<void> => {
    console.log('[Cart] Adding to cart:', { variantId, asin, quantity, productDetails });
    
    if (!user) {
      throw new Error('Please sign in to add items to cart');
    }

    try {
      const profile = await getUserProfile();
      if (!profile) {
        throw new Error('User profile not found');
      }

      const cart = await getOrCreateCart(profile.id);
      if (!cart) {
        throw new Error('Could not create cart');
      }

      console.log('[Cart] Cart found/created:', cart);

      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('variant_id', variantId)
        .limit(1);

      if (fetchError) {
        console.error('[Cart] Supabase error checking existing items:', fetchError);
        throw new Error(`Failed to check existing items: ${fetchError.message}`);
      }

      const existingItem = existingItems && existingItems.length > 0 ? existingItems[0] : null;
      console.log('[Cart] Existing item check:', existingItem);

      if (existingItem) {
        // Update quantity of existing item
        const newQuantity = existingItem.quantity + quantity;
        console.log('[Cart] Updating existing item quantity to:', newQuantity);
        
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);
        
        if (updateError) {
          console.error('[Cart] Supabase error updating cart item:', updateError);
          throw new Error(`Failed to update cart item: ${updateError.message}`);
        }
        
        console.log('[Cart] Updated existing cart item successfully');
      } else {
        // Add new item
        const cartItemData = {
          cart_id: cart.id,
          variant_id: variantId,
          asin: asin,
          quantity: quantity,
          price_at_time: productDetails.price,
          product_name: productDetails.name,
          product_image: productDetails.image,
          variant_weight: productDetails.weight,
          variant_weight_unit: productDetails.weightUnit
        };
        
        console.log('[Cart] Inserting new cart item:', cartItemData);
        
        const { data: insertedItem, error: insertError } = await supabase
          .from('cart_items')
          .insert([cartItemData])
          .select('*')
          .single();
        
        if (insertError) {
          console.error('[Cart] Supabase error inserting cart item:', insertError);
          throw new Error(`Failed to add cart item: ${insertError.message}`);
        }
        
        console.log('[Cart] Added new cart item successfully:', insertedItem);
      }

      await refreshCart();
      console.log('[Cart] Cart refreshed after adding item');
    } catch (error) {
      console.error('[Cart] Error in addToCart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<void> => {
    console.log('[Cart] Updating quantity for item:', itemId, 'to:', quantity);
    
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      
      if (error) {
        console.error('[Cart] Supabase error updating quantity:', error);
        throw new Error(`Failed to update quantity: ${error.message}`);
      }

      console.log('[Cart] Quantity updated successfully');
      await refreshCart();
    } catch (error) {
      console.error('[Cart] Error in updateQuantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    console.log('[Cart] Removing item from cart:', itemId);
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) {
        console.error('[Cart] Supabase error removing from cart:', error);
        throw new Error(`Failed to remove from cart: ${error.message}`);
      }

      console.log('[Cart] Item removed successfully');
      await refreshCart();
    } catch (error) {
      console.error('[Cart] Error in removeFromCart:', error);
      throw error;
    }
  };

  const clearCart = async (): Promise<void> => {
    console.log('[Cart] Clearing cart');
    
    try {
      const profile = await getUserProfile();
      if (!profile) {
        console.log('[Cart] No profile found, clearing local state only');
        setCartItems([]);
        return;
      }

      const cart = await getOrCreateCart(profile.id);
      if (!cart) {
        console.log('[Cart] No cart found, clearing local state only');
        setCartItems([]);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);
      
      if (error) {
        console.error('[Cart] Supabase error clearing cart:', error);
        throw new Error(`Failed to clear cart: ${error.message}`);
      }

      console.log('[Cart] Cart cleared successfully in database');
      setCartItems([]);
      console.log('[Cart] Local cart state cleared');
    } catch (error) {
      console.error('[Cart] Error in clearCart:', error);
      // Clear local state even if database operation fails
      setCartItems([]);
      throw error;
    }
  };

  const getCartTotal = (): number => {
    const total = cartItems.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
    console.log('[Cart] Calculated total:', total);
    return total;
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};