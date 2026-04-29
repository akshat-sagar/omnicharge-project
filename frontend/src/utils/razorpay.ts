import type { PaymentMethod } from '../types';

export const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let razorpayScriptPromise: Promise<boolean> | null = null;

export const buildRazorpayMethodConfig = (paymentMethod: PaymentMethod) => ({
  upi: paymentMethod === 'UPI',
  card: paymentMethod === 'CARD',
  netbanking: paymentMethod === 'NETBANKING',
  wallet: false,
  emi: false,
  paylater: false,
});

export const buildRazorpayDisplayConfig = (paymentMethod: PaymentMethod) => ({
  display: {
    preferences: false,
    sequence: [
      paymentMethod === 'UPI'
        ? 'upi'
        : paymentMethod === 'CARD'
          ? 'card'
          : 'netbanking',
    ],
  },
});

export const cleanupRazorpayArtifacts = () => {
  document.querySelectorAll('.razorpay-container').forEach((node) => {
    node.remove();
  });
  document.body.style.overflow = '';
};

export const loadRazorpayScript = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return true;
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const selector = `script[data-razorpay-checkout="true"]`;
      const existingScript = document.querySelector<HTMLScriptElement>(selector);

      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = RAZORPAY_CHECKOUT_URL;
      script.async = true;
      script.dataset.razorpayCheckout = 'true';

      const settle = (loaded: boolean) => {
        if (!loaded) {
          razorpayScriptPromise = null;
        }
        resolve(loaded);
      };

      const timeout = window.setTimeout(() => {
        if (!window.Razorpay) {
          script.remove();
          settle(false);
        }
      }, 15000);

      script.onload = () => {
        window.clearTimeout(timeout);
        settle(true);
      };

      script.onerror = () => {
        window.clearTimeout(timeout);
        script.remove();
        settle(false);
      };

      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
};
