/* ============================================================
   HERO — THE SHAPES OF THE JOB
   Nine thousand particles that keep becoming the work:
   a return distribution with its 5% tail cut in red, a candle
   chart, a growth series, a scatter with its regression line.

   Click to move to the next shape. Drag to tilt. The cursor
   pushes particles aside wherever it goes.

   The HUD numbers come from a real (numbers-only) GBM engine
   running alongside — same maths as the Risk Lab below.
   ============================================================ */
import * as THREE from 'three';

const DEG = Math.PI / 180;

let spare = null;
function gauss() {
  if (spare !== null) { const s = spare; spare = null; return s; }
  let u, v, s;
  do { u = Math.random() * 2 - 1; v = Math.random() * 2 - 1; s = u * u + v * v; }
  while (s === 0 || s >= 1);
  const f = Math.sqrt(-2 * Math.log(s) / s);
  spare = v * f;
  return u * f;
}
const rnd = (a, b) => a + Math.random() * (b - a);

/* palette */
const GREEN  = [0.00, 0.91, 0.48];
const BRIGHT = [0.45, 1.00, 0.71];
const AMBER  = [1.00, 0.72, 0.24];
const RED    = [1.00, 0.30, 0.37];
const DIM    = [0.10, 0.38, 0.26];

const mixc = (a, b, t, o, i) => {
  o[i]     = a[0] + (b[0] - a[0]) * t;
  o[i + 1] = a[1] + (b[1] - a[1]) * t;
  o[i + 2] = a[2] + (b[2] - a[2]) * t;
};

/* ============================================================
   SHAPE BUILDERS — each fills pos[] and col[] for N particles
   inside a ~4.6 × 2.6 box centred on the origin.
   ============================================================ */

/* 1 · the return distribution, tail amputated at the 5th pctile */
function shapeDistribution(N, pos, col) {
  const SD = 0.72, A = 2.35, BASE = -1.28, CUT = -1.24;
  for (let p = 0; p < N; p++) {
    const i = p * 3, r = Math.random();
    let x, y, z = rnd(-0.16, 0.16);

    if (r < 0.045) {                       /* the VaR marker itself */
      x = CUT + rnd(-0.012, 0.012);
      y = BASE + Math.random() * (A * Math.exp(-CUT * CUT / (2 * SD * SD)) + 0.16);
      mixc(RED, [1, .62, .66], Math.random() * .5, col, i);
    } else {
      x = rnd(-2.25, 2.25);
      const h = A * Math.exp(-x * x / (2 * SD * SD));
      const edge = r < 0.28;               /* particles that draw the curve */
      const u = edge ? rnd(0.955, 1) : Math.pow(Math.random(), 0.8);
      y = BASE + u * h;
      if (x < CUT) mixc(edge ? [1, .5, .55] : RED, DIM, edge ? 0 : (1 - u) * .7, col, i);
      else         mixc(edge ? BRIGHT : GREEN, DIM, edge ? 0 : (1 - u) * .8, col, i);
    }
    pos[i] = x; pos[i + 1] = y; pos[i + 2] = z;
  }
}

/* 2 · candlesticks — a fresh tape every visit */
function shapeCandles(N, pos, col) {
  const M = 15, W = 4.5, cw = W / M;
  const candles = [];
  let px = rnd(-0.5, 0.1);
  for (let c = 0; c < M; c++) {
    const o = px, cl = o + rnd(-0.34, 0.42);
    candles.push({
      x: -W / 2 + cw * (c + 0.5), o, c: cl,
      h: Math.max(o, cl) + rnd(0.05, 0.24),
      l: Math.min(o, cl) - rnd(0.05, 0.24),
      up: cl >= o
    });
    px = cl;
  }
  let lo = 1e9, hi = -1e9;
  candles.forEach(k => { lo = Math.min(lo, k.l); hi = Math.max(hi, k.h); });
  const Y = v => -1.25 + ((v - lo) / (hi - lo || 1)) * 2.5;

  for (let p = 0; p < N; p++) {
    const i = p * 3, k = candles[p % M];
    const body = Math.random() < 0.8;
    let x, y;
    if (body) {
      x = k.x + rnd(-cw * 0.30, cw * 0.30);
      y = Y(Math.min(k.o, k.c)) + Math.random() * Math.max(0.045, Y(Math.max(k.o, k.c)) - Y(Math.min(k.o, k.c)));
    } else {
      x = k.x + rnd(-0.014, 0.014);
      y = Y(k.l) + Math.random() * (Y(k.h) - Y(k.l));
    }
    const base = k.up ? GREEN : RED;
    mixc(base, k.up ? BRIGHT : [1, .55, .6], body ? Math.random() * .35 : .5, col, i);
    pos[i] = x; pos[i + 1] = y; pos[i + 2] = rnd(-0.13, 0.13);
  }
}

/* 3 · the growth series — bars climbing, a bright line on top */
function shapeBars(N, pos, col) {
  const B = 11, W = 4.4, bw = W / B;
  const hts = [];
  for (let b = 0; b < B; b++)
    hts.push(0.35 + (b / (B - 1)) * 1.9 + rnd(-0.16, 0.2));
  const BASE = -1.3;

  for (let p = 0; p < N; p++) {
    const i = p * 3, r = Math.random();
    if (r < 0.16) {                        /* the trend line above the bars */
      const t = Math.random(), b = t * (B - 1);
      const b0 = Math.floor(b), b1 = Math.min(B - 1, b0 + 1);
      const h = hts[b0] + (hts[b1] - hts[b0]) * (b - b0);
      pos[i]     = -W / 2 + bw * (b + 0.5) + rnd(-0.02, 0.02);
      pos[i + 1] = BASE + h + 0.14 + rnd(-0.022, 0.022);
      pos[i + 2] = rnd(-0.05, 0.05);
      mixc(BRIGHT, [1, 1, 1], Math.random() * .4, col, i);
    } else {
      const b = p % B, u = Math.random();
      pos[i]     = -W / 2 + bw * (b + 0.5) + rnd(-bw * 0.32, bw * 0.32);
      pos[i + 1] = BASE + Math.pow(u, 0.9) * hts[b];
      pos[i + 2] = rnd(-0.14, 0.14);
      mixc(DIM, GREEN, u, col, i);
    }
  }
}

/* 4 · scatter with the regression line through it */
function shapeScatter(N, pos, col) {
  const SLOPE = 0.5;
  for (let p = 0; p < N; p++) {
    const i = p * 3, r = Math.random();
    if (r < 0.13) {                        /* the fitted line */
      const x = rnd(-2.2, 2.2);
      pos[i] = x;
      pos[i + 1] = x * SLOPE + rnd(-0.016, 0.016);
      pos[i + 2] = rnd(-0.03, 0.03);
      mixc(BRIGHT, [1, 1, 1], Math.random() * .5, col, i);
    } else {
      const x = rnd(-2.2, 2.2);
      const res = gauss() * 0.4;
      pos[i] = x;
      pos[i + 1] = Math.max(-1.32, Math.min(1.32, x * SLOPE + res));
      pos[i + 2] = rnd(-0.2, 0.2);
      const a = Math.abs(res);
      if (a < 0.22)      mixc(GREEN, BRIGHT, Math.random() * .5, col, i);
      else if (a < 0.62) mixc(GREEN, DIM, (a - 0.22) / 0.4 * .7, col, i);
      else               mixc(AMBER, RED, Math.random() * .4, col, i);
    }
  }
}

const SHAPES = [shapeDistribution, shapeCandles, shapeBars, shapeScatter];

/* ============================================================ */
export function initSim(canvas, onStat) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = (innerWidth < 760 ? 4200 : 9000);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 0.1, 7.9);
  camera.lookAt(0, 0, 0);

  const root = new THREE.Group();
  scene.add(root);

  /* buffers */
  const from    = new Float32Array(N * 3);
  const to      = new Float32Array(N * 3);
  const colFrom = new Float32Array(N * 3);
  const colTo   = new Float32Array(N * 3);
  const delay   = new Float32Array(N);
  const swirl   = new Float32Array(N * 3);
  const phase   = new Float32Array(N);

  for (let p = 0; p < N; p++) {
    delay[p] = Math.random() * 0.35;
    phase[p] = Math.random() * Math.PI * 2;
    const a = Math.random() * Math.PI * 2, m = rnd(0.25, 0.85);
    swirl[p * 3]     = Math.cos(a) * m;
    swirl[p * 3 + 1] = Math.sin(a) * m * 0.7;
    swirl[p * 3 + 2] = rnd(-0.5, 0.5);
  }

  /* start scattered, morph into the first shape on arrival */
  for (let i = 0; i < N * 3; i += 3) {
    from[i] = rnd(-3.4, 3.4); from[i + 1] = rnd(-2.2, 2.2); from[i + 2] = rnd(-1.4, 1.4);
    mixc(DIM, GREEN, Math.random() * .4, colFrom, i);
  }
  let shapeIdx = 0;
  SHAPES[0](N, to, colTo);

  const pos = new THREE.Float32BufferAttribute(new Float32Array(from), 3);
  const col = new THREE.Float32BufferAttribute(new Float32Array(colFrom), 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', pos);
  geo.setAttribute('color', col);
  const cloud = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.023, vertexColors: true, transparent: true, opacity: 0.95,
    sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  root.add(cloud);

  /* a whisper of a floor grid for depth */
  const floor = new THREE.GridHelper(9, 20, 0x0c5238, 0x081f16);
  floor.material.transparent = true;
  floor.material.opacity = 0.14;
  floor.position.y = -1.62;
  root.add(floor);

  /* ---------- morph state ---------- */
  const DUR = 1.35, DMAX = 0.3;
  let t = 0, active = true, holdClock = 0;

  function advance() {
    if (active && t < 0.6) return;
    from.set(to); colFrom.set(colTo);
    shapeIdx = (shapeIdx + 1) % SHAPES.length;
    SHAPES[shapeIdx](N, to, colTo);
    t = 0; active = true;
  }

  /* ---------- interaction ---------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(-9, -9);
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const cur = new THREE.Vector2(999, 999);
  let curK = 0;
  let dragging = false, lastX = 0, userYaw = 0, moved = 0;

  canvas.addEventListener('pointerdown', e => { dragging = true; moved = 0; lastX = e.clientX; });
  addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointerleave', () => { ndc.set(-9, -9); });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    if (dragging) {
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      userYaw = Math.max(-0.32, Math.min(0.32, userYaw + dx * 0.0035));
      lastX = e.clientX;
    }
  });
  canvas.addEventListener('click', () => { if (moved < 6) advance(); });

  /* ---------- honest numbers for the HUD ---------- */
  const stats = { sigma: 30, varPct: 0, probLoss: 0 };
  let sig = 0.30, sigTgt = 0.30, statClock = 9, retarget = 0;
  const T = 96 / 252, MU = 0.09, DRAWS = 4000;

  function priceBook() {
    const drift = (MU - 0.5 * sig * sig) * T, vol = sig * Math.sqrt(T);
    const term = new Float64Array(DRAWS);
    let losses = 0;
    for (let d = 0; d < DRAWS; d++) {
      term[d] = Math.exp(drift + vol * gauss()) - 1;
      if (term[d] < 0) losses++;
    }
    term.sort();
    stats.sigma    = sig * 100;
    stats.varPct    = -term[Math.floor(0.05 * DRAWS)] * 100;
    stats.probLoss = losses / DRAWS * 100;
  }

  /* ---------- loop ---------- */
  let last = performance.now(), visible = true, running = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    camera.position.z = aspect < 1.15 ? 11.6 : 7.9;
    root.position.x   = aspect < 1.15 ? 0.15 : 1.34;
    root.position.y   = aspect < 1.15 ? 0.25 : 0.05;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const parr = pos.array, carr = col.array;

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible) return;
    const time = now * 0.001;

    /* cursor, in the group's own coordinates */
    if (ndc.x > -5) {
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        cur.set(hit.x - root.position.x, hit.y - root.position.y);
        curK += (1 - curK) * 0.1;
      }
    } else curK += (0 - curK) * 0.06;

    /* morph clock */
    if (active) {
      t += dt / DUR;
      if (t >= 1 + DMAX) { active = false; holdClock = 0; }
    } else {
      holdClock += dt;
      if (!reduce && holdClock > 8.2) advance();
    }

    const wob = reduce ? 0 : 0.013;
    for (let p = 0; p < N; p++) {
      const i = p * 3;
      let e = 1, bump = 0;
      if (active) {
        const q = Math.min(1, Math.max(0, (t * (1 + DMAX) - delay[p]) ));
        e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
        bump = Math.sin(Math.PI * Math.min(1, q));
      }
      let x = from[i]     + (to[i]     - from[i])     * e + swirl[i]     * bump * 0.9;
      let y = from[i + 1] + (to[i + 1] - from[i + 1]) * e + swirl[i + 1] * bump * 0.9;
      let z = from[i + 2] + (to[i + 2] - from[i + 2]) * e + swirl[i + 2] * bump * 0.9;

      x += Math.cos(time * 1.1 + phase[p]) * wob;
      y += Math.sin(time * 1.4 + phase[p]) * wob;

      if (curK > 0.02) {
        const dx = x - cur.x, dy = y - cur.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 0.36) {
          const d = Math.sqrt(d2) || 1e-4;
          const f = (1 - d / 0.6) * 0.34 * curK;
          x += (dx / d) * f; y += (dy / d) * f;
        }
      }
      parr[i] = x; parr[i + 1] = y; parr[i + 2] = z;

      if (active) {
        carr[i]     = colFrom[i]     + (colTo[i]     - colFrom[i])     * e;
        carr[i + 1] = colFrom[i + 1] + (colTo[i + 1] - colFrom[i + 1]) * e;
        carr[i + 2] = colFrom[i + 2] + (colTo[i + 2] - colFrom[i + 2]) * e;
      }
    }
    pos.needsUpdate = true;
    if (active) col.needsUpdate = true;

    root.rotation.y += ((userYaw + (reduce ? 0 : Math.sin(time * 0.17) * 0.05)) - root.rotation.y) * 0.05;

    /* the numbers drift like a real tape */
    retarget += dt;
    if (retarget > 3.2) { retarget = 0; sigTgt = rnd(0.17, 0.46); }
    sig += (sigTgt - sig) * 0.02;
    statClock += dt;
    if (statClock > 0.6 && onStat) { statClock = 0; priceBook(); onStat(stats); }

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  /* debug handle — cheap, and priceless when the scene misbehaves */
  window.__vizDiag = () => ({
    t: +t.toFixed(3), active, shapeIdx, holdClock: +holdClock.toFixed(2),
    N, visible, canvasWH: [canvas.width, canvas.height],
    clientWH: [canvas.clientWidth, canvas.clientHeight],
    rootX: root.position.x, camZ: camera.position.z,
    sample: [ +pos.array[0].toFixed(3), +pos.array[1].toFixed(3) ],
    target: [ +to[0].toFixed(3), +to[1].toFixed(3) ]
  });

  return { destroy() { running = false; renderer.dispose(); } };
}
