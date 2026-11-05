// The live WebGL orb. Loaded after first paint; until then, and whenever
// WebGL is unavailable, the Orb component shows a rendered still instead.

import { getEngine } from '~/lib/audio/engine';
import { ORB_RADIUS, STILL_TIME, fragmentSource, vertexSource } from './shader';

export type OrbLook = {
  core: string;
  mid: string;
  edge: string;
  accent: string;
  scale: number;
  flow: number;
  ripple: number;
};

const MAX_PIXELS = 1_500_000;

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

type Values = { core: number[]; mid: number[]; edge: number[]; accent: number[]; texture: number[] };

function toValues(look: OrbLook): Values {
  return {
    core: hexToRgb(look.core),
    mid: hexToRgb(look.mid),
    edge: hexToRgb(look.edge),
    accent: hexToRgb(look.accent),
    texture: [look.scale, look.flow, look.ripple]
  };
}

function lerp(a: number[], b: number[], k: number) {
  return a.map((value, i) => value + (b[i] - value) * k);
}

export type OrbRenderer = {
  setLook(look: OrbLook): void;
  setQuiet(quiet: boolean): void;
  setReactive(reactive: boolean): void;
  start(): void;
  stop(): void;
  destroy(): void;
};

export function createOrbRenderer(
  canvas: HTMLCanvasElement,
  options: { look: OrbLook; quiet: boolean; reactive: boolean; onFirstFrame: () => void }
): OrbRenderer | null {
  const context = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power'
  });
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('[orb]', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertexSource);
  const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    res: u('uRes'),
    time: u('uTime'),
    level: u('uLevel'),
    bands: u('uBands'),
    core: u('uCore'),
    mid: u('uMid'),
    edge: u('uEdge'),
    accent: u('uAccent'),
    texture: u('uTexture'),
    quiet: u('uQuiet'),
    radius: u('uRadius'),
    grain: u('uGrain')
  };
  gl.uniform1f(uniforms.radius, ORB_RADIUS);
  gl.uniform1f(uniforms.grain, 0.03);

  let current = toValues(options.look);
  let target = current;
  let quiet = options.quiet ? 1 : 0;
  let quietTarget = quiet;
  let reactive = options.reactive;
  let running = false;
  let frame = 0;
  let firstFrame = true;
  let last = 0;
  // Animation time only advances while visible, starting at the still's moment.
  let time = STILL_TIME;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (rect.width * rect.height * dpr * dpr > MAX_PIXELS) {
      dpr = Math.sqrt(MAX_PIXELS / (rect.width * rect.height));
    }
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };
  const observer = new ResizeObserver(() => {
    resize();
    if (!running) draw(0);
  });
  observer.observe(canvas);
  resize();


  function draw(dt: number) {
    const k = 1 - Math.exp(-dt * 2.6);
    current = {
      core: lerp(current.core, target.core, k),
      mid: lerp(current.mid, target.mid, k),
      edge: lerp(current.edge, target.edge, k),
      accent: lerp(current.accent, target.accent, k),
      texture: lerp(current.texture, target.texture, k)
    };
    quiet += (quietTarget - quiet) * k;
    const levels = reactive
      ? getEngine().levels(performance.now())
      : { level: 0, low: 0, mid: 0, high: 0 };
    gl.uniform2f(uniforms.res, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.level, levels.level);
    gl.uniform3f(uniforms.bands, levels.low, levels.mid, levels.high);
    gl.uniform3fv(uniforms.core, current.core);
    gl.uniform3fv(uniforms.mid, current.mid);
    gl.uniform3fv(uniforms.edge, current.edge);
    gl.uniform3fv(uniforms.accent, current.accent);
    gl.uniform3fv(uniforms.texture, current.texture);
    gl.uniform1f(uniforms.quiet, quiet);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (firstFrame) {
      firstFrame = false;
      options.onFirstFrame();
    }
  }

  const loop = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    time += dt;
    draw(dt);
    frame = requestAnimationFrame(loop);
  };

  return {
    setLook(look) {
      target = toValues(look);
      if (!running) {
        current = target;
        draw(0);
      }
    },
    setQuiet(value) {
      quietTarget = value ? 1 : 0;
    },
    setReactive(value) {
      reactive = value;
    },
    start() {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  };
}
