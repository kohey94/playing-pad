// src/components/FilterSelector.tsx
import React from "react";
import { RadioGroup, HStack, Radio } from "@chakra-ui/react";

type filterType = "none" | "delay" | "reverb";

type fileterTypeSelectorProps = {
    value: filterType;
    onChange: (value: filterType) => void;
};

const FilterSelector: React.FC<fileterTypeSelectorProps> = ({ value, onChange }) => {
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

export default FilterSelector
