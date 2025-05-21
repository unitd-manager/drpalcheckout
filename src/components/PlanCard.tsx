// PlanCard.tsx
import {
  Box,
  Button,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import CheckoutModal from "../pages/CheckoutModal";
import useAuthStore from "@/constants/useAuthStore";

const stripePromise = loadStripe(
  "pk_test_51RH4BDRuKKtMM49aveCmwENxJKQAV2G3QFdJ2O5FezyVTEPsFPYXIePhMuK5lVyePKk7WgPJ1TrSiBdlyakylR5t00BFJ9FxWj"
);

const PlanCard = ({ plan }: any) => {
  const { user } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [clientSecret, setClientSecret] = useState("");

  const handleSubscribe = async () => {
    const amount = parseFloat(plan.rate); // adjust according to your price field

    const res = await fetch(
      "https://drpalsnewme.com/subscription-api/create-payment-intent.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100 }), // amount in cents
      }
    );
    const data = await res.json();

    if (data.clientSecret) {
      setClientSecret(data.clientSecret);
      onOpen();
    } else {
      alert("Failed to initiate payment.");
    }
  };

  return (
    <Box border="1px solid #eee" borderRadius="lg" bgColor="white" p={5}>
      <Text fontWeight="bold">{plan.name}</Text>
      <Text mt={2}>{plan.description}</Text>
      <Text mt={2}>Price: ${plan.rate}</Text>
      <Button mt={4} colorScheme="blue" onClick={handleSubscribe}>
        Subscribe
      </Button>

      {clientSecret && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody p={6}>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutModal
                  planId={plan.item_id}
                  planName={plan.name}
                  customerId={user?.zoho_contact_id || ""}
                  onSuccess={() => {
                    // optional: close modal or reload subscriptions
                  }}
                />
              </Elements>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default PlanCard;
