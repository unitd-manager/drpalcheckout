// theme.ts
import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  fonts: {
    heading: `'Urbanist', sans-serif`,
    body: `'Urbanist', sans-serif`,
  },
  colors: {
    brand: {
      primary: "#ACD210",
      accent: "#ffb77c",
      muted: "#a3ae89",
    },
  },
});

export default customTheme;
