import PlanCard from "@/components/PlanCard";
import api from "@/constants/api";
import useAuthStore from "@/constants/useAuthStore";
import { Box, Button, Flex, Heading, Spacer } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// fallback sample plans if real API fails
interface Subscription {
  plan: string;
  status: string;
  expiry: string;
}
const AllPlans = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

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
    if (user && user.zoho_contact_id) {
      api
        .get(`/get-subscription.php?customer_id=${user.zoho_contact_id}`)
        .then((res) => {
          if (res.data.status) {
            const invoice = res.data.invoice;
            setSubscription({
              plan: invoice?.line_items?.[0]?.name || "Unknown Plan",
              status: invoice?.status || "Unknown",
              expiry: invoice?.due_date || "N/A",
            });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch subscription:", err);
        });
      fetchPlans();
    }
  }, [user]);
  return (
    <Flex direction="column" minH="100vh" bg="#F6F6F6">
      <Box
        as="header"
        bg="white"
        px={8}
        py={4}
        boxShadow="sm"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Flex align="center">
          <Heading size="md" color="black">
            Explore All Plans
          </Heading>
          <Spacer />
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={() => navigate("/subscription")}
          >
            Back to Dashboard
          </Button>
        </Flex>
      </Box>

      <Box px={8} py={10} flex="1">
        <Heading textAlign="center" mb={10} color="gray.800">
          Pick a Wellness Program that’s right for you
        </Heading>

        <Flex wrap="wrap" justify="center" gap={6} maxW="1200px" mx="auto">
          {plans &&
            plans.map((plan, index) => (
              <Box
                key={index}
                w={{ base: "100%", sm: "100%", md: "31%" }} // full on mobile, ~2 on small, 3 on medium+
              >
                <PlanCard
                  subscription={subscription}
                  key={index}
                  index={index}
                  plan={plan}
                />
              </Box>
            ))}
        </Flex>
      </Box>

      <Box
        as="footer"
        textAlign="center"
        p={4}
        bg="gray.100"
        fontSize="sm"
        color="gray.600"
      >
        © {new Date().getFullYear()} Drpalsnewme. All rights reserved.
      </Box>
    </Flex>
  );
};

export default AllPlans;
