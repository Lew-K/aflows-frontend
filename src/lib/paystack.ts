declare global {
  interface Window { PaystackPop: any; }
}

export const initializePaystack = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded
    if (window.PaystackPop) {
      resolve();
      return;
    }

    // Check if script tag already exists
    if (document.querySelector('script[src*="paystack"]')) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.PaystackPop) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Paystack timeout'));
      }, 10000);
      return;
    }

    // Load from CDN with error handling
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      console.log('✅ Paystack script loaded');
      const checkInterval = setInterval(() => {
        if (window.PaystackPop) {
          clearInterval(checkInterval);
          console.log('✅ PaystackPop is ready');
          resolve();
        }
      }, 100);

      setTimeout(() => clearInterval(checkInterval), 5000);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Paystack from CDN');
      reject(new Error('Failed to load Paystack'));
    };

    document.head.appendChild(script);
  });
};
