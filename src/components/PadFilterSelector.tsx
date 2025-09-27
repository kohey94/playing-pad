// src/components/FilterSelector.tsx
import { RadioGroup, HStack, Radio } from "@chakra-ui/react";
import type { padFilterType } from "../types";

type PadFileterTypeSelectorProps = {
    value: padFilterType;
    onChange: (value: padFilterType) => void;
};

export default function PadFilterSelector({ value, onChange }: PadFileterTypeSelectorProps) {
    return (
        <RadioGroup onChange={(val) => onChange(val as padFilterType)} value={value}>
            <HStack spacing={6}>
                <Radio value="none">None</Radio>
                <Radio value="delay">Delay</Radio>
                <Radio value="reverb">Reverb</Radio>
                <Radio value="pitchshift">Pitchshift</Radio>
            </HStack>
        </RadioGroup>
    );
};
