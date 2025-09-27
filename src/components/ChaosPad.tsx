import { useState, useRef, useEffect } from "react";
import { Box, VStack, useColorMode } from "@chakra-ui/react";
import * as Tone from "tone";
import { analyser } from "../audio/analyser";
import FilterSelector from "./FilterSelector";
import type { filterType } from "../types";

type ChaosPadProps = {
    size?: number;
};

export default function ChaosPad({ size = 300 }: ChaosPadProps) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [filterType, setFilterType] = useState<filterType>("none");
    const padRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const { colorMode } = useColorMode();

    const micRef = useRef<Tone.UserMedia | null>(null);
    const delayRef = useRef<Tone.FeedbackDelay | null>(null);
    const reverbRef = useRef<Tone.Freeverb | null>(null);

    useEffect(() => {
        const setup = async () => {
            micRef.current = new Tone.UserMedia();
            await micRef.current.open();

            delayRef.current = new Tone.FeedbackDelay({
                delayTime: 0.2,
                feedback: 0.3,
                wet: 0,
            });

            reverbRef.current = new Tone.Freeverb({
                roomSize: 0.5,
                dampening: 2000,
                wet: 0,
            });

            // 初期は直接スピーカーへ
            micRef.current.connect(analyser);
            analyser.connect(Tone.Destination);
        };

        setup();

        // Cleanup: タブ切替などでコンポーネントが外れたらマイクを閉じる
        return () => {
            if (micRef.current) {
                micRef.current.disconnect();
                micRef.current.close(); // ← マイク解放
                micRef.current = null;
            }
        };
    }, []);

    // エフェクト切替
    useEffect(() => {
        if (!micRef.current || !delayRef.current || !reverbRef.current) return;

        micRef.current.disconnect();

        if (filterType === "delay") {
            micRef.current.connect(delayRef.current);
            delayRef.current.connect(analyser);
        } else if (filterType === "reverb") {
            micRef.current.connect(reverbRef.current);
            reverbRef.current.connect(analyser);
        } else {
            micRef.current.connect(analyser);
        }
    }, [filterType]);

    const updateEffect = (clientX: number, clientY: number) => {
        if (!padRef.current) return;
        const rect = padRef.current.getBoundingClientRect();
        const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
        const y = Math.min(Math.max(0, clientY - rect.top), rect.height);

        setPosition({ x, y });
        const normX = x / rect.width;
        const normY = 1 - y / rect.height;

        if (filterType === "delay" && delayRef.current) {
            delayRef.current.wet.value = normY;
            delayRef.current.delayTime.value = 0.05 + normX * 0.5;
            delayRef.current.feedback.value = normY * 0.8;
        }
        if (filterType === "reverb" && reverbRef.current) {
            reverbRef.current.wet.value = normY;
            reverbRef.current.roomSize.value = normX;
        }
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            updateEffect(clientX, clientY);
        });
    };

    return (
        <VStack spacing={4}>
            <FilterSelector value={filterType} onChange={setFilterType} />
            <Box
                style={{ touchAction: "none" }}
                ref={padRef}
                w={size}
                h={size}
                bg={colorMode === "light" ? "gray.300" : "gray.700"}
                borderRadius="md"
                position="relative"
                onMouseDown={(e) => handleMove(e.clientX, e.clientY)}
                onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    handleMove(touch.clientX, touch.clientY);
                }}
                onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    handleMove(touch.clientX, touch.clientY);
                }}
            >
                {position && (
                    <Box
                        position="absolute"
                        left={`${position.x - 10}px`}
                        top={`${position.y - 10}px`}
                        w="20px"
                        h="20px"
                        bg="teal.300"
                        borderRadius="full"
                        pointerEvents="none"
                    />
                )}
            </Box>
        </VStack>
    );
};
