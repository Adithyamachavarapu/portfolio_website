/* ============================================================
   MONEY BURST
   One-shot intro: banknotes erupt from the centre, tumble in
   fake 3D, catch the light, and fall away. Runs once, then the
   canvas removes itself.
   ============================================================ */

const BILLS = 34;
const LIFE  = 3.4;      // seconds
const GRAV  = 1010;     // px / s²
const FOCAL = 640;

const rnd = (a, b) => a + Math.random() * (b - a);

function makeBill(cx, cy, i, total) {
  /* a fountain: bills leave the bottom centre in a loose arc,
     staggered, with just enough sideways drift to fill the frame */
  const lane = (i / (total - 1)) * 2 - 1;             // −1 … 1 across the arc
  return {
    x: cx + lane * rnd(50, 190),
    y: cy + rnd(-10, 40),
    z: rnd(-140, 320),
    vx: lane * rnd(280, 500) + rnd(-40, 40),
    vy: -rnd(880, 1240) * (1 - Math.abs(lane) * 0.22),
    vz: rnd(-60, 220),
    rot: rnd(-0.5, 0.5),
    spin: rnd(-2.6, 2.6),
    tilt: rnd(0, Math.PI * 2),
    tiltSpd: rnd(2.0, 4.6),
    sway: rnd(1.6, 2.8),
    ph: rnd(0, Math.PI * 2),
    delay: Math.abs(lane) * 0.22 + rnd(0, 0.3),
    hue: Math.random() < 0.26 ? 1 : 0
  };
}

/* one banknote, drawn in local space, 92 × 44 */
function drawBill(x, pale) {
  const W = 92, H = 44;
  const body = pale ? '#123f2b' : '#0b2c1e';
  const ink  = pale ? '#8affc4' : '#00e87a';

  x.fillStyle = body;
  x.strokeStyle = ink;
  x.lineWidth = 1.4;
  x.beginPath();
  x.roundRect(-W / 2, -H / 2, W, H, 3);
  x.fill();
  x.stroke();

  /* inner frame */
  x.globalAlpha = 0.55;
  x.lineWidth = 0.8;
  x.beginPath();
  x.roundRect(-W / 2 + 5, -H / 2 + 5, W - 10, H - 10, 2);
  x.stroke();

  /* guilloche lines */
  x.globalAlpha = 0.2;
  for (let i = -2; i <= 2; i++) {
    x.beginPath();
    x.moveTo(-W / 2 + 8, i * 4.6);
    x.lineTo(W / 2 - 8, i * 4.6);
    x.stroke();
  }
  x.globalAlpha = 1;

  /* portrait medallion */
  x.beginPath();
  x.ellipse(-W / 2 + 21, 0, 9, 13, 0, 0, Math.PI * 2);
  x.fillStyle = pale ? 'rgba(138,255,196,.22)' : 'rgba(0,232,122,.16)';
  x.fill();
  x.strokeStyle = ink; x.lineWidth = 0.9; x.globalAlpha = .7; x.stroke();
  x.globalAlpha = 1;

  /* denomination */
  x.fillStyle = ink;
  x.font = '700 15px ui-monospace, monospace';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('₹', W / 2 - 15, -7);
  x.font = '700 9px ui-monospace, monospace';
  x.fillText('500', W / 2 - 15, 8);

}

export function moneyBurst() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'cash';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    zIndex: '9650', pointerEvents: 'none'
  });
  document.body.appendChild(canvas);

  const x = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio, 2);
  let W = 0, H = 0;
  const size = () => {
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);

  /* older Safari has no roundRect */
  if (!x.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (rx, ry, w, h, r) {
      this.beginPath();
      this.moveTo(rx + r, ry);
      this.arcTo(rx + w, ry, rx + w, ry + h, r);
      this.arcTo(rx + w, ry + h, rx, ry + h, r);
      this.arcTo(rx, ry + h, rx, ry, r);
      this.arcTo(rx, ry, rx + w, ry, r);
      this.closePath();
      return this;
    };
  }

  const bills = Array.from({ length: BILLS }, (_, i) => makeBill(W / 2, H + 60, i, BILLS));
  const t0 = performance.now();
  let last = t0;

  function frame(now) {
    /* clamped dt keeps the physics stable; wall-clock t owns the lifetime, so a
       throttled tab can never leave banknotes stranded on the page */
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;

    x.clearRect(0, 0, W, H);

    const fade = t > LIFE - 0.9 ? Math.max(0, (LIFE - t) / 0.9) : 1;

    bills.forEach(b => {
      if (t < b.delay) return;
      b.vy += GRAV * dt;
      if (b.vy > 340) b.vy = 340;                    // notes fall, they don't drop
      b.vx *= 0.985; b.vz *= 0.988; b.vy *= 0.996;
      b.x += (b.vx + Math.sin(t * b.sway + b.ph) * 46) * dt;
      b.y += b.vy * dt; b.z += b.vz * dt;
      b.rot += b.spin * dt;
      b.tilt += b.tiltSpd * dt;

      const s = FOCAL / (FOCAL + b.z);
      if (s <= 0.05) return;

      const flip = Math.cos(b.tilt);
      const edge = Math.abs(flip) < 0.07;

      x.save();
      x.globalAlpha = fade * Math.min(1, s * 1.15);
      x.translate(b.x, b.y);
      x.rotate(b.rot);
      x.scale(s * flip, s);

      if (edge) {
        x.fillStyle = '#6bffb0';
        x.fillRect(-46, -1, 92, 2);
      } else {
        /* light falls off as the note turns away */
        x.globalAlpha *= 0.45 + Math.abs(flip) * 0.55;
        drawBill(x, b.hue === 1);
      }
      x.restore();
    });

    if (t < LIFE) { requestAnimationFrame(frame); return; }
    removeEventListener('resize', size);
    canvas.remove();
  }
  requestAnimationFrame(frame);
}
