import { useState, useRef, useEffect } from "react";
import { Box, VStack, useColorMode, Flex } from "@chakra-ui/react";
import * as Tone from "tone";
import { analyser } from "../audio/analyser";
import PadFilterSelector from "./PadFilterSelector";
import type { padFilterType } from "../types";

type ChaosPadProps = {
    size?: number;
};

export default function ChaosPad({ size = 300 }: ChaosPadProps) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [padFilterType, setPadFilterType] = useState<padFilterType>("none");
    const padRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const { colorMode } = useColorMode();

    const micRef = useRef<Tone.UserMedia | null>(null);
    const gateRef = useRef<Tone.Gate | null>(null);
    const delayRef = useRef<Tone.FeedbackDelay | null>(null);
    const reverbRef = useRef<Tone.Freeverb | null>(null);
    const pitchShiftRef = useRef<Tone.PitchShift | null>(null);

    useEffect(() => {
        const setup = async () => {
            micRef.current = new Tone.UserMedia();
            await micRef.current.open();

            gateRef.current = new Tone.Gate(-60); // -60dB以下をカット
            delayRef.current = new Tone.FeedbackDelay({
                delayTime: 0.2,
                feedback: 0.3,
                wet: 0,
            });
            reverbRef.current = new Tone.Freeverb({
                roomSize: 0.5,
                dampening: 1000,
                wet: 0,
            });
            pitchShiftRef.current = new Tone.PitchShift({
                pitch: 0, // 半音単位
                wet: 0.8,
                feedback: 0.0,
            });

            // 初期は Gate → Analyser
            micRef.current.connect(analyser);
            //micRef.current.connect(gateRef.current);
            //gateRef.current.connect(analyser);
            analyser.connect(Tone.getDestination());
        };

        setup();

        return () => {
            if (micRef.current) {
                micRef.current.disconnect();
                micRef.current.close();
                micRef.current = null;
            }
        };
    }, []);

    // フィルター切替
    useEffect(() => {
        if (!micRef.current || !gateRef.current || !delayRef.current || !reverbRef.current || !pitchShiftRef.current) return;

        micRef.current.disconnect();
        gateRef.current.disconnect();

        if (padFilterType === "delay") {
            micRef.current.connect(gateRef.current);
            gateRef.current.connect(delayRef.current);
            delayRef.current.connect(analyser);
        } else if (padFilterType === "reverb") {
            micRef.current.connect(gateRef.current);
            gateRef.current.connect(reverbRef.current);
            reverbRef.current.connect(analyser);
        } else if (padFilterType === "pitchshift") {
            micRef.current.connect(gateRef.current);
            gateRef.current.connect(pitchShiftRef.current);
            pitchShiftRef.current.connect(analyser);
        } else {
            micRef.current.connect(gateRef.current);
            gateRef.current.connect(analyser);
        }
    }, [padFilterType]);

    const updateEffect = (clientX: number, clientY: number) => {
        if (!padRef.current) return;
        const rect = padRef.current.getBoundingClientRect();
        const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
        const y = Math.min(Math.max(0, clientY - rect.top), rect.height);

        setPosition({ x, y });
        const normX = x / rect.width;
        const normY = 1 - y / rect.height;

        if (padFilterType === "delay" && delayRef.current) {
            delayRef.current.wet.value = normY;
            delayRef.current.delayTime.value = 0.05 + normY * 0.5;
            delayRef.current.feedback.value = normX * 0.7;
        }
        if (padFilterType === "reverb" && reverbRef.current) {
            reverbRef.current.wet.value = normY;
            reverbRef.current.roomSize.value = normY;
            reverbRef.current.dampening = 20 + normX * (5000 - 20);
        }
        if (padFilterType === "pitchshift" && pitchShiftRef.current) {
            pitchShiftRef.current.pitch = -12 + normX * 24; // X軸: -12〜+12半音
            pitchShiftRef.current.feedback.value = normY * 0.7;         // Y軸: 0〜1
        }
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            updateEffect(clientX, clientY);
        });
    };

    return (
        <Flex
            direction="column"
            justify="space-between"
            align="center"
            w="100%"
            h="100%" // 親の高さに合わせる
            maxH="calc(100vh - 100px)" // ヘッダー分を引いた高さ
            py={10} // 上下に余白をつけてベタ付き防止
        >
            <VStack spacing={4}>
                <PadFilterSelector value={padFilterType} onChange={setPadFilterType} />
            </VStack>
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

        </Flex>
    );
};
