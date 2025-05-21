import useAuthStore from "@/constants/useAuthStore";
import { Box, Button, Flex, Heading, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/NewMe.png";

export default function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  return (
    <Box
      as="header"
      bg="white"
      px={8}
      py={4}
      boxShadow="sm"
      borderBottom="none"
      borderColor="white"
    >
      <Flex align="center" justify="space-between" px={4} py={2}>
        <Flex align="center" gap={4}>
          <Image rounded="md" src={logo} width="80px" objectFit="contain" />
          <Heading size="md" color="black">
            Welcome Back{user?.name ? `, ${user.name}` : ""}
          </Heading>
        </Flex>

        <Button
          size="sm"
          bg="brand.primary"
          color="white"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </Flex>
    </Box>
  );
}
