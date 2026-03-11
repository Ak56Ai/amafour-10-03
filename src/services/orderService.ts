import { supabase } from '../lib/supabase';
import { CreateOrderData, OrderItem, UpdateOrderPaymentData, OrderData } from '../types/order';

export class OrderService {
  private static validateCreateOrderData(orderData: CreateOrderData): void {
    console.log('[Order] Validating order data:', orderData);
    
    if (!orderData.user_id) {
      throw new Error('User ID is required');
    }
    if (!orderData.address_id) {
      throw new Error('Address ID is required');
    }
    if (!orderData.total_amount || orderData.total_amount <= 0) {
      throw new Error('Valid total amount is required');
    }
    if (!orderData.payment_method) {
      throw new Error('Payment method is required');
    }
  }

  private static validateOrderItems(items: OrderItem[]): void {
    console.log('[Order] Validating order items:', items);
    
    if (!items || items.length === 0) {
      throw new Error('Order items are required');
    }
    
    for (const item of items) {
      if (!item.variant_id) {
        throw new Error('Variant ID is required for all items');
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error('Valid quantity is required for all items');
      }
      if (!item.price || item.price <= 0) {
        throw new Error('Valid price is required for all items');
      }
    }
  }

  static async createOrder(orderData: CreateOrderData): Promise<string> {
    console.log('[Order] Creating order with data:', orderData);
    
    try {
      // Validate input data
      this.validateCreateOrderData(orderData);
      
      // Generate order number for COD orders
      const orderNumber = orderData.payment_method === 'cod' 
        ? `RM${Date.now().toString().slice(-8)}` 
        : null;
      
      const orderPayload = {
        user_id: orderData.user_id,
        address_id: orderData.address_id,
        total_amount: orderData.total_amount,
        shipping_cost: orderData.shipping_cost,
        payment_method: orderData.payment_method,
        shipping_method: orderData.shipping_method || 'standard',
        payment_status: 'pending' as const,
        order_status: 'processing' as const,
        order_number: orderNumber
      };

      console.log('[Order] Inserting order payload:', orderPayload);

      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id')
        .single();

      if (error) {
        console.error('[Order] Supabase error creating order:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      if (!order || !order.id) {
        console.error('[Order] No order returned from insert');
        throw new Error('Failed to create order: No order ID returned');
      }

      console.log('[Order] Order created successfully with ID:', order.id);
      return order.id;
    } catch (error) {
      console.error('[Order] Error in createOrder:', error);
      throw error;
    }
  }

  static async addOrderItems(orderId: string, items: Omit<OrderItem, 'id' | 'order_id'>[]): Promise<void> {
    console.log('[Order] Adding order items for order:', orderId, 'Items:', items);
    
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // Validate items
      this.validateOrderItems(items as OrderItem[]);

      const orderItems = items.map(item => ({
        order_id: orderId,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price
      }));

      console.log('[Order] Inserting order items:', orderItems);

      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select('*');

      if (error) {
        console.error('[Order] Supabase error adding order items:', error);
        throw new Error(`Failed to add order items: ${error.message}`);
      }

      console.log('[Order] Order items added successfully:', data);
    } catch (error) {
      console.error('[Order] Error in addOrderItems:', error);
      throw error;
    }
  }

  static async updateOrderPayment(orderId: string, paymentData: UpdateOrderPaymentData): Promise<void> {
    console.log('[Order] Updating order payment for order:', orderId, 'Payment data:', paymentData);
    
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      if (!paymentData.payment_status) {
        throw new Error('Payment status is required');
      }

      if (!paymentData.order_status) {
        throw new Error('Order status is required');
      }

      const updatePayload = {
        payment_status: paymentData.payment_status,
        order_status: paymentData.order_status,
        ...(paymentData.razorpay_payment_id && { razorpay_payment_id: paymentData.razorpay_payment_id }),
        ...(paymentData.razorpay_order_id && { razorpay_order_id: paymentData.razorpay_order_id })
      };

      console.log('[Order] Updating order with payload:', updatePayload);

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .select('*');

      if (error) {
        console.error('[Order] Supabase error updating order payment:', error);
        throw new Error(`Failed to update order payment: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.error('[Order] No order found with ID:', orderId);
        throw new Error('Order not found');
      }

      console.log('[Order] Order payment updated successfully:', data[0]);
    } catch (error) {
      console.error('[Order] Error in updateOrderPayment:', error);
      throw error;
    }
  }

  static async getOrder(orderId: string): Promise<OrderData> {
    console.log('[Order] Fetching order:', orderId);
    
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const { data: order, error } = await supabase
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
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('[Order] Supabase error fetching order:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
      }

      if (!order) {
        console.error('[Order] No order found with ID:', orderId);
        throw new Error('Order not found');
      }

      console.log('[Order] Order fetched successfully:', order);
      return order as OrderData;
    } catch (error) {
      console.error('[Order] Error in getOrder:', error);
      throw error;
    }
  }

  static async updateOrderForCOD(orderId: string): Promise<void> {
    console.log('[Order] Updating order for COD:', orderId);
    
    try {
      await this.updateOrderPayment(orderId, {
        payment_status: 'pending',
        order_status: 'confirmed'
      });

      console.log('[Order] Order updated for COD successfully');
    } catch (error) {
      console.error('[Order] Error in updateOrderForCOD:', error);
      throw error;
    }
  }

  static async markOrderAsFailed(orderId: string): Promise<void> {
    console.log('[Order] Marking order as failed:', orderId);
    
    try {
      await this.updateOrderPayment(orderId, {
        payment_status: 'failed',
        order_status: 'failed'
      });

      console.log('[Order] Order marked as failed successfully');
    } catch (error) {
      console.error('[Order] Error in markOrderAsFailed:', error);
      throw error;
    }
  }
}