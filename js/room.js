/* ============================================================
   THE CONTROL ROOM
   Isometric risk desk in WebGL. Live canvas textures on every
   screen, floating glass panels, hover to inspect, drag to orbit.
   ============================================================ */
import * as THREE from 'three';

const G  = '#00e87a', GH = '#6bffb0', RD = '#ff4d5e', AM = '#ffb83d';
const MUTED = '#5e6b65', INK = '#0a100d';

/* ---------- canvas texture factory ---------- */
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  return { c, x: c.getContext('2d'), tex };
}

function roundRect(x, rx, ry, w, h, r) {
  x.beginPath();
  x.moveTo(rx + r, ry);
  x.arcTo(rx + w, ry, rx + w, ry + h, r);
  x.arcTo(rx + w, ry + h, rx, ry + h, r);
  x.arcTo(rx, ry + h, rx, ry, r);
  x.arcTo(rx, ry, rx + w, ry, r);
  x.closePath();
}

/* ---------- painters ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);

function seriesWalk(n, start = 100, vol = 1.6) {
  const out = []; let p = start;
  for (let i = 0; i < n; i++) {
    const o = p, c = p + rnd(-vol, vol) + 0.12;
    out.push({ o, c, h: Math.max(o, c) + rnd(0, vol * .7), l: Math.min(o, c) - rnd(0, vol * .7) });
    p = c;
  }
  return out;
}

function paintCandles(x, w, h, st) {
  x.clearRect(0, 0, w, h);
  x.fillStyle = INK; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(0,232,122,.08)'; x.lineWidth = 1;
  for (let i = 1; i < 5; i++) { const y = h / 5 * i; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }

  const d = st.data, n = d.length;
  let hi = -1e9, lo = 1e9;
  d.forEach(k => { hi = Math.max(hi, k.h); lo = Math.min(lo, k.l); });
  const pad = (hi - lo) * .12 || 1; hi += pad; lo -= pad;
  const Y = v => h - ((v - lo) / (hi - lo)) * h;
  const cw = w / n;

  d.forEach((k, i) => {
    const up = k.c >= k.o, cx = i * cw + cw / 2;
    x.strokeStyle = up ? G : RD; x.fillStyle = up ? G : RD;
    x.lineWidth = Math.max(1, cw * .1);
    x.beginPath(); x.moveTo(cx, Y(k.h)); x.lineTo(cx, Y(k.l)); x.stroke();
    const yo = Y(k.o), yc = Y(k.c);
    x.fillRect(cx - cw * .3, Math.min(yo, yc), cw * .6, Math.max(1.5, Math.abs(yc - yo)));
  });
}

function paintHeat(x, w, h, st) {
  x.clearRect(0, 0, w, h);
  x.fillStyle = INK; x.fillRect(0, 0, w, h);
  const cols = 14, rows = 8, gw = w / cols, gh = h / rows;
  st.cells.forEach((v, i) => {
    const cx = (i % cols) * gw, cy = Math.floor(i / cols) * gh;
    const a = Math.abs(v);
    x.fillStyle = v >= 0 ? `rgba(0,232,122,${.08 + a * .8})` : `rgba(255,77,94,${.08 + a * .8})`;
    x.fillRect(cx + 1, cy + 1, gw - 2, gh - 2);
  });
}

function paintBook(x, w, h, st) {
  x.clearRect(0, 0, w, h);
  x.fillStyle = INK; x.fillRect(0, 0, w, h);
  const rows = 12, rh = h / rows;
  st.book.forEach((r, i) => {
    const y = i * rh, ask = i < rows / 2;
    x.fillStyle = ask ? 'rgba(255,77,94,.16)' : 'rgba(0,232,122,.16)';
    x.fillRect(ask ? w - r * w : 0, y + 1, r * w, rh - 2);
    x.fillStyle = ask ? RD : G;
    x.font = `${Math.round(rh * .62)}px ui-monospace, monospace`;
    x.textAlign = ask ? 'left' : 'right';
    x.fillText((st.base + (ask ? i : -i) * 0.35).toFixed(2), ask ? 6 : w - 6, y + rh * .74);
  });
}

function paintLine(x, w, h, st) {
  x.clearRect(0, 0, w, h);
  x.fillStyle = INK; x.fillRect(0, 0, w, h);
  const d = st.line, n = d.length;
  let hi = Math.max(...d), lo = Math.min(...d);
  const Y = v => h - ((v - lo) / ((hi - lo) || 1)) * h * .82 - h * .09;
  const grd = x.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, 'rgba(0,232,122,.34)'); grd.addColorStop(1, 'rgba(0,232,122,0)');
  x.beginPath(); x.moveTo(0, h);
  d.forEach((v, i) => x.lineTo(i / (n - 1) * w, Y(v)));
  x.lineTo(w, h); x.closePath(); x.fillStyle = grd; x.fill();
  x.beginPath();
  d.forEach((v, i) => i ? x.lineTo(i / (n - 1) * w, Y(v)) : x.moveTo(0, Y(v)));
  x.strokeStyle = GH; x.lineWidth = 2; x.stroke();
}

function paintBars(x, w, h, st) {
  x.clearRect(0, 0, w, h);
  x.fillStyle = INK; x.fillRect(0, 0, w, h);
  const n = st.bars.length, bw = w / n;
  st.bars.forEach((v, i) => {
    const bh = v * h * .88;
    x.fillStyle = v > .78 ? RD : v > .56 ? AM : G;
    x.globalAlpha = .9;
    x.fillRect(i * bw + bw * .18, h - bh, bw * .64, bh);
  });
  x.globalAlpha = 1;
}

/* ---------- framed panel texture ---------- */
function panelTexture(title, sub, painter, w = 512, h = 330) {
  const { c, x, tex } = makeCanvas(w, h);
  const st = {
    data: seriesWalk(34), cells: Array.from({ length: 112 }, () => rnd(-1, 1)),
    book: Array.from({ length: 12 }, () => rnd(.15, 1)), base: rnd(180, 240),
    line: Array.from({ length: 40 }, (_, i) => 50 + Math.sin(i / 4) * 12 + rnd(-5, 5)),
    bars: Array.from({ length: 16 }, () => rnd(.2, 1))
  };

  function draw() {
    x.clearRect(0, 0, w, h);
    /* glass body */
    roundRect(x, 4, 4, w - 8, h - 8, 22);
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(16,26,22,.96)'); g.addColorStop(1, 'rgba(7,12,10,.93)');
    x.fillStyle = g; x.fill();
    x.strokeStyle = 'rgba(0,232,122,.32)'; x.lineWidth = 2; x.stroke();

    /* header */
    x.fillStyle = MUTED;
    x.font = '600 17px Inter, system-ui, sans-serif';
    x.textAlign = 'left';
    x.fillText(title.toUpperCase(), 26, 40);
    x.fillStyle = G; x.font = '15px ui-monospace, monospace';
    x.textAlign = 'right'; x.fillText(sub, w - 26, 40);
    x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(26, 56); x.lineTo(w - 26, 56); x.stroke();

    /* plot area, drawn on an offscreen then blitted */
    const px = 26, py = 70, pw = w - 52, ph = h - 100;
    const off = document.createElement('canvas'); off.width = pw; off.height = ph;
    painter(off.getContext('2d'), pw, ph, st);
    x.save();
    roundRect(x, px, py, pw, ph, 10); x.clip();
    x.drawImage(off, px, py);
    x.restore();
    tex.needsUpdate = true;
  }

  function tick() {
    st.data.shift(); const last = st.data[st.data.length - 1];
    const o = last.c, cl = o + rnd(-1.6, 1.7);
    st.data.push({ o, c: cl, h: Math.max(o, cl) + rnd(0, 1.1), l: Math.min(o, cl) - rnd(0, 1.1) });
    st.cells = st.cells.map(v => THREE.MathUtils.clamp(v + rnd(-.22, .22), -1, 1));
    st.book = st.book.map(v => THREE.MathUtils.clamp(v + rnd(-.16, .16), .12, 1));
    st.line.shift(); st.line.push(st.line[st.line.length - 1] + rnd(-4, 4.2));
    st.bars = st.bars.map(v => THREE.MathUtils.clamp(v + rnd(-.09, .09), .15, 1));
    draw();
  }

  draw();
  return { tex, tick };
}

/* ============================================================ */
export function initRoom(canvas, tagEl, onReady) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050807, 26, 52);

  let frustum = 13;
  const camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 120);
  camera.position.set(17, 15, 17);
  camera.lookAt(0, 2.5, 0);

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0x596761, 2.2));
  const key = new THREE.DirectionalLight(0xf0f7f4, 2.1); key.position.set(9, 16, 7); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbcd0c8, .75); fill.position.set(6, 9, -12); scene.add(fill);
  const rim = new THREE.DirectionalLight(0x00e87a, .55); rim.position.set(-10, 6, -8); scene.add(rim);
  const core = new THREE.PointLight(0x00e87a, 18, 13, 2); core.position.set(0, 2.2, 0); scene.add(core);

  const root = new THREE.Group(); scene.add(root);

  /* ---------- materials ---------- */
  const M = {
    deck:   new THREE.MeshStandardMaterial({ color: 0x25332d, roughness: .82, metalness: .22 }),
    deckHi: new THREE.MeshStandardMaterial({ color: 0x35443d, roughness: .6,  metalness: .35 }),
    desk:   new THREE.MeshStandardMaterial({ color: 0x47594f, roughness: .52, metalness: .3 }),
    dark:   new THREE.MeshStandardMaterial({ color: 0x1a2620, roughness: .9 }),
    body:   new THREE.MeshStandardMaterial({ color: 0x53685f, roughness: .72 }),
    head:   new THREE.MeshStandardMaterial({ color: 0x6d8479, roughness: .68 }),
    neon:   new THREE.MeshBasicMaterial({ color: 0x00e87a }),
    neonS:  new THREE.MeshBasicMaterial({ color: 0x6bffb0 }),
    glass:  new THREE.MeshBasicMaterial({ color: 0x00e87a, transparent: true, opacity: .09, side: THREE.DoubleSide })
  };

  /* ---------- deck ---------- */
  const deck = new THREE.Mesh(new THREE.BoxGeometry(19, .7, 15), M.deck);
  deck.position.y = -.35; root.add(deck);

  const inlay = new THREE.Mesh(new THREE.BoxGeometry(17.4, .12, 13.4), M.deckHi);
  inlay.position.y = .03; root.add(inlay);

  /* neon rim strip */
  const strip = (w, d, x0, z0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, .1, d), M.neon);
    m.position.set(x0, .06, z0); root.add(m);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.1, d * 5 + 1.4),
      new THREE.MeshBasicMaterial({ color: 0x00e87a, transparent: true, opacity: .1,
        blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.set(x0, .015, z0); root.add(glow);
  };
  strip(18.4, .14,  0,  7.3); strip(18.4, .14,  0, -7.3);
  const stripZ = (d, w, x0, z0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, .1, d), M.neon);
    m.position.set(x0, .06, z0); root.add(m);
  };
  stripZ(14.6, .14,  9.1, 0); stripZ(14.6, .14, -9.1, 0);

  /* ---------- shared screen textures ---------- */
  const screenPool = [
    panelTexture('', '', paintCandles, 256, 160),
    panelTexture('', '', paintHeat,    256, 160),
    panelTexture('', '', paintBook,    256, 160),
    panelTexture('', '', paintLine,    256, 160)
  ];
  /* strip the frame for desk monitors — redraw raw */
  const rawPool = [paintCandles, paintHeat, paintBook, paintLine, paintBars].map(p => {
    const { c, x, tex } = makeCanvas(224, 140);
    const st = {
      data: seriesWalk(24), cells: Array.from({ length: 112 }, () => rnd(-1, 1)),
      book: Array.from({ length: 12 }, () => rnd(.15, 1)), base: rnd(180, 240),
      line: Array.from({ length: 34 }, (_, i) => 50 + Math.sin(i / 3) * 10 + rnd(-4, 4)),
      bars: Array.from({ length: 16 }, () => rnd(.2, 1))
    };
    const draw = () => { p(x, 224, 140, st); tex.needsUpdate = true; };
    draw();
    return { tex, st, p, draw };
  });

  /* ---------- desks ---------- */
  const deskGeo   = new THREE.BoxGeometry(2.5, .12, 1.15);
  const legGeo    = new THREE.BoxGeometry(.1, .78, .1);
  const monGeo    = new THREE.BoxGeometry(1.05, .66, .05);
  const standGeo  = new THREE.CylinderGeometry(.05, .12, .3, 8);
  const chairGeo  = new THREE.BoxGeometry(.5, .08, .5);
  const backGeo   = new THREE.BoxGeometry(.5, .55, .08);
  const torsoGeo  = new THREE.CapsuleGeometry(.17, .34, 4, 10);
  const headGeo   = new THREE.SphereGeometry(.15, 12, 12);

  let monitorCount = 0;
  function buildDesk(x, z, face) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = face;

    const top = new THREE.Mesh(deskGeo, M.desk); top.position.y = .84; g.add(top);
    [-1.1, 1.1].forEach(dx => {
      const l = new THREE.Mesh(legGeo, M.dark); l.position.set(dx, .39, 0); g.add(l);
    });
    /* under-desk light */
    const ul = new THREE.Mesh(new THREE.BoxGeometry(2.3, .04, .06), M.neon);
    ul.position.set(0, .76, .5); g.add(ul);

    [-.58, .58].forEach(dx => {
      const st = new THREE.Mesh(standGeo, M.dark); st.position.set(dx, .99, -.22); g.add(st);
      const mon = new THREE.Mesh(monGeo, M.dark);
      mon.position.set(dx, 1.45, -.24); mon.rotation.x = -.12; g.add(mon);
      const src = rawPool[monitorCount++ % rawPool.length];
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(.96, .58),
        new THREE.MeshBasicMaterial({ map: src.tex, toneMapped: false }));
      scr.position.set(dx, 1.45, -.205); scr.rotation.x = -.12; g.add(scr);
      const bloom = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0),
        new THREE.MeshBasicMaterial({ color: 0x00e87a, transparent: true, opacity: .07,
          blending: THREE.AdditiveBlending, depthWrite: false }));
      bloom.position.set(dx, 1.45, -.18); bloom.rotation.x = -.12; g.add(bloom);
    });

    const chair = new THREE.Mesh(chairGeo, M.dark); chair.position.set(0, .48, 1.05); g.add(chair);
    const back  = new THREE.Mesh(backGeo, M.dark);  back.position.set(0, .78, 1.28); g.add(back);

    if (Math.random() < .78) {
      const t = new THREE.Mesh(torsoGeo, M.body); t.position.set(rnd(-.12, .12), .82, 1.0); g.add(t);
      const hd = new THREE.Mesh(headGeo, M.head); hd.position.set(t.position.x, 1.21, 1.0); g.add(hd);
      g.userData.person = { t, hd, ph: Math.random() * 6.28 };
    }
    root.add(g);
    return g;
  }

  const desks = [];
  /* left bank + right bank, facing the centre */
  [[-6.4, Math.PI / 2], [6.4, -Math.PI / 2]].forEach(([bx, face]) => {
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 4; i++) {
        desks.push(buildDesk(bx + (row ? (bx < 0 ? -2.2 : 2.2) : 0), -4.6 + i * 3.05, face));
      }
    }
  });
  /* back bank facing forward */
  for (let i = 0; i < 3; i++) desks.push(buildDesk(-3.4 + i * 3.4, -5.6, 0));

  /* ---------- centre dais ---------- */
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, .22, 48), M.deckHi);
  dais.position.y = .14; root.add(dais);
  const daisRing = new THREE.Mesh(new THREE.TorusGeometry(2.52, .035, 8, 64), M.neon);
  daisRing.rotation.x = Math.PI / 2; daisRing.position.y = .26; root.add(daisRing);

  const haloA = new THREE.Mesh(new THREE.TorusGeometry(1.5, .022, 8, 64), M.neonS);
  const haloB = new THREE.Mesh(new THREE.TorusGeometry(1.1, .018, 8, 64), M.neon);
  haloA.position.y = 1.5; haloB.position.y = 1.5;
  haloA.rotation.x = 1.15; haloB.rotation.x = -.8;
  root.add(haloA, haloB);

  /* floating sigma-ish core: an octahedron reading as a risk node */
  const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(.62, 0),
    new THREE.MeshStandardMaterial({ color: 0x00e87a, emissive: 0x00c46a, emissiveIntensity: 1.5,
      roughness: .25, metalness: .6, flatShading: true }));
  coreMesh.position.y = 1.5; root.add(coreMesh);
  const coreCage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0),
    new THREE.MeshBasicMaterial({ color: 0x6bffb0, wireframe: true, transparent: true, opacity: .3 }));
  coreCage.position.y = 1.5; root.add(coreCage);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.9, 2.2, 1.4, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x00e87a, transparent: true, opacity: .06,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  beam.position.y = .8; root.add(beam);

  /* ---------- floating glass panels ---------- */
  const PANELS = [
    { t: 'Exposure heatmap', s: '16 desks',  p: paintHeat,    pos: [-8.4, 5.2, 2.6],  w: 5.4, h: 3.5,
      tag: 'Exposure heatmap', note: 'Net position by desk and asset class, refreshed every tick.' },
    { t: 'Book / depth',     s: 'L2',        p: paintBook,    pos: [ 8.6, 5.6, 1.2],  w: 4.6, h: 3.4,
      tag: 'Order book depth', note: 'Bid–ask ladder. Thin depth is where slippage hides.' },
    { t: 'P&L attribution',  s: 'MTD',       p: paintLine,    pos: [ 7.2, 3.0, -6.4], w: 5.0, h: 3.2,
      tag: 'P&L attribution', note: 'Month-to-date, decomposed into the drivers that moved it.' },
    { t: 'VaR by desk',      s: '95% · 1d',  p: paintBars,    pos: [-7.6, 2.6, -6.0], w: 5.0, h: 3.2,
      tag: 'VaR by desk', note: 'Red bars are desks trading against their limit.' },
    { t: 'NIFTY · 1m',       s: '+1.24%',    p: paintCandles, pos: [ 0.0, 7.4, -4.0], w: 6.2, h: 3.9,
      tag: 'Benchmark tape', note: 'One-minute candles on the index the book is measured against.' }
  ];

  const panelGroup = new THREE.Group(); root.add(panelGroup);
  const panels = PANELS.map(cfg => {
    const { tex, tick } = panelTexture(cfg.t, cfg.s, cfg.p);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cfg.w, cfg.h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
    mesh.position.set(...cfg.pos);
    mesh.userData = { ...cfg, baseY: cfg.pos[1], hover: 0, tick };
    panelGroup.add(mesh);
    return mesh;
  });

  /* connector lines from panels down to the deck */
  panels.forEach(p => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(p.position.x * .72, .2, p.position.z * .72),
      new THREE.Vector3(p.position.x, p.position.y - p.userData.h / 2, p.position.z)
    ]);
    panelGroup.add(new THREE.Line(g, new THREE.LineBasicMaterial({
      color: 0x00e87a, transparent: true, opacity: .16 })));
  });

  /* ---------- interaction ---------- */
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9, -9);
  let hovered = null;
  let dragging = false, lastX = 0, spin = 0.13, targetSpin = 0.13, yaw = -0.35;

  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; });
  addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointerleave', () => { mouse.set(-9, -9); });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    if (dragging) { yaw += (e.clientX - lastX) * .006; lastX = e.clientX; targetSpin = 0; }
  });
  canvas.addEventListener('pointerup', () => { setTimeout(() => targetSpin = 0.13, 1600); });

  /* ---------- resize ---------- */
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    frustum = w < 700 ? 11.2 : 7.9;
    camera.left = -frustum * aspect; camera.right = frustum * aspect;
    camera.top = frustum; camera.bottom = -frustum;
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  /* ---------- loop ---------- */
  let last = performance.now(), acc = 0, poolIdx = 0, visible = false, ready = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!visible) return;

    spin += (targetSpin - spin) * .02;
    if (!dragging) yaw += spin * dt;
    root.rotation.y = yaw;

    coreMesh.rotation.y += dt * .7; coreMesh.rotation.x += dt * .32;
    coreMesh.position.y = 1.5 + Math.sin(now * .0013) * .12;
    coreCage.rotation.y -= dt * .35; coreCage.rotation.z += dt * .2;
    coreCage.position.y = coreMesh.position.y;
    haloA.rotation.z += dt * .5; haloB.rotation.z -= dt * .8;
    core.intensity = 15 + Math.sin(now * .002) * 5;

    /* people idle */
    root.children.forEach(c => {
      const p = c.userData && c.userData.person;
      if (p) { p.t.position.y = .82 + Math.sin(now * .0016 + p.ph) * .012; p.hd.position.y = 1.21 + Math.sin(now * .0016 + p.ph) * .012; }
    });

    /* billboard the panels */
    panels.forEach(p => {
      p.quaternion.copy(camera.quaternion);
      p.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -root.rotation.y));
    });

    /* hover */
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(panels, false)[0];
    const next = hit ? hit.object : null;
    if (next !== hovered) {
      hovered = next;
      if (hovered && tagEl) {
        tagEl.innerHTML = `${hovered.userData.tag}<b>${hovered.userData.note}</b>`;
        tagEl.classList.add('show');
      } else if (tagEl) tagEl.classList.remove('show');
    }
    if (hovered && tagEl) {
      const v = hovered.position.clone().applyMatrix4(root.matrixWorld).project(camera);
      const r = canvas.getBoundingClientRect();
      const px = (v.x * .5 + .5) * r.width, py = (-v.y * .5 + .5) * r.height;
      tagEl.style.left = Math.min(r.width - 250, Math.max(10, px - 100)) + 'px';
      tagEl.style.top  = Math.max(10, py - 74) + 'px';
    }
    panels.forEach(p => {
      const want = p === hovered ? 1 : 0;
      p.userData.hover += (want - p.userData.hover) * .12;
      p.position.y = p.userData.baseY + p.userData.hover * .42;
      p.scale.setScalar(1 + p.userData.hover * .05);
      p.material.opacity = 1;
    });

    /* stagger texture updates so we never redraw everything at once */
    acc += dt;
    if (acc > (reduce ? .6 : .14)) {
      acc = 0;
      panels[poolIdx % panels.length].userData.tick();
      const rp = rawPool[poolIdx % rawPool.length];
      rp.st.data.shift();
      const lastK = rp.st.data[rp.st.data.length - 1];
      const o = lastK.c, cl = o + rnd(-1.5, 1.6);
      rp.st.data.push({ o, c: cl, h: Math.max(o, cl) + rnd(0, 1), l: Math.min(o, cl) - rnd(0, 1) });
      rp.st.cells = rp.st.cells.map(v => THREE.MathUtils.clamp(v + rnd(-.25, .25), -1, 1));
      rp.st.book = rp.st.book.map(v => THREE.MathUtils.clamp(v + rnd(-.18, .18), .12, 1));
      rp.st.line.shift(); rp.st.line.push(rp.st.line[rp.st.line.length - 1] + rnd(-4, 4.2));
      rp.st.bars = rp.st.bars.map(v => THREE.MathUtils.clamp(v + rnd(-.1, .1), .15, 1));
      rp.draw();
      poolIdx++;
    }

    renderer.render(scene, camera);
    if (!ready) { ready = true; onReady && onReady(); }
  }
  requestAnimationFrame(frame);

  return {
    setLift(p) { root.position.y = -1.2 + p * 1.2; camera.zoom = 0.86 + p * 0.16; camera.updateProjectionMatrix(); }
  };
}
