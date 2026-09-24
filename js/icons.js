/* ============================================================
   SERVICE CARD ICONS
   Small 2D canvases, each animating its own idea.
   ============================================================ */

const G = '0,232,122', R = '255,77,94', A = '255,184,61';

function setup(canvas) {
  const dpr = Math.min(devicePixelRatio, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const x = canvas.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { x, w, h };
}

/* ---- 01 · data: bars settling into a trend ---- */
function data(x, w, h, t) {
  const n = 13, bw = w / n;
  const line = [];
  for (let i = 0; i < n; i++) {
    const wave = Math.sin(t * 0.0012 + i * 0.55) * 0.22 + Math.sin(t * 0.0007 + i * 1.3) * 0.12;
    const v = 0.32 + i / n * 0.38 + wave;
    const bh = Math.max(4, v * h * 0.82);
    const grd = x.createLinearGradient(0, h - bh, 0, h);
    grd.addColorStop(0, `rgba(${G},.85)`); grd.addColorStop(1, `rgba(${G},.12)`);
    x.fillStyle = grd;
    x.fillRect(i * bw + bw * 0.2, h - bh, bw * 0.6, bh);
    line.push([i * bw + bw * 0.5, h - bh - 6]);
  }
  x.beginPath();
  line.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py));
  x.strokeStyle = `rgba(107,255,176,.9)`; x.lineWidth = 1.6; x.stroke();
  line.forEach(([px, py], i) => {
    if (i % 4) return;
    x.beginPath(); x.arc(px, py, 2.6, 0, 7); x.fillStyle = '#6bffb0'; x.fill();
  });
}

/* ---- 02 · risk: a distribution with its tail cut off ---- */
function risk(x, w, h, t) {
  const cx = w * 0.52, sd = w * 0.15;
  const pdf = v => Math.exp(-((v - cx) ** 2) / (2 * sd * sd));
  const base = h * 0.9, amp = h * 0.74;
  const cut = cx - sd * (1.5 + Math.sin(t * 0.0009) * 0.45);

  /* tail fill */
  x.beginPath(); x.moveTo(0, base);
  for (let px = 0; px <= cut; px += 2) x.lineTo(px, base - pdf(px) * amp);
  x.lineTo(cut, base); x.closePath();
  x.fillStyle = `rgba(${R},.42)`; x.fill();

  /* body fill */
  const grd = x.createLinearGradient(0, base - amp, 0, base);
  grd.addColorStop(0, `rgba(${G},.42)`); grd.addColorStop(1, `rgba(${G},.03)`);
  x.beginPath(); x.moveTo(cut, base);
  for (let px = cut; px <= w; px += 2) x.lineTo(px, base - pdf(px) * amp);
  x.lineTo(w, base); x.closePath();
  x.fillStyle = grd; x.fill();

  /* curve */
  x.beginPath();
  for (let px = 0; px <= w; px += 2) {
    const py = base - pdf(px) * amp;
    px ? x.lineTo(px, py) : x.moveTo(px, py);
  }
  x.strokeStyle = `rgba(${G},.95)`; x.lineWidth = 1.8; x.stroke();

  /* VaR cut line */
  x.setLineDash([4, 3]);
  x.beginPath(); x.moveTo(cut, base - amp * 0.98); x.lineTo(cut, base);
  x.strokeStyle = `rgba(${R},1)`; x.lineWidth = 1.4; x.stroke();
  x.setLineDash([]);

  x.fillStyle = `rgba(${R},.95)`;
  x.font = '600 9px ui-monospace, monospace';
  x.textAlign = 'right';
  x.fillText('VaR', cut - 5, base - amp * 0.82);

  x.strokeStyle = 'rgba(255,255,255,.12)';
  x.beginPath(); x.moveTo(0, base); x.lineTo(w, base); x.stroke();
}

/* ---- 02 · excel: a KPI dashboard assembling itself ---- */
function excel(x, w, h, t) {
  const gap = 8, tw = (w - gap * 2) / 3;
  const ty = h * 0.12, th = h * 0.76;

  for (let i = 0; i < 3; i++) {
    x.strokeStyle = 'rgba(255,255,255,.1)';
    x.lineWidth = 1;
    x.strokeRect(i * (tw + gap) + .5, ty + .5, tw, th);
  }

  /* tile 1 — donut gauge */
  const cx = tw / 2, cy = ty + th / 2, r = Math.min(tw, th) * 0.3;
  const sweep = (Math.sin(t * 0.0011) * .5 + .5) * Math.PI * 1.55 + 0.4;
  x.lineWidth = 5; x.lineCap = 'round';
  x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2);
  x.strokeStyle = `rgba(${G},.16)`; x.stroke();
  x.beginPath(); x.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + sweep);
  x.strokeStyle = `rgba(${G},.95)`; x.stroke();
  x.lineCap = 'butt';
  x.fillStyle = '#6bffb0';
  x.font = '600 9px ui-monospace, monospace';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(Math.round(sweep / (Math.PI * 2) * 100) + '%', cx, cy);

  /* tile 2 — KPI bars filling */
  const bx = tw + gap;
  for (let i = 0; i < 4; i++) {
    const by = ty + 9 + i * ((th - 14) / 4);
    const on = (Math.sin(t * 0.0014 + i * 1.2) + 1) / 2;
    x.fillStyle = `rgba(${G},.14)`;
    x.fillRect(bx + 7, by, tw - 14, 6);
    x.fillStyle = i === 3 ? `rgba(${A},.9)` : `rgba(${G},${.5 + on * .5})`;
    x.fillRect(bx + 7, by, (tw - 14) * (.3 + on * .65), 6);
  }

  /* tile 3 — sparkline with live head */
  const sx = (tw + gap) * 2;
  x.beginPath();
  let hx = 0, hy = 0;
  for (let i = 0; i <= 22; i++) {
    const px = sx + 7 + (i / 22) * (tw - 14);
    const py = ty + th * 0.62
             - Math.sin(i * 0.55 + t * 0.0016) * th * 0.16
             - i * th * 0.008;
    i ? x.lineTo(px, py) : x.moveTo(px, py);
    hx = px; hy = py;
  }
  x.strokeStyle = `rgba(${G},.9)`; x.lineWidth = 1.6; x.stroke();
  x.beginPath(); x.arc(hx, hy, 2.6, 0, 7);
  x.fillStyle = '#6bffb0'; x.fill();
}

/* ---- 03 · sql: rows joining across two tables ---- */
function sql(x, w, h, t) {
  const rows = 5, rh = Math.min(15, h / 7), gap = 5;
  const tw = w * 0.3;
  const drawTable = (tx, label, phase) => {
    x.fillStyle = 'rgba(255,255,255,.05)';
    x.fillRect(tx, h * 0.14, tw, rows * (rh + gap) + 6);
    x.strokeStyle = `rgba(${G},.35)`; x.lineWidth = 1;
    x.strokeRect(tx + .5, h * 0.14 + .5, tw - 1, rows * (rh + gap) + 5);
    for (let i = 0; i < rows; i++) {
      const on = (Math.sin(t * 0.0018 + i * 1.1 + phase) + 1) / 2;
      x.fillStyle = `rgba(${G},${0.12 + on * 0.6})`;
      x.fillRect(tx + 5, h * 0.14 + 5 + i * (rh + gap), (tw - 10) * (0.45 + on * 0.5), rh - 4);
    }
    x.fillStyle = 'rgba(164,176,170,.8)';
    x.font = '8px ui-monospace, monospace'; x.textAlign = 'left';
    x.fillText(label, tx, h * 0.14 - 6);
  };
  drawTable(2, 'loans', 0);
  drawTable(w - tw - 2, 'risk', 1.6);

  /* join lines */
  const lx = 2 + tw, rx = w - tw - 2;
  for (let i = 0; i < rows; i++) {
    const y1 = h * 0.14 + 5 + i * (rh + gap) + rh / 2 - 2;
    const j = (i + 2) % rows;
    const y2 = h * 0.14 + 5 + j * (rh + gap) + rh / 2 - 2;
    const prog = ((t * 0.00045 + i * 0.2) % 1);
    x.beginPath();
    x.moveTo(lx, y1);
    x.bezierCurveTo(lx + 22, y1, rx - 22, y2, rx, y2);
    x.strokeStyle = `rgba(${G},.18)`; x.lineWidth = 1; x.stroke();

    /* travelling packet */
    const bez = (p, a, b, c, d) => {
      const m = 1 - p;
      return m * m * m * a + 3 * m * m * p * b + 3 * m * p * p * c + p * p * p * d;
    };
    const px = bez(prog, lx, lx + 22, rx - 22, rx);
    const py = bez(prog, y1, y1, y2, y2);
    x.beginPath(); x.arc(px, py, 2.2, 0, 7);
    x.fillStyle = `rgba(${A},.95)`; x.fill();
  }
}

const PAINTERS = { data, excel, risk, sql };

export function mountIcons(nodes) {
  const live = new Set();
  const items = nodes.map(({ canvas, kind }) => {
    let dim = setup(canvas);
    const item = { canvas, kind, get dim() { return dim; } };
    addEventListener('resize', () => { dim = setup(canvas); });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) live.add(item); else live.delete(item);
    }, { threshold: 0 }).observe(canvas);
    return item;
  });

  function frame(t) {
    requestAnimationFrame(frame);
    live.forEach(it => {
      const { x, w, h } = it.dim;
      x.clearRect(0, 0, w, h);
      (PAINTERS[it.kind] || data)(x, w, h, t);
    });
  }
  requestAnimationFrame(frame);
  return items;
}
