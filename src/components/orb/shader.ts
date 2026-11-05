// The orb's WebGL shaders. A full-canvas quad draws a softly lit sphere
// whose surface drifts with 3D simplex noise. Loudness swells it; the low,
// mid, and high frequency bands ripple its edge at three scales and add fine
// shimmer to its surface. Each voice sets the colours and the texture.
//
// No imports: scripts/render-art.ts loads this file with Node to render the
// still images shown before WebGL starts and when it isn't available.

/** The moment the still images are rendered at, so the hand-off is seamless. */
export const STILL_TIME = 4;
/** Sphere radius as a share of the canvas half-width; the rest is glow. */
export const ORB_RADIUS = 0.6;

export const vertexSource = /* glsl */ `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const fragmentSource = /* glsl */ `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uLevel;
uniform vec3 uBands;
uniform vec3 uCore;
uniform vec3 uMid;
uniform vec3 uEdge;
uniform vec3 uAccent;
uniform vec3 uTexture; // scale, flow, ripple
uniform float uQuiet;
uniform float uRadius;
uniform float uGrain;

// Simplex noise, 3D (Ashima Arts / Stefan Gustavson, MIT licence).
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  float minRes = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * minRes);
  float r = length(p);

  float scale = uTexture.x;
  float flow = uTexture.y;
  float ripple = uTexture.z;
  float t = uTime * flow;

  // Slow breathing at rest; a quiet orb breathes slower and smaller.
  float breathSpeed = mix(0.84, 0.5, uQuiet);
  float breath = sin(uTime * breathSpeed);
  float swell = 0.022 * breath * (1.0 - 0.6 * uQuiet) + 0.12 * uLevel + 0.045 * uBands.x;
  float R = uRadius * (1.0 + swell);

  // Edge ripple: low, mid, and high bands at three scales.
  vec2 dir = r > 0.0001 ? p / r : vec2(1.0, 0.0);
  float e1 = snoise(vec3(dir * 1.15, t * 0.22));
  float e2 = snoise(vec3(dir * 2.6 + 7.0, t * 0.55));
  float e3 = snoise(vec3(dir * 6.0 + 19.0, t * 1.3));
  float edgeMove = e1 * (0.012 + 0.03 * uBands.x * ripple)
                 + e2 * (0.004 + 0.034 * uBands.y * ripple)
                 + e3 * (0.0015 + 0.02 * uBands.z * ripple);
  float Rr = R * (1.0 + edgeMove);
  float d = r - Rr;

  float aa = 2.2 / minRes;
  float inside = 1.0 - smoothstep(-aa, aa, d);

  vec3 color = vec3(0.0);
  if (inside > 0.0) {
    float rn = clamp(r / Rr, 0.0, 1.0);
    float z = sqrt(max(0.0, 1.0 - rn * rn));
    vec3 n = normalize(vec3(p / Rr, z));

    // Rotate the surface slowly so the pattern drifts across it.
    float ang = t * 0.08;
    mat3 rot = mat3(cos(ang), 0.0, -sin(ang), 0.0, 1.0, 0.0, sin(ang), 0.0, cos(ang));
    vec3 sp = rot * n;

    // Domain-warped noise gives soft, silky colour washes.
    vec3 q = sp * scale * 0.6;
    vec3 w = vec3(
      snoise(q + vec3(0.0, t * 0.10, 0.0)),
      snoise(q + vec3(5.2, 1.3, t * 0.08)),
      snoise(q + vec3(2.1, -t * 0.09, 7.7))
    );
    float f = snoise(q * 0.9 + w * (0.55 + 0.5 * uBands.y));
    float g = snoise(q * 0.7 - w * 0.4 + 3.0);
    float shimmer = snoise(sp * scale * 3.2 - vec3(t * 0.45)) * uBands.z;

    vec3 L = normalize(vec3(-0.45, 0.6, 0.66));
    float diffuse = clamp(dot(n, L), 0.0, 1.0);
    float fresnel = pow(1.0 - z, 2.2);

    float depth = smoothstep(0.0, 1.0, 1.0 - z) * 0.55 + smoothstep(-0.35, 1.0, -f) * 0.45;
    color = mix(uMid, uEdge, depth);
    color = mix(color, uAccent, smoothstep(-0.4, 1.0, g) * 0.45);
    color = mix(color, uCore, smoothstep(0.05, 1.0, diffuse) * (0.62 + 0.22 * f) + uLevel * 0.12);
    color = mix(color, uCore, smoothstep(0.35, 1.0, diffuse) * 0.22);
    color += uCore * pow(diffuse, 7.0) * 0.14;
    // A luminous rim, as if lit from inside.
    color = mix(color, mix(uCore, uMid, 0.35), fresnel * 0.5);
    color += shimmer * 0.05 + uBands.y * f * 0.025;
    color *= 0.97 + 0.08 * uLevel;

    float grey = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(grey) * vec3(1.04, 1.0, 0.95), 0.4 * uQuiet);
    color *= 1.0 - 0.08 * uQuiet;

    color += (hash(gl_FragCoord.xy + fract(uTime * 0.37) * 91.0) - 0.5) * uGrain;
  }

  // Soft glow around the orb.
  float outside = max(d, 0.0);
  float glow = exp(-outside * 3.3) * (0.5 + 0.32 * uLevel) * (1.0 - 0.6 * uQuiet);
  glow *= smoothstep(1.0, 0.64, r);
  vec3 glowColor = mix(uMid, uCore, 0.2);

  float alpha = inside + (1.0 - inside) * glow;
  vec3 premultiplied = color * inside + glowColor * glow * (1.0 - inside);
  gl_FragColor = vec4(premultiplied, alpha);
}
`;
