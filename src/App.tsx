import { useState } from "react";
import { Box, Flex, Heading, IconButton, useColorMode, Text } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import ChaosPad from "./components/ChaosPad";
import VisualShaderBackground from "./components/VisualShaderBackground";

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

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
        <Box p={6}>
          <ChaosPad
            size={300}
            onChange={(x, y) => setCoords({ x, y })}
          />
          {coords && (
            <Text mt={4}>
              X: {coords.x.toFixed(2)}, Y: {coords.y.toFixed(2)}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
