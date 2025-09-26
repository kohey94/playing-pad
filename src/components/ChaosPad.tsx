import React, { useState, useRef, useEffect } from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import * as Tone from "tone";
import { analyser } from "../audio/analyser";

type ChaosPadProps = {
    size?: number;
    onChange?: (x: number, y: number) => void;
};

const ChaosPad: React.FC<ChaosPadProps> = ({ size = 300, onChange }) => {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const padRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const { colorMode } = useColorMode();

    // シンセ
    const synthRef = useRef<Tone.Synth | null>(null);
    if (!synthRef.current) {
        synthRef.current = new Tone.Synth().toDestination();
        // 音はそのままスピーカーへ出しつつ、並行してアナライザへも流す
        synthRef.current.connect(analyser);
    }

    const updateSound = (clientX: number, clientY: number) => {
        if (!padRef.current) return;
        const rect = padRef.current.getBoundingClientRect();

        // 枠内にクリップ
        const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
        const y = Math.min(Math.max(0, clientY - rect.top), rect.height);

        setPosition({ x, y });

        const freq = 200 + (x / rect.width) * 800; // 200Hz〜1000Hz
        const volume = -20 + (1 - y / rect.height) * 20; // -20dB〜0dB

        synthRef.current!.frequency.value = freq;
        synthRef.current!.volume.value = volume;

        if (onChange) onChange(x / rect.width, y / rect.height);
    };

    // move イベントを requestAnimationFrame でラップ
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
                e.preventDefault(); // ← スクロール防止
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
                    willChange="transform" // ← GPUヒントで滑らかに
                />
            )}
        </Box>
    );
};

export default ChaosPad;