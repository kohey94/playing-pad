import React, { useState, useRef, useEffect } from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import * as Tone from "tone";

type ChaosPadProps = {
    size?: number; // パッドのサイズ (px)
    onChange?: (x: number, y: number) => void; // 座標を外に渡す
};

const ChaosPad: React.FC<ChaosPadProps> = ({ size = 300, onChange }) => {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const padRef = useRef<HTMLDivElement>(null);
    const { colorMode } = useColorMode();

    // シンセを1つ作成
    const synthRef = useRef<Tone.Synth | null>(null);

    if (!synthRef.current) {
        synthRef.current = new Tone.Synth().toDestination();
    }

    const handleMove = (clientX: number, clientY: number) => {
        if (!padRef.current) return;
        const rect = padRef.current.getBoundingClientRect();
        // 枠外に出ても範囲内にクリップ
        const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
        const y = Math.min(Math.max(0, clientY - rect.top), rect.height);
        setPosition({ x, y });

        // X座標を周波数に、Y座標を音量にマッピング
        const freq = 200 + (x / rect.width) * 800; // 200Hz ～ 1000Hz
        const volume = -20 + (1 - y / rect.height) * 20; // -20dB ～ 0dB
        synthRef.current!.frequency.value = freq;
        synthRef.current!.volume.value = volume;

        // 0〜1 の正規化値で外に通知
        if (onChange) {
            onChange(x / rect.width, y / rect.height);
        }
    };

    const handlePress = (clientX: number, clientY: number) => {
        Tone.start(); // 必須: ユーザー操作で AudioContext を開始
        if (!padRef.current) return;

        const rect = padRef.current.getBoundingClientRect();
        const x = Math.min(Math.max(0, clientX - rect.left), rect.width);

        // 押した場所に対応する周波数を計算
        const freq = 200 + (x / rect.width) * 800; // 200Hz ～ 1000Hz
        const note = Tone.Frequency(freq).toNote(); // 周波数を音名に変換

        handleMove(clientX, clientY);

        // 押した位置に応じた音階からスタート
        synthRef.current!.triggerAttack(note);
    };

    const handleRelease = () => {
        setPosition(null);
        synthRef.current!.triggerRelease();
    };

    useEffect(() => {
        const handleMouseUp = () => handleRelease();
        const handleTouchEnd = () => handleRelease();

        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    return (
        <Box
            ref={padRef}
            w={size}
            h={size}
            bg={colorMode === "light" ? "gray.300" : "gray.700"}
            borderRadius="md"
            position="relative"
            onMouseDown={(e) => handlePress(e.clientX, e.clientY)}
            onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX, e.clientY)}
            onMouseUp={handleRelease}

            onTouchStart={(e) => {
                const touch = e.touches[0];
                handlePress(touch.clientX, touch.clientY);
            }}
            onTouchMove={(e) => {
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
    );
};

export default ChaosPad;
