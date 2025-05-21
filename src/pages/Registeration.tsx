import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Image,
  Link,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import logo from "../assets/NewMe.png";
import { useNavigate } from "react-router-dom";
import api from "@/constants/api";
import { useState } from "react";

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const validate = () => {
    const newErrors = {
      first_name: !formData.first_name ? "First name is required" : "",
      last_name: !formData.last_name ? "Last name is required" : "",
      email: !formData.email ? "Email is required" : "",
      phone: !formData.phone ? "Phone number is required" : "",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  };

  const onRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/auth.php?action=register", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
      });

      if (res.data.status) {
        toast({ title: "Registration successful", status: "success" });
        navigate("/login");
      } else {
        toast({ title: res.data.message, status: "error" });
      }
      setLoading(false);
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.message,
        status: "error",
      });
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack mx="auto" maxW="lg" py={12} px={6} w="full">
        <Box rounded="2xl" bg="white" boxShadow="1xl" p={10}>
          <Stack>
            <Image
              rounded="md"
              src={logo}
              width="200px"
              objectFit="contain"
              mx="auto"
            />
            <Stack align="center">
              <Heading fontSize="3xl" fontWeight="bold" color="gray.800">
                Create your account
              </Heading>
            </Stack>

            <FormControl isInvalid={!!errors.first_name}>
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Your first name"
              />
              <FormErrorMessage>{errors.first_name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.last_name}>
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Your last name"
              />
              <FormErrorMessage>{errors.last_name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
              />
              <FormErrorMessage>{errors.phone}</FormErrorMessage>
            </FormControl>

            <Stack marginTop={5}>
              <Button
                rounded="md"
                bg="brand.accent"
                color="white"
                fontWeight="semibold"
                py={6}
                _hover={{ bg: "brand.muted" }}
                transition="all 0.2s"
                onClick={onRegister}
              >
                {loading ? <Spinner></Spinner> : "Register"}
              </Button>
              <Link textAlign="center" onClick={() => navigate("/login")}>
                Already have an account? Sign in
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Register;
