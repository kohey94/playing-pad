// src/components/FilterSelector.tsx
import { RadioGroup, HStack, Radio } from "@chakra-ui/react";
import type { filterType } from "../types";

type FileterTypeSelectorProps = {
    value: filterType;
    onChange: (value: filterType) => void;
};

export default function FilterSelector({ value, onChange }: FileterTypeSelectorProps) {
    return (
        <RadioGroup onChange={(val) => onChange(val as filterType)} value={value}>
            <HStack spacing={6}>
                <Radio value="none">None</Radio>
                <Radio value="delay">Delay</Radio>
                <Radio value="reverb">Reverb</Radio>
            </HStack>
        </RadioGroup>
    );
};