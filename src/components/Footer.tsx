import { Box } from "@chakra-ui/react";

export default function Footer() {
  return (
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
  );
}
