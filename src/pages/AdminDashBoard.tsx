// src/pages/AdminDashboard.tsx
import {
  Box,
  Flex,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  HStack,
  Heading,
  Text,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useDisclosure,
  useColorModeValue,
  Spinner,
  useToast,
  Card,
} from "@chakra-ui/react";
import {
  FaBars,
  FaUsers,
  FaExchangeAlt,
  FaTachometerAlt,
  FaSignOutAlt,
  FaList,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Users from "@/components/admin/Users";
import Subscription from "@/components/admin/Subscription";
import api from "@/constants/api";
import useAuthStore from "@/constants/useAuthStore";
import TransformHealth from "@/components/admin/TransformHealth";

/* ────────────────────── Sidebar ────────────────────── */
const Sidebar = ({
  onSelect,
  onLogout,
  isDrawer = false,
}: {
  onSelect: (section: string) => void;
  onLogout: () => void;
  isDrawer?: boolean;
}) => {
  const bg = useColorModeValue("gray.100", "gray.900");
  return (
    <Box
      w="250px"
      bg={bg}
      p={5}
      h="100vh"
      {...(!isDrawer && { position: "fixed", left: 0, top: 0 })}
    >
      <Heading size="md" mb={8} textAlign="center">
        Admin Panel
      </Heading>

      <VStack align="start" spacing={6}>
        {[
          { label: "Dashboard", icon: FaTachometerAlt, key: "dashboard" },
          { label: "All Users", icon: FaUsers, key: "users" },
          {
            label: "All Transactions",
            icon: FaExchangeAlt,
            key: "transactions",
          },
          {
            label: "Transform Health - India",
            icon: FaList,
            key: "transform-health",
          },
        ].map(({ label, icon, key }) => (
          <HStack
            key={key}
            cursor="pointer"
            onClick={() => onSelect(key)}
            _hover={{ opacity: 0.8 }}
          >
            <Icon as={icon} boxSize={5} />
            <Text mb="0">{label}</Text>
          </HStack>
        ))}
      </VStack>

      {/* logout */}
      <Box mt="auto" pt={10}>
        <HStack
          cursor="pointer"
          onClick={onLogout}
          _hover={{ opacity: 0.8 }}
          color="red.500"
        >
          <Icon as={FaSignOutAlt} boxSize={5} />
          <Text mb="0">Logout</Text>
        </HStack>
      </Box>
    </Box>
  );
};

/* ────────────────────── Dashboard counts ────────────────────── */
const DashboardOverview = () => {
  const toast = useToast();
  const [stats, setStats] = useState<{
    user_count: number;
    transaction_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin.php?action=stats")
      .then((res) => {
        if (res.data.status) {
          setStats(res.data.data);
        } else {
          toast({
            title: "Failed to load stats",
            description: res.data.message,
            status: "error",
          });
        }
      })
      .catch((err) =>
        toast({
          title: "Server error",
          description: err.message,
          status: "error",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading && !stats)
    return (
      <Flex justify="center" py={10}>
        <Spinner size="xl" />
      </Flex>
    );

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
      <Card p={5}>
        <Stat>
          <StatLabel>Total Users</StatLabel>
          <StatNumber>{stats?.user_count ?? "-"}</StatNumber>
        </Stat>
      </Card>
      <Card p={5}>
        <Stat>
          <StatLabel>Total Transactions</StatLabel>
          <StatNumber>{stats?.transaction_count ?? "-"}</StatNumber>
        </Stat>
      </Card>
    </SimpleGrid>
  );
};

/* ────────────────────── Content switcher ────────────────────── */
const Content = ({ section }: { section: string }) => (
  <Box p={8}>
    <Heading size="lg" mb={4}>
      {section === "dashboard" && "Dashboard Overview"}
      {section === "users" && "User List"}
      {section === "transactions" && "Transaction History"}
      {section === "transform-health" && "Transform Health India - Webinar"}
    </Heading>

    {section === "dashboard" && <DashboardOverview />}
    {section === "users" && <Users />}
    {section === "transactions" && <Subscription />}
    {section === "transform-health" && <TransformHealth></TransformHealth>}
  </Box>
);

/* ────────────────────── Main component ────────────────────── */
export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Flex minH="100vh">
      {/* Desktop sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar onSelect={setSection} onLogout={handleLogout} />
      </Box>

      {/* Mobile drawer */}
      <Drawer placement="left" isOpen={isOpen} onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody p={0}>
            <Sidebar
              isDrawer
              onSelect={(s) => {
                setSection(s);
                onClose();
              }}
              onLogout={() => {
                onClose();
                handleLogout();
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Content */}
      <Box flex="1" ml={{ base: 0, md: "250px" }}>
        <IconButton
          aria-label="open menu"
          icon={<FaBars />}
          display={{ base: "inline-flex", md: "none" }}
          onClick={onOpen}
          m={4}
        />
        <Content section={section} />
      </Box>
    </Flex>
  );
}
