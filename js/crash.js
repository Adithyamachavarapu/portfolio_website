/* ============================================================
   THE CRASH TEST
   Pick a crisis. Give it a portfolio. Watch what the history
   would have done to it, and how long the climb back took.

   Paths are stylised replays — depths, durations and recovery
   times match the record; the day-to-day wiggles are
   illustrative. This is a stress test, not a séance.
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);

export function fmtINR(v) {
  const a = Math.abs(v), sign = v < 0 ? '−' : '';
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(2)} L`;
  if (a >= 1e3) return `${sign}₹${(a / 1e3).toFixed(1)}k`;
  return `${sign}₹${a.toFixed(0)}`;
}

/* deterministic wiggle, so every replay of a crisis is the same crisis */
function prng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* ---------- the record ----------
   segments: [days, level-vs-peak] waypoints, walked with noise. */
export const CRISES = [
  {
    id: '1987', label: 'Black Monday', year: '1987',
    story: '−22.6% in one session. No warning, no headline — just the tape.',
    axis: ['Aug ’87', 'Jul ’88'], recovery: '≈ 23 months', seed: 1987, chop: 0.006,
    segs: [[40, 1.00], [3, 0.76], [16, 0.70], [24, 0.66], [40, 0.73], [110, 0.84]]
  },
  {
    id: '2000', label: 'Dot-com bust', year: '2000–02',
    story: 'The slow one. Three years of lower highs while “eyeballs” became a valuation.',
    axis: ['Mar ’00', 'Mid ’03'], recovery: '≈ 7 years', seed: 2000, chop: 0.010,
    segs: [[70, 0.95], [140, 0.78], [100, 0.86], [170, 0.63], [160, 0.51], [180, 0.62]]
  },
  {
    id: '2008', label: 'Global Financial Crisis', year: '2008–09',
    story: 'Lehman filed on a Monday. By spring the index had lost more than half of itself.',
    axis: ['Oct ’07', 'Jun ’09'], recovery: '≈ 5½ years', seed: 2008, chop: 0.013,
    segs: [[70, 0.92], [110, 0.81], [40, 0.87], [120, 0.72], [35, 0.56], [140, 0.43], [150, 0.58]]
  },
  {
    id: '2016', label: 'Demonetisation', year: '2016',
    story: 'The one everyone in India remembers. Shallow on the chart, seismic at the ATM.',
    axis: ['Nov ’16', 'Mar ’17'], recovery: '≈ 4 months', seed: 2016, chop: 0.005,
    segs: [[16, 1.00], [7, 0.945], [26, 0.925], [22, 0.95], [55, 1.02]]
  },
  {
    id: '2020', label: 'COVID crash', year: '2020',
    story: 'The fastest bear market ever recorded — and one of the fastest recoveries.',
    axis: ['Feb ’20', 'Aug ’20'], recovery: '≈ 5 months', seed: 2020, chop: 0.014,
    segs: [[18, 1.03], [33, 0.66], [40, 0.82], [80, 0.96], [25, 1.02]]
  }
];

function buildSeries(c) {
  const rand = prng(c.seed);
  const smooth = t => t * t * (3 - 2 * t);
  const pts = [0.94];
  let lvl = 0.94;
  c.segs.forEach(([days, end]) => {
    const start = lvl;
    for (let d = 1; d <= days; d++) {
      const base = start + (end - start) * smooth(d / days);
      lvl = base + (rand() - 0.5) * 2 * c.chop * (0.5 + base);
      pts.push(lvl);
    }
    lvl = end;
  });

  /* the arithmetic of pain */
  let runMax = -1e9, peakI = 0, trough = 1e9, troughI = 0;
  const rm = [];
  pts.forEach((v, i) => {
    if (v > runMax) { runMax = v; }
    rm.push(runMax);
  });
  const peak = Math.max(...pts);
  const peakIdx = pts.indexOf(peak);
  pts.forEach((v, i) => { if (i >= peakIdx && v < trough) { trough = v; troughI = i; } });

  return {
    pts, rm,
    maxDD: trough / peak - 1,
    peakI: peakIdx, troughI,
    daysFalling: troughI - peakIdx
  };
}

/* ---------- renderer ---------- */
function draw(canvas, c, S, value, prog) {
  const dpr = Math.min(devicePixelRatio, 2);
  const W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W || !H) return;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const x = canvas.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.clearRect(0, 0, W, H);
  x.fillStyle = '#040706';
  x.fillRect(0, 0, W, H);

  const padL = 54, padR = 18, padT = 20, padB = 32;
  const pw = W - padL - padR, ph = H - padT - padB;

  const peak = Math.max(...S.pts);
  const lo = Math.min(...S.pts) * 0.97, hi = peak * 1.03;
  const X = i => padL + (i / (S.pts.length - 1)) * pw;
  const Y = v => padT + ph - ((v - lo) / (hi - lo)) * ph;
  const n = Math.max(2, Math.floor(prog * S.pts.length));

  /* drawdown gridlines, spoken in % from the peak */
  x.font = '10px ui-monospace, monospace';
  x.textAlign = 'right';
  for (let dd = 0; dd >= -60; dd -= 10) {
    const v = peak * (1 + dd / 100);
    if (v < lo) break;
    const gy = Y(v);
    x.strokeStyle = dd === 0 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.055)';
    x.setLineDash(dd === 0 ? [4, 4] : []);
    x.beginPath(); x.moveTo(padL, gy); x.lineTo(W - padR, gy); x.stroke();
    x.setLineDash([]);
    x.fillStyle = dd === 0 ? 'rgba(255,255,255,.5)' : 'rgba(104,117,111,.8)';
    x.fillText(dd === 0 ? 'peak' : `${dd}%`, padL - 8, gy + 3);
  }

  /* the drawdown — everything between where you were and where you are */
  x.beginPath();
  for (let i = 0; i < n; i++) i ? x.lineTo(X(i), Y(S.rm[i])) : x.moveTo(X(0), Y(S.rm[0]));
  for (let i = n - 1; i >= 0; i--) x.lineTo(X(i), Y(S.pts[i]));
  x.closePath();
  const grd = x.createLinearGradient(0, Y(peak), 0, Y(lo));
  grd.addColorStop(0, 'rgba(255,77,94,.05)');
  grd.addColorStop(1, 'rgba(255,77,94,.34)');
  x.fillStyle = grd; x.fill();

  /* running peak */
  x.setLineDash([3, 5]);
  x.strokeStyle = 'rgba(236,242,238,.3)'; x.lineWidth = 1;
  x.beginPath();
  for (let i = 0; i < n; i++) i ? x.lineTo(X(i), Y(S.rm[i])) : x.moveTo(X(0), Y(S.rm[0]));
  x.stroke();
  x.setLineDash([]);

  /* the price itself, coloured by how deep the hole is */
  x.lineWidth = 2; x.lineJoin = 'round';
  for (let i = 1; i < n; i++) {
    const dd = S.pts[i] / S.rm[i] - 1;
    x.strokeStyle = dd > -0.05 ? '#00e87a' : dd > -0.25 ? '#ffb83d' : '#ff4d5e';
    x.beginPath();
    x.moveTo(X(i - 1), Y(S.pts[i - 1]));
    x.lineTo(X(i), Y(S.pts[i]));
    x.stroke();
  }

  /* max pain */
  if (n > S.troughI) {
    const tx = X(S.troughI), ty = Y(S.pts[S.troughI]);
    x.beginPath(); x.arc(tx, ty, 4.5, 0, 7);
    x.fillStyle = '#ff4d5e'; x.fill();
    x.beginPath(); x.arc(tx, ty, 9, 0, 7);
    x.strokeStyle = 'rgba(255,77,94,.5)'; x.lineWidth = 1; x.stroke();
    x.fillStyle = '#ff8791';
    x.font = '600 11px ui-monospace, monospace';
    x.textAlign = tx > W * 0.7 ? 'right' : 'left';
    x.fillText(
      `max pain ${(S.maxDD * 100).toFixed(1)}% · ${fmtINR(S.maxDD * value)}`,
      tx + (tx > W * 0.7 ? -14 : 14), ty + 4
    );
  }

  /* playhead */
  if (prog < 1) {
    const px = X(n - 1);
    x.strokeStyle = 'rgba(0,232,122,.5)';
    x.beginPath(); x.moveTo(px, padT); x.lineTo(px, padT + ph); x.stroke();
  }

  /* axis */
  x.fillStyle = 'rgba(164,176,170,.75)';
  x.font = '10px ui-monospace, monospace';
  x.textAlign = 'left';  x.fillText(c.axis[0], padL, H - 10);
  x.textAlign = 'right'; x.fillText(c.axis[1], W - padR, H - 10);
  x.textAlign = 'center';
  x.fillStyle = 'rgba(104,117,111,.9)';
  x.fillText(`${c.label} · stylised replay`, padL + pw / 2, H - 10);
}

/* ============================================================ */
export function initCrash() {
  const canvas = $('#crashCanvas');
  if (!canvas) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const el = {
    list:  $('#crisisList'),
    pv:    $('#cpv'),   pvV:  $('#cpvV'),
    dd:    $('#kDD'),   loss: $('#kLoss'),
    fall:  $('#kFall'), rec:  $('#kRec'),
    story: $('#crisisStory'),
    replay: $('#crashReplay')
  };

  /* build the crisis buttons */
  el.list.innerHTML = CRISES.map((c, i) => `
    <button class="crisis${i === 2 ? ' on' : ''}" data-id="${c.id}" data-hot>
      <b>${c.year}</b><span>${c.label}</span>
    </button>`).join('');

  let crisis = CRISES[2];                 // start with the big one
  let S = buildSeries(crisis);
  let prog = 0, raf = null, playing = false;

  const value = () => (+el.pv.value) * 100000;

  function kpis() {
    const v = value();
    el.pvV.textContent  = `₹${(+el.pv.value).toFixed(1)}L`;
    el.dd.textContent   = (S.maxDD * 100).toFixed(1) + '%';
    el.loss.textContent = fmtINR(S.maxDD * v);
    el.fall.textContent = `${S.daysFalling} days`;
    el.rec.textContent  = crisis.recovery;
    el.story.textContent = crisis.story;
  }

  function replay() {
    cancelAnimationFrame(raf);
    if (reduce) { prog = 1; draw(canvas, crisis, S, value(), 1); return; }
    prog = 0; playing = true;
    const t0 = performance.now(), DUR = 2300;
    (function step(now) {
      const k = Math.min(1, (now - t0) / DUR);
      prog = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      draw(canvas, crisis, S, value(), prog);
      if (k < 1) raf = requestAnimationFrame(step);
      else playing = false;
    })(t0);
  }

  el.list.addEventListener('click', e => {
    const b = e.target.closest('.crisis');
    if (!b) return;
    el.list.querySelectorAll('.crisis').forEach(n => n.classList.toggle('on', n === b));
    crisis = CRISES.find(c => c.id === b.dataset.id);
    S = buildSeries(crisis);
    kpis(); replay();
  });

  el.pv.addEventListener('input', () => {
    kpis();
    if (!playing) draw(canvas, crisis, S, value(), 1);
  });
  el.replay.addEventListener('click', replay);
  addEventListener('resize', () => { if (!playing) draw(canvas, crisis, S, value(), prog || 1); });

  kpis();
  new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { obs.disconnect(); replay(); }
  }, { threshold: 0.25 }).observe(canvas);
}
