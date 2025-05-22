/* --------------------------------------------
   SixtyDaysHealthReset.tsx
   -------------------------------------------- */
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  IoCalendarOutline,
  IoGiftOutline,
  IoLocationOutline,
  IoTimeOutline,
} from "react-icons/io5";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import moment from "moment";
import api from "@/constants/api";
import drpalimg from "../assets/dr-pal-2.png";

/* ---------- Stripe ---------- */
const stripePromise = loadStripe(
  "pk_test_51RH4BDRuKKtMM49aveCmwENxJKQAV2G3QFdJ2O5FezyVTEPsFPYXIePhMuK5lVyePKk7WgPJ1TrSiBdlyakylR5t00BFJ9FxWj"
);
const PRICE_INR = 199; // ₹199  (→ paise in the PaymentIntent = PRICE_INR * 100)

/* ---------- Child: secure Stripe form ---------- */
interface CheckoutProps {
  onSuccess: (paymentId: string) => void;
}
const CheckoutForm: React.FC<CheckoutProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setProcessing(false);

    if (error) {
      toast({
        title: "Payment failed",
        description: error.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        mt={6}
        w="full"
        type="submit"
        isLoading={processing}
        colorScheme="orange"
        rounded="md"
      >
        Pay ₹{PRICE_INR}
      </Button>
    </form>
  );
};

/* ---------- Parent component ---------- */
const SixtyDaysHealthReset = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  /* ----- form state ----- */
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });

  /* ----- Stripe state ----- */
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  /* ----- helpers ----- */
  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "" });
    setErrors({ name: "", email: "", phone: "" });
  };

  const validate = () => {
    const { name, email, phone } = formData;
    const newErrors = {
      name: name.trim() === "" ? "Name is required" : "",
      email:
        email.trim() === ""
          ? "Email is required"
          : !/\S+@\S+\.\S+/.test(email)
          ? "Invalid email format"
          : "",
      phone:
        phone.trim() === ""
          ? "Phone number is required"
          : !/^\d{10}$/.test(phone.replace(/\D/g, ""))
          ? "Invalid phone number"
          : "",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  /* ----- create PaymentIntent & open checkout modal ----- */
  const handlePayment = async () => {
    if (!validate()) return;

    try {
      const res = await fetch(
        "https://drpalsnewme.com/subscription-api/create-payment-intent.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: PRICE_INR * 100 }), // in paise
        }
      );
      const data = await res.json();

      if (!data.clientSecret) throw new Error("Unable to initialise payment.");

      setClientSecret(data.clientSecret);
      onOpen();
    } catch (err: any) {
      toast({
        title: "Payment error",
        description: err.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }
  };

  /* ----- after Stripe says “succeeded” ----- */
  const registerParticipant = async (paymentId: string) => {
    try {
      const { data } = await api.post(
        "/transform-health-api.php?action=addParticipant",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          datetime: moment().format("DD-MM-YYYY HH:mm"),
          payment_id: paymentId,
        }
      );

      toast({
        title: data.status
          ? "Payment & Registration Successful"
          : "Registration failed",
        description: data.message ?? `Payment ID: ${paymentId}`,
        status: data.status ? "success" : "warning",
        duration: 6000,
        isClosable: true,
      });

      if (data.status) {
        resetForm();
        onClose();
      }
    } catch (err: any) {
      toast({
        title: "Payment saved, but server error",
        description: err?.response?.data?.message ?? err.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }
  };

  /* ----- Elements options only once we have a clientSecret ----- */
  const stripeOptions = clientSecret ? { clientSecret } : undefined;

  /* ---------- UI ---------- */
  return (
    <>
      {/* ---------- checkout modal ---------- */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            {clientSecret && (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <CheckoutForm onSuccess={registerParticipant} />
              </Elements>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ---------- hero & form ---------- */}
      <Flex
        minH="100vh"
        bg="gray.50"
        align="center"
        justify="center"
        py={10}
        px={{ base: 4, md: 8 }}
      >
        <Flex
          bg="white"
          rounded="xl"
          boxShadow="2xl"
          w="full"
          maxW="6xl"
          overflow="hidden"
          direction={{ base: "column", md: "row" }}
        >
          {/* Left - Event Info */}
          <Box w={{ base: "100%", md: "50%" }} p={{ base: 6, md: 10 }}>
            <Heading fontSize={{ base: "xl", md: "2xl" }} mb={4}>
              Transform Your Health with{" "}
              <span style={{ color: "#f4a261" }}>Dr. Pal</span>
            </Heading>

            <Image
              src={drpalimg}
              alt="Transform Your Health"
              borderRadius="md"
              mb={6}
              maxH="280px"
              objectFit="contain"
            />

            <Stack spacing={4}>
              <HStack align="start">
                <IoGiftOutline size={24} />
                <Text fontSize="sm" color="gray.700">
                  Bonus: <strong>FREE Gut Reset PDF</strong> to kick-start
                  better digestion, energy & fat loss.
                </Text>
              </HStack>

              <Box
                border="1px"
                borderColor="gray.200"
                p={3}
                rounded="md"
                bg="gray.100"
              >
                <Text fontSize="lg" textAlign="center" color="gray.700">
                  Seats limited to <strong>1,000</strong> — reserve yours now!
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Right - Registration Form */}
          <Box w={{ base: "100%", md: "50%" }} p={{ base: 6, md: 10 }}>
            <Stack spacing={6}>
              <HStack spacing={4} wrap="wrap" justifyContent="space-between">
                <HStack alignItems="center">
                  <IoCalendarOutline color="#f4a261" size={30} />
                  <Text fontSize="md" mb="0">
                    <strong>Date:</strong>
                    <br /> June 9, 2025
                  </Text>
                </HStack>
                <HStack alignItems="center">
                  <IoTimeOutline color="#f4a261" size={30} />
                  <Text fontSize="md" mb="0">
                    <strong>Time:</strong>
                    <br /> 10:45 AM
                  </Text>
                </HStack>
                <HStack alignItems="center">
                  <IoLocationOutline color="#f4a261" size={30} />
                  <Text fontSize="md" mb="0">
                    <strong>Location:</strong>
                    <br /> Online
                  </Text>
                </HStack>
              </HStack>

              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.phone}>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>

              <Button
                rounded="md"
                bg="brand.primary"
                fontWeight="semibold"
                py={6}
                _hover={{ bg: "brand.muted" }}
                transition="all 0.2s"
                mt={5}
                size="lg"
                onClick={handlePayment}
              >
                Pay ₹{PRICE_INR} & Reserve Seat
              </Button>
            </Stack>
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export default SixtyDaysHealthReset;
