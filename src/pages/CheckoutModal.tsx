import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button, useToast } from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import api from "@/constants/api";
import useAuthStore from "@/constants/useAuthStore";

interface CheckoutModalProps {
  planId: string; // Zoho item_id
  planName: string; // optional – for readability in DB
  customerId: string; // Zoho contact_id
  onSuccess?: () => void; // e.g. refresh UI / close modal
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  planId,
  planName,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);

  /* ------------------------------------------------------------------ */
  /* Record subscription in your backend                                */
  /* ------------------------------------------------------------------ */
  const registerSubscription = async (
    paymentId: string,
    paymentGateway: string
  ) => {
    try {
      await api.post("/subscription.php?action=addrecord&customer_id=0", {
        customer_id: user?.zoho_contact_id,
        payment_id: paymentId,
        payment_gateway: paymentGateway,
        customer_name: user?.name,
        // single-item invoice payload expected by PHP helper
        line_items: [
          {
            item_id: planId,
            name: planName,
            quantity: 1,
          },
        ],
      });

      toast({
        title: "Subscription saved!",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onSuccess?.();
      window.location.reload();
    } catch (err) {
      console.error("Subscription API error:", err);
      toast({
        title: "Payment stored, but subscription failed",
        description:
          "Your payment succeeded, but we could not register your subscription. Please contact support.",
        status: "warning",
        duration: 7000,
        isClosable: true,
      });
    }
  };

  /* ------------------------------------------------------------------ */
  /* Stripe payment handler                                             */
  /* ------------------------------------------------------------------ */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: "if_required",
    });

    if (result.error) {
      toast({
        title: "Payment Failed",
        description: result.error.message ?? "An error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else if (result.paymentIntent?.status === "succeeded") {
      // ── 1) tell user
      toast({
        title: "Payment Successful",
        description: "Your payment was processed.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // ── 2) store subscription in DB (is_synced will be 1 on PHP side)
      const paymentGateway =
        result.paymentIntent.payment_method_types?.[0] ?? "stripe";

      await registerSubscription(result.paymentIntent.id, paymentGateway);
    }

    setLoading(false);
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        mt={4}
        colorScheme="green"
        type="submit"
        isLoading={loading}
        disabled={!stripe || !elements}
      >
        Pay&nbsp;Now
      </Button>
    </form>
  );
};

export default CheckoutModal;
