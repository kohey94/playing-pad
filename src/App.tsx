import { useState } from "react"
import { Box, Flex, Heading, IconButton, useColorMode, VStack } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import Chaoscillator from "./components/Chaoscillator";
import VisualShaderBackground from "./components/VisualShaderBackground";
import ModeSelector from "./components/ModeSelector";
import type { padMode } from "./types";

// MicChaosPad は未実装なので仮置き
const MicChaosPad = () => <Box>Mic Chaos Pad (Coming soon)</Box>;

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [mode, setMode] = useState<padMode>("oscillator");

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.100" : "gray.900"}>
      <VisualShaderBackground />

      <Flex
        as="header"
        align="center"
        justify="space-between"
        px={6}
        py={4}
        borderBottom="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <Heading
          size="md"
          color={colorMode === "light" ? "gray.800" : "gray.100"}
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

      <Flex
        p={8}
        color={colorMode === "light" ? "gray.800" : "gray.100"}
        align="center"        // 縦方向の中央寄せ
        justify="center"      // 横方向の中央寄せ
        flexDirection="column" // 縦並び（パッドと座標を中央下に配置）
        minH="calc(100vh - 64px)" // headerを除いた残り高さを占める（header高さ: 約64px）
      >
        <VStack spacing={6}>
          {/* モード切替 */}
          <ModeSelector value={mode} onChange={setMode} />

          {/* モードごとに表示切替 */}
          {mode === "oscillator" ? (
            <Chaoscillator size={300} />
          ) : (
            <MicChaosPad />
          )}
        </VStack>
      </Flex>
    </Box>
  );
};
