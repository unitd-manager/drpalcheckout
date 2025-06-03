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
  Select,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  IoCalendarOutline,
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
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "./style.css";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(
  "pk_live_51Qcw05A9DMbPqakd8tnp2cIKFDiiTc9KbiTDi1O1YI5gb6dlV4ierR59ZlxCX19Z04kwz3GVuQ5v1yBEshkyzGNR00Uj0ISiYa"
);
const PRICE_INR = 1000;
const PRICE_USD = 20;

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
        Pay ${PRICE_USD}
      </Button>
    </form>
  );
};

const SixtyDaysHealthReset = () => {
  const navigate = useNavigate();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "OUT",
    how_known: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    how_known: "",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "OUT",
      how_known: "",
    });
    setErrors({ name: "", email: "", phone: "", location: "", how_known: "" });
  };

  const validate = () => {
    const { name, email, phone, location, how_known } = formData;
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
          ? "Phone is required"
          : !/^\+?[0-9]{10,15}$/.test(phone)
          ? "Invalid phone number"
          : "",
      location: !["IN", "OUT"].includes(location)
        ? "Please select your location"
        : "",
      how_known: how_known.trim() === "" ? "This field is required" : "",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const handlePayment = async () => {
    if (!validate()) return;

    try {
      const res = await fetch(
        "https://drpalsnewme.com/subscription-api/create-payment-intent.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: PRICE_USD * 100 }),
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

  const handlePaymentIndia = () => {
    if (!validate()) return;
    setLoading(true);

    const options = {
      key: "rzp_live_RD6YGwqBWVIWNr",
      amount: PRICE_INR * 100,
      currency: "INR",
      name: "DRPAL NewMe - 60 days Health Reset Webinar",
      description: "Event Ticket - 60 days Health Reset",
      handler: async (response: any) => {
        const paymentId = response.razorpay_payment_id;
        try {
          const { data } = await api.post(
            "/sixty-days-health-reset.php?action=addParticipant",
            {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              datetime: moment().format("DD-MM-YYYY HH:mm"),
              payment_id: paymentId,
              location: formData.location,
              how_known: formData.how_known,
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
            navigate(`/thank-you?loc=${formData.location}`);
          }
        } catch (err: any) {
          toast({
            title: "Payment saved, but server error",
            description: err?.response?.data?.message ?? err.message,
            status: "error",
            duration: 6000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          toast({
            title: "Payment Cancelled",
            description:
              "You closed the payment popup without completing payment.",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
          setLoading(false);
        },
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: "#38B2AC" },
    };

    const razorpay = new (window as any).Razorpay(options);

    razorpay.on("payment.failed", function (response: any) {
      toast({
        title: "Payment Failed",
        description:
          response.error?.description ||
          "Something went wrong. Please try again.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      setLoading(false);
    });

    razorpay.open();
  };

  const registerParticipant = async (paymentId: string) => {
    try {
      const { data } = await api.post(
        "/sixty-days-health-reset.php?action=addParticipant",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          datetime: moment().format("DD-MM-YYYY HH:mm"),
          payment_id: paymentId,
          location: formData.location,
          how_known: formData.how_known,
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
      if (data.status) resetForm();
      navigate(`/thank-you?loc=${formData.location}`);
    } catch (err: any) {
      toast({
        title: "Payment saved, but server error",
        description: err?.response?.data?.message ?? err.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const stripeOptions = clientSecret ? { clientSecret } : undefined;

  return (
    <>
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
          <Box w={{ base: "100%", md: "50%" }} p={{ base: 6, md: 10 }}>
            <Heading fontSize={{ base: "xl", md: "2xl" }} mb={4}>
              60 Days Health Reset{" "}
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
          <Box w={{ base: "100%", md: "50%" }} p={{ base: 6, md: 10 }}>
            <Stack spacing={6}>
              <HStack spacing={4} wrap="wrap" justifyContent="space-between">
                <HStack alignItems="center">
                  <IoCalendarOutline color="#f4a261" size={30} />
                  <Text fontSize="md">
                    <strong>Date:</strong>
                    <br /> June 9, 2025
                  </Text>
                </HStack>
                <HStack alignItems="center">
                  <IoTimeOutline color="#f4a261" size={30} />
                  <Text fontSize="md">
                    <strong>Time:</strong>
                    <br /> 10:45 AM
                  </Text>
                </HStack>
                <HStack alignItems="center">
                  <IoLocationOutline color="#f4a261" size={30} />
                  <Text fontSize="md">
                    <strong>Location:</strong>
                    <br /> Online
                  </Text>
                </HStack>
              </HStack>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
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
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.phone}>
                <FormLabel>Phone Number (Whatsapp Number)</FormLabel>
                <PhoneInput
                  defaultCountry="in"
                  disableDialCodeAndPrefix
                  value={formData.phone}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      phone: value,
                    }));
                  }}
                  style={{ width: "100%" }}
                  className="chakra-input"
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.location} isRequired>
                <FormLabel>Where are you joining from?</FormLabel>
                <HStack spacing={6}>
                  <Button
                    colorScheme={formData.location === "IN" ? "orange" : "gray"}
                    variant={formData.location === "IN" ? "solid" : "outline"}
                    onClick={() =>
                      setFormData((p) => ({ ...p, location: "IN" }))
                    }
                  >
                    India
                  </Button>
                  <Button
                    colorScheme={
                      formData.location === "OUT" ? "orange" : "gray"
                    }
                    variant={formData.location === "OUT" ? "solid" : "outline"}
                    onClick={() =>
                      setFormData((p) => ({ ...p, location: "OUT" }))
                    }
                  >
                    Outside India
                  </Button>
                </HStack>
                <FormErrorMessage>{errors.location}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.how_known}>
                <FormLabel>How did you hear about us?</FormLabel>
                <Select
                  placeholder="Select an option"
                  value={formData.how_known}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      how_known: e.target.value,
                    }))
                  }
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Google ads">Google Ads</option>
                  <option value="Friends/Family">Friends / Family</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Youtube">YouTube</option>
                  <option value="Linked in">LinkedIn</option>
                </Select>
                <FormErrorMessage>{errors.how_known}</FormErrorMessage>
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
                isLoading={loading}
                onClick={() => {
                  formData.location === "IN"
                    ? handlePaymentIndia()
                    : handlePayment();
                }}
              >
                {formData.location === "IN"
                  ? `Pay ₹${PRICE_INR} & Reserve Seat`
                  : `Pay $${PRICE_USD} & Reserve Seat`}
              </Button>
            </Stack>
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export default SixtyDaysHealthReset;
