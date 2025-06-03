import { Box, Button, Center, Heading, Text, VStack } from "@chakra-ui/react";

import { useLocation } from "react-router-dom";

const ThankYouPage = () => {
  const location = useLocation();

  // Get query param ?loc=IN or ?loc=OUT
  const params = new URLSearchParams(location.search);
  const userLocation = params.get("loc") ?? "OUT";

  const whatsappLink =
    userLocation === "IN"
      ? "https://chat.whatsapp.com/FlTW2EfhL7I6SqoeWbUNWH"
      : "https://chat.whatsapp.com/IxEumsEWu0pGrRi2JINkhS";

  return (
    <Center minH="100vh" bg="gray.50" px={4}>
      <Box
        bg="white"
        p={10}
        rounded="xl"
        boxShadow="lg"
        maxW="lg"
        textAlign="center"
      >
        <VStack spacing={6}>
          <Heading size="lg" color="green.500">
            🎉 Thank You!
          </Heading>
          <Text fontSize="md" color="gray.700">
            Your registration and payment were successful.
          </Text>
          <Text fontSize="md" color="gray.600">
            Please join the WhatsApp group below to receive updates and event
            access:
          </Text>
          <Button
            as="a"
            href={whatsappLink}
            target="_blank"
            colorScheme="whatsapp"
            style={{ background: "#128c7e" }}
            size="lg"
            rounded="md"
          >
            Join WhatsApp Group
          </Button>
        </VStack>
      </Box>
    </Center>
  );
};

export default ThankYouPage;
