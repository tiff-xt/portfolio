export const vertex = /* glsl */ `
  attribute vec2 aScatter;
  attribute vec2 aTarget;
  attribute float aSeed;
  attribute float aHot;

  uniform float uTime;
  uniform float uProgress;
  uniform float uScroll;
  uniform vec2  uMouse;
  uniform float uMouseStrength;
  uniform float uRadius;
  uniform float uPixelRatio;
  uniform float uSize;

  varying float vHot;
  varying float vForm;
  varying float vPush;

  float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }

  void main() {
    // Staggered morph: each point leaves on its own schedule.
    float local = clamp(uProgress * 1.6 - aSeed * 0.6, 0.0, 1.0);
    float form = easeOutCubic(local) * (1.0 - uScroll);
    vec2 p = mix(aScatter, aTarget, form);

    // Idle drift, larger while scattered so the plot breathes.
    float amp = mix(5.0, 1.2, form);
    p += vec2(sin(uTime * 0.6 + aSeed * 41.0), cos(uTime * 0.5 + aSeed * 29.0)) * amp;

    // Pointer brush: radial push with a swirl, like dragging through data.
    vec2 d = p - uMouse;
    float dist = length(d) + 0.0001;
    float push = smoothstep(uRadius, 0.0, dist) * uMouseStrength;
    vec2 dir = d / dist;
    p += (dir * 46.0 + vec2(-dir.y, dir.x) * 18.0) * push;

    vHot = aHot;
    vForm = form;
    vPush = push;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
    float size = uSize * (abs(aHot) > 0.5 ? 1.65 : 1.0) * (1.0 + push * 1.2);
    gl_PointSize = size * uPixelRatio;
  }
`;

export const fragment = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  varying float vHot;
  varying float vForm;
  varying float vPush;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    float alpha = smoothstep(0.5, 0.32, r);
    if (alpha < 0.01) discard;

    vec3 hot = vHot > 0.5 ? uAccent : uAccent2;
    float heat = abs(vHot) > 0.5 ? 1.0 : 0.0;
    // Significant points keep their colour while scattered and fade toward
    // ink as they join the letterforms; the brush re-ignites everything.
    float tint = clamp(heat * (1.0 - vForm * 0.55) + vPush * 0.9, 0.0, 1.0);
    vec3 color = mix(uInk, vPush > 0.05 && heat < 0.5 ? uAccent : hot, tint);
    float a = alpha * mix(0.55, 0.95, max(vForm, heat));
    gl_FragColor = vec4(color, a);
  }
`;
