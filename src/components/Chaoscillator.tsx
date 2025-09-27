import { useState, useRef, useEffect } from "react";
import { Box, VStack, useColorMode, Flex } from "@chakra-ui/react";
import * as Tone from "tone";
import { analyser } from "../audio/analyser";
import WaveformSelector from "./WaveformSelector";
import FilterSelector from "./FilterSelector";
import type { filterType, waveform } from "../types";

type ChaoscillatorProps = {
    size?: number;
    onChange?: (x: number, y: number) => void;
};

export default function Chaoscillator({ size = 300, onChange }: ChaoscillatorProps) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const padRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const { colorMode } = useColorMode();

    // 選択中の波形とフィルター
    const [waveform, setWaveform] = useState<waveform>("sine");
    const [filterType, setFilterType] = useState<filterType>("none");

    // シンセとフィルター
    const synthRef = useRef<Tone.Synth | null>(null);
    const delayRef = useRef<Tone.FeedbackDelay | null>(null);
    const reverbRef = useRef<Tone.Freeverb | null>(null);

    // 1オクターブの音階（C4〜C5）
    const notes = [
        "C5", "C#5", "D5", "D#5", "E5", "F5",
        "F#5", "G5", "G#5", "A5", "A#5", "B5", "C6"
    ];

    if (!synthRef.current) {
        synthRef.current = new Tone.Synth({
            oscillator: { type: waveform },
        });

        delayRef.current = new Tone.FeedbackDelay({
            delayTime: 0.2,
            feedback: 0.3,
            wet: 0,
        });

        reverbRef.current = new Tone.Freeverb({
            roomSize: 0.5,
            dampening: 3000,
            wet: 0,
        });
    }

    // 波形切り替え
    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.oscillator.type = waveform;
        }
    }, [waveform]);

    // エフェクト切り替え（接続を張り直す）
    useEffect(() => {
        if (!synthRef.current || !delayRef.current || !reverbRef.current) return;

        // 既存の接続をすべて解除
        synthRef.current.disconnect();

        if (filterType === "delay") {
            synthRef.current.connect(delayRef.current);
            delayRef.current.connect(analyser);
        } else if (filterType === "reverb") {
            synthRef.current.connect(reverbRef.current);
            reverbRef.current.connect(analyser);
        } else {
            synthRef.current.connect(analyser);
        }

        // analyser は最後にスピーカーへ
        analyser.connect(Tone.getDestination());
    }, [filterType]);

    const updateSound = (clientX: number, clientY: number) => {
        if (!padRef.current) return;
        const rect = padRef.current.getBoundingClientRect();

        const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
        const y = Math.min(Math.max(0, clientY - rect.top), rect.height);

        setPosition({ x, y });

        // --- X軸を音階にスナップ ---
        // --- X軸を周波数に連続マッピング ---
        const minFreq = 200;   // 下限の周波数
        const maxFreq = 1000;  // 上限の周波数

        const freq = minFreq + (x / rect.width) * (maxFreq - minFreq);
        synthRef.current!.frequency.value = freq;

        // Y座標を 0〜1 に正規化（下0、上1）
        const normY = 1 - y / rect.height;

        if (filterType === "delay" && delayRef.current) {
            delayRef.current.wet.value = normY;
            delayRef.current.delayTime.value = 0.05 + normY * 0.5;
            delayRef.current.feedback.value = normY * 0.7;
        }
        if (filterType === "reverb" && reverbRef.current) {
            reverbRef.current.wet.value = normY; // 上に行くほどリバーブ強く
            reverbRef.current.roomSize.value = normY; // 部屋の広さも大きく
            //reverbRef.current.dampening = 500 + normY * 5000; // 高音の残響も変化
        }

        if (onChange) onChange(x / rect.width, y / rect.height);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            updateSound(clientX, clientY);
        });
    };

    const handlePress = (clientX: number, clientY: number) => {
        Tone.start();
        handleMove(clientX, clientY);

        const rect = padRef.current!.getBoundingClientRect();
        const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
        const freq = 200 + (x / rect.width) * 800;
        const note = Tone.Frequency(freq).toNote();

        synthRef.current!.triggerAttack(note);
    };

    const handleRelease = () => {
        setPosition(null);
        synthRef.current!.triggerRelease();
    };

    useEffect(() => {
        const mouseUp = () => handleRelease();
        const touchEnd = () => handleRelease();

        window.addEventListener("mouseup", mouseUp);
        window.addEventListener("touchend", touchEnd);

        return () => {
            window.removeEventListener("mouseup", mouseUp);
            window.removeEventListener("touchend", touchEnd);
        };
    }, []);

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
                {/* 波形切り替え */}
                <WaveformSelector value={waveform} onChange={setWaveform} />
                {/* フィルター切り替え */}
                <FilterSelector value={filterType} onChange={setFilterType} />
            </VStack>

            {/* カオスパッド */}
            <Box
                style={{ touchAction: "none" }}
                ref={padRef}
                w={size}
                h={size}
                bg={colorMode === "light" ? "gray.300" : "gray.700"}
                borderRadius="md"
                position="relative"
                onMouseDown={(e) => handlePress(e.clientX, e.clientY)}
                onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    handlePress(touch.clientX, touch.clientY);
                }}
                onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    handleMove(touch.clientX, touch.clientY);
                }}
                onTouchEnd={handleRelease}
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
        </Flex >
    );
};
