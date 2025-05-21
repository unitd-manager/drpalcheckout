import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Stack,
  Text,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/NewMe.png";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!email) {
      toast({
        title: "Email is required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Simulate sending reset link
    toast({
      title: "Password reset link sent.",
      description: `Check your inbox at ${email}.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // In real app, send API request to /forgot-password endpoint here
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack maxW="lg" py={12} px={6} w="full">
        <Box rounded="2xl" bg="white" boxShadow="lg" p={8}>
          <Stack spacing={6}>
            <Image
              rounded="md"
              src={logo}
              width="120px"
              objectFit="contain"
              mx="auto"
            />

            <Heading fontSize="2xl" textAlign="center">
              Forgot your password?
            </Heading>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Enter your email and we’ll send you a reset link.
            </Text>

            <FormControl>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <Button
              rounded="md"
              bg="brand.accent"
              color="white"
              onClick={handleSubmit}
            >
              Send Reset Link
            </Button>

            <Button variant="link" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default ForgetPassword;
