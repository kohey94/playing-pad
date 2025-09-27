// src/components/ModeSelector.tsx
import { Tabs, TabList, Tab, useColorMode } from "@chakra-ui/react";
import type { padMode } from "../types";

type ModeSelectorProps = {
    value: padMode;
    onChange: (value: padMode) => void;
}

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
    const { colorMode } = useColorMode();

    return (
        <Tabs
            index={value === "oscillator" ? 0 : 1}
            onChange={(index) => onChange(index === 0 ? "oscillator" : "mic")}
            variant="soft-rounded"
            colorScheme={colorMode === "light" ? "blue" : "teal"}
            isFitted
        >
            <TabList>
                <Tab>OSC</Tab>
                <Tab>MIC</Tab>
            </TabList>
        </Tabs>
    );
};
