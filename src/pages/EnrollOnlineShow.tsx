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
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  IoCalendarOutline,
  IoGiftOutline,
  IoLocationOutline,
  IoTimeOutline,
} from "react-icons/io5";
import drpalimg from "../assets/dr-pal-2.png";
import api from "@/constants/api";
import moment from "moment";

const EnrollOnlineShow = () => {
  const toast = useToast();

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "" });
    setErrors({ name: "", email: "", phone: "" });
  };
  const handlePayment = () => {
    if (!validate()) return;

    const options = {
      key: "rzp_test_Z95Rb6SwKhyUn7",
      amount: 199 * 100,
      currency: "INR",
      name: "DRPAL NewMe - Transform Your Health",
      description: "Event Ticket - Transform Your Health",

      /* ───────── Razorpay success callback ───────── */
      handler: async (response: any) => {
        const paymentId = response.razorpay_payment_id;

        try {
          // 1️⃣ hit your PHP API
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
              : "registration failed",
            description: data.message ?? `Payment ID: ${paymentId}`,
            status: data.status ? "success" : "warning",
            duration: 6000,
            isClosable: true,
          });
          if (data.status) resetForm();
        } catch (err: any) {
          toast({
            title: "Payment saved, but server error",
            description: err?.response?.data?.message ?? err.message,
            status: "error",
            duration: 6000,
            isClosable: true,
          });
        }
      },

      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: "#38B2AC" },
    };

    /* open Razorpay checkout */
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return (
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
                Bonus: <strong>FREE Gut Reset PDF</strong> to kick-start better
                digestion, energy & fat loss.
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
                  <br></br> June 9, 2025
                </Text>
              </HStack>
              <HStack alignItems="center">
                <IoTimeOutline color="#f4a261" size={30} />
                <Text fontSize="md" mb="0">
                  <strong>Time:</strong>
                  <br></br> 10:45 AM
                </Text>
              </HStack>
              <HStack alignItems="center">
                <IoLocationOutline color="#f4a261" size={30} />
                <Text fontSize="md" mb="0">
                  <strong>Location:</strong>
                  <br></br> Online
                </Text>
              </HStack>
            </HStack>

            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
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
              Pay ₹199 & Reserve Seat
            </Button>
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default EnrollOnlineShow;
