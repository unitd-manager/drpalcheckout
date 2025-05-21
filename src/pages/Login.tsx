import {
  Box,
  Button,
  Checkbox,
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
  Text,
  Spinner,
} from "@chakra-ui/react";
import logo from "../assets/NewMe.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "@/constants/api";
import useAuthStore from "@/constants/useAuthStore";

const ADMIN_EMAIL = "admin@drpalnewme.com";
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();

  /* -------------------- form state -------------------- */
  const [formData, setFormData] = useState({ email: "" });
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [emailData, setEmailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "" });

  /* -------------------- helpers -------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateEmail = () => {
    const newErrors = { email: !formData.email ? "Email is required" : "" };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  };

  /* -------------------- email submit -------------------- */
  const onLogin = async () => {
    if (!validateEmail()) return;

    // ——— Admin shortcut ———
    if (formData.email.toLowerCase() === ADMIN_EMAIL) {
      toast({ title: "Admin account detected", status: "info" });
      setStep("password");
      return;
    }

    // ——— Normal OTP flow ———
    try {
      setLoading(true);
      const res = await api.post("/auth.php?action=login", {
        email: formData.email,
      });

      if (res.data.status) {
        toast({ title: "Email validated", status: "success" });
        setEmailData(res.data.data);
        setStep("otp");
      } else {
        toast({
          title: "Login failed",
          description: res.data.message,
          status: "error",
        });
      }
    } catch (err: any) {
      toast({
        title: "Server error",
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- admin password submit -------------------- */
  const handlePasswordSubmit = () => {
    // 👉 replace with a real check or API call
    if (password == "drpalSub23%") {
      toast({ title: "Welcome, admin!", status: "success" });
      login(
        { email: ADMIN_EMAIL, id: "", name: "", zoho_contact_id: "" },
        "admin",
        "admin"
      ); // store whatever user data you want
      navigate("/admin");
    } else {
      toast({
        title: "Invalid password",
        description: "Password cannot be blank",
        status: "error",
      });
    }
  };

  /* -------------------- otp submit -------------------- */
  const handleOtpSubmit = () => {
    if (otp === "2345") {
      toast({ title: "OTP verified", status: "success" });
      login(emailData, otp, "user");
      navigate("/dashboard");
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter 2345",
        status: "error",
      });
    }
  };

  /* ==================== UI ==================== */
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

            <Stack align="center" mb={6}>
              <Heading fontSize="3xl" fontWeight="bold" color="gray.800">
                Sign in to your account
              </Heading>
              <Text color="gray.500">
                {
                  {
                    email: "Enter your email to receive OTP",
                    otp: "Enter the OTP sent to your email",
                    password: "Enter admin password",
                  }[step]
                }
              </Text>
            </Stack>

            {/* ───────────────── Email Step ───────────────── */}
            {step === "email" && (
              <>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <Button
                  rounded="md"
                  bg="brand.primary"
                  fontWeight="semibold"
                  py={6}
                  _hover={{ bg: "brand.muted" }}
                  transition="all 0.2s"
                  mt={5}
                  onClick={onLogin}
                >
                  {!loading ? "Verify Email" : <Spinner size="sm" />}
                </Button>
              </>
            )}

            {/* ───────────────── OTP Step ───────────────── */}
            {step === "otp" && (
              <>
                <FormControl>
                  <FormLabel>Enter OTP</FormLabel>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 2345"
                  />
                </FormControl>

                <Button colorScheme="teal" mt={5} onClick={handleOtpSubmit}>
                  Submit OTP
                </Button>
              </>
            )}

            {/* ───────────────── Password Step ───────────────── */}
            {step === "password" && (
              <>
                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Admin password"
                  />
                </FormControl>

                <Button
                  colorScheme="teal"
                  mt={5}
                  onClick={handlePasswordSubmit}
                >
                  Login
                </Button>
              </>
            )}

            <Stack mt={5}>
              <Flex align="center" justify="space-between">
                <Checkbox defaultChecked>Remember Me</Checkbox>
                <Link
                  onClick={() => navigate("/forget-password")}
                  color="teal.500"
                  fontWeight="medium"
                >
                  Forgot Password?
                </Link>
              </Flex>

              <Link onClick={() => navigate("/register")} textAlign="center">
                Don't Have an Account? Signup
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
