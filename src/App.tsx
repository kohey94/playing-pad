import { Box, Flex, Heading, IconButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.100" : "gray.900"}>
      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={6}
        py={4}
        borderBottom="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <Heading size="md" color={colorMode === "light" ? "gray.800" : "gray.100"}>
          playing-pad
        </Heading>

        <IconButton
          aria-label="Toggle color mode"
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          variant="ghost"
          colorScheme="gray"
        />
      </Flex>

      <Flex p={8} color={colorMode === "light" ? "gray.800" : "gray.100"}>
        ここにカオスパッドUIを置く
      </Flex>
    </Box>
  );
}
