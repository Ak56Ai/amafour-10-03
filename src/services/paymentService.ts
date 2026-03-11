import { OrderService } from './orderService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentOptions {
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  onSuccess: (response: RazorpayResponse) => Promise<void>;
  onError: (error: any) => Promise<void>;
  onDismiss?: () => void;
}

export class PaymentService {
  private static isScriptLoading = false;
  private static isCheckoutOpen = false;

  static async loadRazorpayScript(): Promise<boolean> {
    console.log('[Payment] Loading Razorpay script');
    
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        console.log('[Payment] Razorpay script already loaded');
        resolve(true);
        return;
      }

      // Check if already loading
      if (this.isScriptLoading) {
        console.log('[Payment] Razorpay script already loading, waiting...');
        const checkLoaded = setInterval(() => {
          if (window.Razorpay) {
            clearInterval(checkLoaded);
            resolve(true);
          }
        }, 100);
        return;
      }

      this.isScriptLoading = true;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('[Payment] Razorpay script loaded successfully');
        this.isScriptLoading = false;
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('[Payment] Failed to load Razorpay script');
        this.isScriptLoading = false;
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  }

  private static validatePaymentOptions(options: PaymentOptions): void {
    console.log('[Payment] Validating payment options:', options);
    
    if (!options.orderId) {
      throw new Error('Order ID is required');
    }
    if (!options.amount || options.amount <= 0) {
      throw new Error('Valid amount is required');
    }
    if (!options.prefill.name) {
      throw new Error('Customer name is required');
    }
    if (!options.prefill.email) {
      throw new Error('Customer email is required');
    }
  }

  static async openRazorpayCheckout(options: PaymentOptions): Promise<void> {
    console.log('[Payment] Opening Razorpay checkout with options:', options);
    
    try {
      // Prevent duplicate checkout opens
      if (this.isCheckoutOpen) {
        console.warn('[Payment] Checkout already open, ignoring request');
        return;
      }

      // Validate options
      this.validatePaymentOptions(options);

      // Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Convert amount to paise (multiply by 100)
      const amountInPaise = Math.round(options.amount * 100);
      console.log('[Payment] Amount converted to paise:', amountInPaise);

      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: options.currency,
        name: options.name,
        description: options.description,
        handler: async (response: RazorpayResponse) => {
          console.log('[Payment] Payment success response:', response);
          this.isCheckoutOpen = false;
          
          try {
            // Update order with payment details
            await OrderService.updateOrderPayment(options.orderId, {
              payment_status: 'completed',
              order_status: 'confirmed',
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || response.razorpay_payment_id
            });
            
            console.log('[Payment] Order updated successfully after payment');
            await options.onSuccess(response);
          } catch (error) {
            console.error('[Payment] Error updating order after payment:', error);
            
            // Mark order as failed
            try {
              await OrderService.markOrderAsFailed(options.orderId);
            } catch (markFailedError) {
              console.error('[Payment] Error marking order as failed:', markFailedError);
            }
            
            // Don't call onError here as payment was successful
            // Just log the error and continue with success flow
            console.error('[Payment] Database update failed but payment succeeded');
            await options.onSuccess(response);
          }
        },
        prefill: {
          name: options.prefill.name,
          email: options.prefill.email,
          contact: options.prefill.contact
        },
        theme: {
          color: '#F97316' // Orange color matching the theme
        },
        modal: {
          ondismiss: async () => {
            console.log('[Payment] Razorpay checkout dismissed by user');
            this.isCheckoutOpen = false;
            
            if (options.onDismiss) {
              options.onDismiss();
            } else {
              // Mark order as failed when dismissed
              try {
                await OrderService.markOrderAsFailed(options.orderId);
                console.log('[Payment] Order marked as failed due to dismissal');
              } catch (error) {
                console.error('[Payment] Error marking order as failed on dismissal:', error);
              }
              
              await options.onError(new Error('Payment cancelled by user'));
            }
          }
        }
      };

      console.log('[Payment] Creating Razorpay instance with options:', razorpayOptions);
      
      this.isCheckoutOpen = true;
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
      
    } catch (error) {
      console.error('[Payment] Error in openRazorpayCheckout:', error);
      this.isCheckoutOpen = false;
      
      // Mark order as failed
      try {
        await OrderService.markOrderAsFailed(options.orderId);
      } catch (markFailedError) {
        console.error('[Payment] Error marking order as failed:', markFailedError);
      }
      
      await options.onError(error);
    }
  }
}