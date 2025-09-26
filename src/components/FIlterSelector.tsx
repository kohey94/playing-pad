// src/components/FilterSelector.tsx
import { RadioGroup, HStack, Radio } from "@chakra-ui/react";

type Props = {
    value: string;
    onChange: (val: string) => void;
};

export default function FilterSelector({ value, onChange }: Props) {
    return (
        <RadioGroup onChange={onChange} value={value}>
            <HStack spacing={6}>
                <Radio value="none">None</Radio>
                <Radio value="lowpass">Lowpass</Radio>
            </HStack>
        </RadioGroup>
    );
}
