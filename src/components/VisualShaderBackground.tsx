// src/components/VisualWaveform.tsx
import { useEffect, useRef } from "react";
import { analyser } from "../audio/analyser";

const frag = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_waveform;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  // 波形データを横軸に対応させてサンプリング
  float wave = texture2D(u_waveform, vec2(uv.x, 0.0)).r;

  // 0..1 → -1..1 に戻す
  wave = wave * 2.0 - 1.0;

  // y位置と波形の距離で線っぽくする
  float dist = abs(uv.y - (0.5 - wave * 0.4));
  float line = smoothstep(0.02, 0.0, dist);

  vec3 bg = vec3(0.05, 0.05, 0.1);
  vec3 fg = vec3(0.0, 1.0, 1.0);

  gl_FragColor = vec4(mix(bg, fg, line), 1.0);
}
`;

const vert = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export default function VisualWaveform() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const gl = canvas.getContext("webgl")!;
        if (!gl) return;

        // コンパイル関数
        const compile = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(s));
            }
            return s;
        };

        // シェーダープログラム作成
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

        // フルスクリーンクアッド
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1, 1, -1, -1, 1,
                1, -1, 1, 1, -1, 1
            ]),
            gl.STATIC_DRAW
        );
        const loc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        // Uniform locations
        const uRes = gl.getUniformLocation(program, "u_resolution");
        const uWave = gl.getUniformLocation(program, "u_waveform");

        // 波形テクスチャ
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // リサイズ対応
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener("resize", resize);

        const loop = () => {
            const values = analyser.getValue() as Float32Array;
            const data = new Uint8Array(values.length);
            for (let i = 0; i < values.length; i++) {
                data[i] = Math.floor((values[i] + 1) * 127.5);
            }

            // 波形をテクスチャとしてアップロード
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.LUMINANCE,
                values.length,
                1,
                0,
                gl.LUMINANCE,
                gl.UNSIGNED_BYTE,
                data
            );

            gl.useProgram(program);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1i(uWave, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            requestAnimationFrame(loop);
        };
        loop();

        return () => {
            window.removeEventListener("resize", resize);
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
                pointerEvents: "none"
            }}
        />
    );
}
