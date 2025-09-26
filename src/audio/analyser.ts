import * as Tone from "tone";

// 波形を 1024 サンプルで取る（FFTでもOK）
export const analyser = new Tone.Analyser("waveform", 1024);
