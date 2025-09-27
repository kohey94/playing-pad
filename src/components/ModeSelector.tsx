// src/components/ModeSelector.tsx
import { Tabs, TabList, Tab } from "@chakra-ui/react";
import type { padMode } from "../types";

type ModeSelectorProps = {
    value: padMode;
    onChange: (value: padMode) => void;
}

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
    return (
        <Tabs
            index={value === "oscillator" ? 0 : 1}
            onChange={(index) => onChange(index === 0 ? "oscillator" : "mic")}
            variant="enclosed"
            colorScheme="teal"
            isFitted
        >
            <TabList>
                <Tab>Oscillator</Tab>
                <Tab>Microphone</Tab>
            </TabList>
        </Tabs>
    );
};
