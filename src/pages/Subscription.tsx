import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PlanCard from "@/components/PlanCard";
import api from "@/constants/api";
import useAuthStore from "@/constants/useAuthStore";
import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Badge,
  Button,
  useColorModeValue,
  Link,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface InvoiceItem {
  item_name: string;
  validity_in_days: string; // or number, if you parse it
  payment_status: string;
  enrolled_on: string; // ISO date string, e.g., "2025-01-29"
}

interface Subscription {
  status: boolean;
  invoice_id: string;
  items: InvoiceItem[];
}
const Dashboard = () => {
  const cardBg = useColorModeValue("white", "gray.800");

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [subsloading, setLoading] = useState(false);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState([]);
  const fetchPlans = async () => {
    try {
      const res = await axios.get(
        "https://drpalsnewme.com/subscription-api/zoho-proxy.php/api/items"
      );
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);
  useEffect(() => {
    if (user && user.zoho_contact_id) {
      setLoading(true);
      api
        .get(`/get-subscription.php?customer_id=${user.zoho_contact_id}`)
        .then((res) => {
          console.log(res.data);
          if (res.data.status) {
            setSubscription(res.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.error("Failed to fetch subscription:", err);
        });
    }
  }, [user]);
  return (
    <Flex direction="column" minH="100vh" bg="#f6f6f6">
      <Header />

      {/* Content Section */}
      <Box px={8} py={6}>
        {/* Top Info Boxes */}
        <Flex wrap="wrap" justify="space-between" align="start" gap={3}>
          {/* User Box */}
          <Box
            bg={cardBg}
            rounded="xl"
            border="1px"
            borderColor="gray.200"
            pt={6}
            pb={6}
            w={{ base: "100%", md: "49%" }}
          >
            <Text pl={3} pr={3} fontSize="md" fontWeight="bold" mb={2}>
              User Details
            </Text>
            <hr></hr>
            <Stack pl={3} pr={3} spacing={1} fontSize="sm">
              <Text>
                <strong>Name:</strong> {user && user.name}
              </Text>
              <Text>
                <strong>Email:</strong> {user && user.email}
              </Text>
              <Text>
                <strong>Phone:</strong> {user && user.phone}
              </Text>
            </Stack>
          </Box>

          {/* Subscription Box */}
          <Box
            bg={cardBg}
            rounded="xl"
            border="1px"
            borderColor="gray.200"
            pt={6}
            pb={6}
            w={{ base: "100%", md: "49%" }}
          >
            <Flex
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              pl={3}
              pr={3}
            >
              <Text fontSize="md" fontWeight="bold" mb={2}>
                Subscription Details{" "}
                <Link href="/allplans" fontWeight="normal">
                  ( Explore All Plans )
                </Link>
              </Text>
              <Button
                size="sm"
                bg="brand.primary"
                _hover={{ bg: "brand.accent" }}
                rounded="md"
                onClick={() => navigate("/transactionhistory")}
              >
                Transaction History
              </Button>
            </Flex>
            <hr></hr>
            {subsloading && <Spinner size="lg" />}
            {subscription ? (
              <Stack ml={6} spacing={1} fontSize="sm">
                <Text>
                  <strong>Plan:</strong> {subscription?.items[0].item_name} -{" "}
                  <Badge>{subscription?.items[0].validity_in_days} Days</Badge>
                </Text>
                <Text>
                  <strong>Payment Status:</strong>{" "}
                  <Badge
                    colorScheme={
                      subscription?.items[0].payment_status === "paid"
                        ? "green"
                        : "red"
                    }
                  >
                    {subscription?.items[0].payment_status}
                  </Badge>
                </Text>
                <Text>
                  <strong>Enrolled On:</strong>{" "}
                  {moment(subscription?.items[0].enrolled_on).format(
                    "DD-MM-YYYY"
                  )}
                </Text>
                <Text>
                  <strong>Expire On:</strong>{" "}
                  {moment(subscription?.items[0].enrolled_on)
                    .add(subscription?.items[0].validity_in_days, "days")
                    .format("DD-MM-YYYY")}
                </Text>
                <Text>
                  <strong>Plan Status:</strong>{" "}
                  <Badge
                    colorScheme={
                      moment().isBefore(
                        moment(subscription?.items[0].enrolled_on).add(
                          subscription?.items[0].validity_in_days,
                          "days"
                        )
                      )
                        ? "green"
                        : "red"
                    }
                  >
                    {moment().isBefore(
                      moment(subscription?.items[0].enrolled_on).add(
                        subscription?.items[0].validity_in_days,
                        "days"
                      )
                    )
                      ? "Active"
                      : "Expired"}
                  </Badge>
                </Text>
              </Stack>
            ) : (
              <Stack>
                <Text ml={5}>No Plans Found</Text>
              </Stack>
            )}
          </Box>
        </Flex>

        {/* Plans Section */}
        <Box mt={10}>
          <Heading mb={6} fontSize="2xl" color="gray.800" textAlign="start">
            Explore Our Maintenance Plans
          </Heading>
          <Flex wrap="wrap" gap={6}>
            {plans &&
              plans.slice(0, 5).map((plan, index) => (
                <Box key={index} w={{ base: "100%", md: "31%" }}>
                  <PlanCard
                    subscription={subscription}
                    onClick={() => {}}
                    plan={plan}
                    index={index}
                  />
                </Box>
              ))}
          </Flex>
        </Box>
      </Box>

      <Footer />
    </Flex>
  );
};

export default Dashboard;
