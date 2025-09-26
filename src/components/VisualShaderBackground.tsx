import React, { useEffect, useRef } from "react";
import { analyser } from "../audio/analyser";

// 簡単なフラグメントシェーダ（u_levelで色や動きを変化）
const frag = `#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_level;

float circle(vec2 uv, vec2 p, float r){
  return smoothstep(r, r-0.005, length(uv - p));
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy);     // 0..1
  uv -= 0.5;
  uv.x *= u_resolution.x / u_resolution.y;

  // ベースの動き（u_levelでスピードと色味を変化）
  float t = u_time * (0.6 + u_level * 1.8);
  float w = 0.8 + 0.4*sin(t + uv.x*3.5);
  float v = 0.5 + 0.5*sin(uv.x*8.0 + uv.y*6.0 + t*2.0);

  // 幾何模様にレベルでコントラスト付与
  float pattern = sin(uv.x*10.0 + t)*cos(uv.y*10.0 - t);
  float glow = 0.5 + 0.5*pattern;
  glow = pow(glow, 1.0 + u_level*2.0);

  vec3 col = mix(vec3(0.06,0.09,0.14), vec3(0.1,0.6,0.7), v*w);
  col += glow * vec3(0.05, 0.15 + u_level*0.6, 0.25 + u_level*0.7);

  gl_FragColor = vec4(col, 1.0);
}
`;

const vert = `
attribute vec2 a_position;
void main(){
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export default function VisualShaderBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const uni = useRef<{ [k: string]: WebGLUniformLocation | null }>({});
    const startTime = useRef<number>(performance.now());
    const rafRef = useRef<number | null>(null);

    // WebGL 初期化
    useEffect(() => {
        const canvas = canvasRef.current!;
        const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
        if (!gl) return;

        glRef.current = gl;

        // DPR に合わせてリサイズ（上限つけてモバイル負荷を下げる）
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2); // 上限2
            const w = Math.floor(canvas.clientWidth * dpr);
            const h = Math.floor(canvas.clientHeight * dpr);
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        // シェーダのコンパイル
        const compile = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(s));
            }
            return s;
        };
        const v = compile(gl.VERTEX_SHADER, vert);
        const f = compile(gl.FRAGMENT_SHADER, frag);

        const program = gl.createProgram()!;
        gl.attachShader(program, v);
        gl.attachShader(program, f);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
        }
        gl.useProgram(program);
        programRef.current = program;

        // フルスクリーン四角形
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        // 2D クリップ空間の四角形
        const quad = new Float32Array([
            -1, -1, 1, -1, -1, 1,
            1, -1, 1, 1, -1, 1,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        // ユニフォーム
        uni.current.u_time = gl.getUniformLocation(program, "u_time");
        uni.current.u_resolution = gl.getUniformLocation(program, "u_resolution");
        uni.current.u_level = gl.getUniformLocation(program, "u_level");

        // 描画ループ
        const loop = () => {
            const t = (performance.now() - startTime.current) / 1000;
            const w = canvas.width, h = canvas.height;

            // オーディオレベル計算（0..1）
            // Tone.Analyser("waveform") → 値は -1..1
            const arr = analyser.getValue() as Float32Array | number[];
            let sum = 0;
            for (let i = 0; i < arr.length; i++) {
                const v = typeof arr[i] === "number" ? (arr[i] as number) : (arr[i] as any);
                sum += v * v;
            }
            const rms = Math.sqrt(sum / arr.length);    // 0..1 目安
            const level = Math.min(rms * 1.8, 1.0);     // 少し持ち上げ

            gl.useProgram(program);
            gl.uniform1f(uni.current.u_time, t);
            gl.uniform2f(uni.current.u_resolution, w, h);
            gl.uniform1f(uni.current.u_level, level);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            ro.disconnect();
            gl.deleteProgram(programRef.current!);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                pointerEvents: "none", // 背景なので操作を通す
            }}
        />
    );
}
