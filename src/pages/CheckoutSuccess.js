import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import axios from '@/lib/api';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('payment_id');
  const [status, setStatus] = useState('loading');
  const [orderDetails, setOrderDetails] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setStatus('error');
        return;
      }

      try {
        const response = await axios.get(`/api/orders/${orderId}`);
        const data = response.data;

        setStatus('success');
        setOrderDetails(data);
        clearCart();
      } catch (error) {
        console.error('Error fetching order:', error);
        setStatus('error');
      }
    };

    fetchOrderDetails();
  }, [orderId, clearCart]);

  return (
    <>
      <Helmet>
        <title>Order Confirmed — Thank You! | BREE</title>
        <meta name="description" content="Your BREE Amla wellness shot order has been confirmed. Your daily ritual is on its way!" />
      </Helmet>
      <div className="pt-24 min-h-screen bg-bree-bg flex items-center justify-center">
        <div className="max-w-lg mx-auto px-6 py-16">
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Loader2 className="w-16 h-16 mx-auto text-bree-primary animate-spin mb-6" />
              <h1 className="font-outfit text-2xl font-semibold text-bree-text-primary mb-2">
                Confirming Your Order
              </h1>
              <p className="text-bree-text-secondary">
                Please wait while we process your order...
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
              data-testid="checkout-success"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="font-outfit text-3xl font-semibold text-bree-text-primary mb-4">
                Thank You for Your Order!
              </h1>
              <p className="text-bree-text-secondary mb-8">
                Your order has been confirmed. You'll receive a confirmation email shortly with tracking details.
              </p>

              {orderDetails && (
                <div className="bg-white p-6 rounded-2xl mb-8 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-6 h-6 text-bree-primary" />
                    <span className="font-outfit font-semibold text-bree-text-primary">
                      Order #{orderId?.substring(0, 8)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {orderDetails.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-bree-text-secondary">
                          {item.product_name} x {item.quantity}
                        </span>
                        <span className="text-bree-text-primary font-semibold">
                          ₹{item.subtotal?.toLocaleString('en-IN') || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-bree-border mt-3">
                    <span className="text-bree-text-secondary font-medium">Total</span>
                    <span className="text-bree-primary font-semibold">
                      ₹{orderDetails.total?.toLocaleString('en-IN') || '-'}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Link to="/shop">
                  <Button className="w-full bg-bree-primary hover:bg-bree-primary-hover text-white py-6 mb-2 rounded-full">
                    Continue Shopping
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full border-bree-border text-bree-text-secondary py-6 rounded-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
              <h1 className="font-outfit text-2xl font-semibold text-bree-text-primary mb-4">
                Something Went Wrong
              </h1>
              <p className="text-bree-text-secondary mb-8">
                We couldn't load your order details. Please contact support if you need assistance.
              </p>
              <div className="space-y-4">
                <Link to="/contact">
                  <Button className="w-full bg-bree-primary hover:bg-bree-primary-hover text-white py-6 rounded-full">
                    Contact Support
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="outline" className="w-full border-bree-border text-bree-text-secondary py-6 rounded-full">
                    Return to Shop
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutSuccess;