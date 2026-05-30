import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import axios from "@/lib/api";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();

  const orderId =
    searchParams.get("order_id") || searchParams.get("payment_id");

  const [status, setStatus] = useState("loading");
  const [orderDetails, setOrderDetails] = useState(null);

  const { clearCart } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setStatus("error");
        return;
      }

      try {
        const response = await axios.get(`/api/orders/${orderId}`);

        setOrderDetails(response.data);

        clearCart();

        setStatus("success");
      } catch (error) {
        console.error(error);

        setStatus("error");
      }
    };

    fetchOrder();
  }, [orderId, clearCart]);

  return (
    <>
      <Helmet>
        <title>Order Confirmed | BREE</title>

        <meta
          name="description"
          content="Your BREE order has been confirmed."
        />
      </Helmet>

      <div className="pt-24 min-h-screen bg-bree-bg">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Loader2
                className="
                w-14
                h-14
                mx-auto
                animate-spin
                text-bree-primary
                "
              />

              <h2
                className="
                mt-5
                text-2xl
                font-bold
                "
              >
                Confirming Your Order
              </h2>

              <p
                className="
                text-bree-text-secondary
                mt-2
                "
              >
                Please wait...
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
              bg-white
              rounded-3xl
              shadow-sm
              border
              border-bree-border
              p-8
              "
            >
              {/* Success */}

              <div className="text-center">
                <div
                  className="
                  w-24
                  h-24
                  rounded-full
                  bg-green-100
                  mx-auto
                  flex
                  items-center
                  justify-center
                  "
                >
                  <CheckCircle
                    className="
                    w-14
                    h-14
                    text-green-600
                    "
                  />
                </div>

                <h1
                  className="
                  text-4xl
                  font-bold
                  mt-6
                  "
                >
                  Order Confirmed
                </h1>

                <p
                  className="
                  text-bree-text-secondary
                  mt-3
                  "
                >
                  Thank you for purchasing BREE Wellness.
                </p>
              </div>

              {/* Order Details */}

              <div
                className="
                mt-10
                grid
                md:grid-cols-2
                gap-6
                "
              >
                <div
                  className="
                  bg-bree-bg
                  rounded-2xl
                  p-5
                  "
                >
                  <h3
                    className="
                    font-bold
                    mb-4
                    "
                  >
                    Payment Details
                  </h3>

                  <Info label="Order ID" value={orderDetails?.id} />

                  <Info
                    label="Transaction ID"
                    value={orderDetails?.razorpay_payment_id}
                  />

                  <Info label="Payment Method" value="Razorpay" />

                  <Info
                    label="Payment Status"
                    value={orderDetails?.payment_status}
                  />

                  <Info
                    label="Paid On"
                    value={new Date(orderDetails?.paid_at).toLocaleString()}
                  />
                </div>

                <div
                  className="
                  bg-bree-bg
                  rounded-2xl
                  p-5
                  "
                >
                  <h3
                    className="
                    font-bold
                    mb-4
                    "
                  >
                    Order Status
                  </h3>

                  <Info label="Status" value={orderDetails?.order_status} />

                  <Info label="Delivery" value="3–5 Days" />

                  <Info label="Amount Paid" value={`₹${orderDetails?.total}`} />
                </div>
              </div>

              {/* Products */}

              <div className="mt-10">
                <h3
                  className="
                  font-bold
                  mb-5
                  "
                >
                  Products
                </h3>

                <div className="space-y-4">
                  {orderDetails?.items?.map((item) => (
                    <div
                      key={item.id}
                      className="
                        border
                        rounded-2xl
                        p-4
                        flex
                        gap-4
                        "
                    >
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="
                          w-20
                          h-20
                          object-contain
                          bg-bree-bg
                          rounded-xl
                          p-2
                          "
                      />

                      <div className="flex-1">
                        <h4
                          className="
                            font-semibold
                            "
                        >
                          {item.product_name}
                        </h4>

                        <p>Qty :{item.quantity}</p>
                      </div>

                      <div
                        className="
                          font-bold
                          "
                      >
                        ₹{item.subtotal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}

              <div
                className="
                mt-10
                grid
                md:grid-cols-3
                gap-4
                "
              >
                <Link to="/orders">
                  <Button
                    className="
                    w-full
                    bg-bree-primary
                    "
                  >
                    <Truck
                      className="
                      w-4
                      h-4
                      mr-2
                      "
                    />
                    Track Order
                  </Button>
                </Link>

                <Link to="/shop">
                  <Button
                    className="
                    w-full
                    "
                    variant="outline"
                  >
                    Continue Shopping
                    <ArrowRight
                      className="
                      ml-2
                      w-4
                      h-4
                      "
                    />
                  </Button>
                </Link>

                <Link to="/">
                  <Button
                    variant="outline"
                    className="
                    w-full
                    "
                  >
                    Home
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <div
              className="
              text-center
              py-20
              "
            >
              <h2
                className="
                text-3xl
                font-bold
                "
              >
                Unable To Load
              </h2>

              <p
                className="
                mt-3
                text-bree-text-secondary
                "
              >
                Unable to load order details
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

function Info({ label, value }) {
  return (
    <div
      className="
flex
justify-between
mb-3
"
    >
      <span>{label}</span>

      <span
        className="
font-semibold
"
      >
        {value || "-"}
      </span>
    </div>
  );
}

export default CheckoutSuccess;
