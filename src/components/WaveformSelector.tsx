import React from "react";
import { RadioGroup, Radio, Stack } from "@chakra-ui/react";

type Waveform = "sine" | "triangle" | "square";

type WaveformSelectorProps = {
    value: Waveform;
    onChange: (value: Waveform) => void;
};

const WaveformSelector: React.FC<WaveformSelectorProps> = ({ value, onChange }) => {
    return (
        <RadioGroup onChange={(val) => onChange(val as Waveform)} value={value}>
            <Stack direction="row" spacing={4} p={4}>
                <Radio value="sine">Sine</Radio>
                <Radio value="triangle">Triangle</Radio>
                <Radio value="square">Square</Radio>
            </Stack>
        </RadioGroup>
    );
};

export default WaveformSelector;
