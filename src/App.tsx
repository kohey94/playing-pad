import { useState } from "react"
import { Box, Flex, Heading, IconButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import Chaoscillator from "./components/Chaoscillator";
import ChaosPad from "./components/ChaosPad";
import VisualShaderBackground from "./components/VisualShaderBackground";
import ModeSelector from "./components/ModeSelector";
import type { padMode } from "./types";

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [mode, setMode] = useState<padMode>("oscillator");

  return (
    <Box
      minH="100vh"
      h="100vh"
      overflow="hidden"
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
    >
      <VisualShaderBackground />

      <Flex direction="column" h="100vh">
        {/* ヘッダー */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px={6}
          py={4}
          zIndex={10}
        >
          <Heading
            size="md"
            color={colorMode === "light" ? "gray.800" : "gray.100"}
            zIndex={10}
          >
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

        {/* メイン部分 */}
        <Flex flex="1" direction="column" align="center" justify="center">
          {/* タブ */}
          <Box mb={6} w="100%" maxW="250px">
            <ModeSelector value={mode} onChange={setMode} />
          </Box>

          {/* パッド */}
          {mode === "oscillator" ? (
            <Chaoscillator size={300} />
          ) : (
            <ChaosPad size={300} />
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
