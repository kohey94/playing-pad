import { RadioGroup, Radio, Stack } from "@chakra-ui/react";
import type { waveform } from "../types";

type WaveformSelectorProps = {
    value: waveform;
    onChange: (value: waveform) => void;
};

export default function WaveformSelector({ value, onChange }: WaveformSelectorProps) {
    return (
        <RadioGroup onChange={(val) => onChange(val as waveform)} value={value}>
            <Stack direction="row" spacing={4} p={4}>
                <Radio value="sine">Sine</Radio>
                <Radio value="triangle">Triangle</Radio>
                <Radio value="square">Square</Radio>
            </Stack>
        </RadioGroup>
    );
};
