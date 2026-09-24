/* ============================================================
   MAIN
   Boots everything, fills the page from CONFIG, wires scroll.
   ============================================================ */
import { CONFIG }                       from './config.js';
import { initSim }                      from './particles.js';
import { initRoom }                     from './room.js';
import { mountIcons }                   from './icons.js';
import { initCrash }                    from './crash.js';
import { moneyBurst }                   from './cash.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
let pushSpark = () => {};   // wired up by liveNumbers(), fed by the hero sim

/* ═══════════════ 1 · FILL FROM CONFIG ═══════════════ */
function hydrate() {
  $('#brandMark').textContent = CONFIG.monogram;
  $('#brandName').textContent = CONFIG.shortName ? CONFIG.name.split(' ').pop() : CONFIG.name;
  $('#ftName').textContent    = CONFIG.name;
  $('#tagTxt').textContent    = CONFIG.availability;
  $('#mUni').textContent      = CONFIG.university;
  $('#mDeg').textContent      = CONFIG.degree;
  $('#mSpec').textContent     = CONFIG.specialisation;
  $('#mYear').textContent     = CONFIG.gradYear;
  $('#mLoc').textContent      = CONFIG.location;
  $('#yr').textContent        = new Date().getFullYear();

  /* hero stats */
  $('#heroStats').innerHTML = CONFIG.stats.map(s => `
    <div class="hstat">
      <div class="hstat-v"><span data-count="${s.value}"${s.plain ? ' data-plain="1"' : ''}>0</span><em>${s.suffix}</em></div>
      <div class="hstat-l">${s.label}</div>
    </div>`).join('');

  /* ticker — doubled for a seamless loop */
  const tk = CONFIG.ticker.map(t => {
    const ch = (Math.random() * 2.6 - 1.1);
    return `<span class="tk" data-px="${t.px}">
      <span class="tk-s">${t.sym}</span>
      <span class="tk-p">${t.px.toFixed(2)}</span>
      <span class="tk-c ${ch >= 0 ? 'up' : 'dn'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(2)}%</span>
    </span>`;
  }).join('');
  $('#tape').innerHTML = tk + tk;

  /* services */
  $('#svGrid').innerHTML = CONFIG.services.map(s => `
    <article class="sv" data-tilt>
      <div class="sv-glow"></div>
      ${s.tag ? `<span class="sv-tag ${/learn/i.test(s.tag) ? 'learn' : 'ready'}">${s.tag}</span>` : ''}
      <div class="sv-no">${s.no}</div>
      <div class="sv-ico"><canvas data-icon="${s.id}"></canvas></div>
      <h3>${s.title}</h3>
      <p>${s.blurb}</p>
      <ul>${s.points.map(p => `<li>${p}</li>`).join('')}</ul>
    </article>`).join('');

  /* featured projects */
  const pg = $('#projGrid');
  if (pg && CONFIG.projects) {
    pg.innerHTML = CONFIG.projects.map(pr => `
      <a class="proj" href="${pr.repo}" target="_blank" rel="noopener" data-hot>
        <div class="proj-top"><b>P / ${pr.no}</b><span>${pr.lang}</span></div>
        <h3>${pr.title}</h3>
        <p>${pr.blurb}</p>
        <div class="proj-metric">${pr.metric}</div>
        <div class="proj-foot">
          <div class="proj-tags">${pr.tags.map(t => `<i>${t}</i>`).join('')}</div>
          <span class="proj-go">View code
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12 12 4M6 4h6v6"/></svg>
          </span>
        </div>
      </a>`).join('');
  }

  /* certifications */
  const cg = $('#certGrid');
  if (cg && CONFIG.certs) {
    cg.innerHTML = CONFIG.certs.map(c => `
      <a class="proj cert" href="${c.file}" target="_blank" rel="noopener" data-hot>
        <div class="proj-top"><b>C / ${c.no}</b><span>${c.issuer}</span></div>
        <h3>${c.title}</h3>
        <p>${c.note}</p>
        <div class="proj-metric">${c.date} · ${c.cid}</div>
        <div class="proj-foot">
          <span class="proj-go">View certificate
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12 12 4M6 4h6v6"/></svg>
          </span>
        </div>
      </a>`).join('');
    const cc = $('#certCount');
    if (cc) cc.textContent = `${CONFIG.certs.length} verified · more incoming`;
  }

  /* skills */
  $('#skGrid').innerHTML = CONFIG.skills.map((g, i) => `
    <div class="sk">
      <div class="sk-h"><span>${g.group}</span><span>${String(i + 1).padStart(2, '0')}</span></div>
      <div class="sk-list">${g.items.map(t => `<span class="chip">${t}</span>`).join('')}</div>
    </div>`).join('');

  /* contact grid */
  const row = (label, value, href) => {
    const has = value && value.length;
    const inner = has
      ? `<dd>${value}</dd>`
      : `<dd class="empty">to be added</dd>`;
    return has && href
      ? `<a class="ct-link" href="${href}" target="_blank" rel="noopener" data-hot><dt>${label}</dt>${inner}</a>`
      : `<div class="ct-link"><dt>${label}</dt>${inner}</div>`;
  };
  const host = u => { try { return new URL(u).pathname.replace(/^\/(in\/)?/, '').replace(/\/$/, ''); } catch { return u; } };
  $('#ctLinks').innerHTML =
      row('Email',    CONFIG.email,    CONFIG.email ? `mailto:${CONFIG.email}` : '')
    + row('LinkedIn', CONFIG.linkedin ? host(CONFIG.linkedin) : '', CONFIG.linkedin)
    + row('GitHub',   CONFIG.github   ? host(CONFIG.github)   : '', CONFIG.github)
    + row('Based in', CONFIG.location, '');

  /* CTA buttons */
  const mail = $('#mailBtn'), li = $('#liBtn');
  if (CONFIG.email) mail.href = `mailto:${CONFIG.email}`;
  else mail.addEventListener('click', e => e.preventDefault());
  if (CONFIG.linkedin) { li.href = CONFIG.linkedin; li.target = '_blank'; li.rel = 'noopener'; }
  else li.addEventListener('click', e => e.preventDefault());
  $$('#ghBtn, #ghWork').forEach(g => {
    if (CONFIG.github) g.href = CONFIG.github;
    else g.style.display = 'none';
  });

  /* résumé */
  const cv = $('#cvBtn');
  if (CONFIG.resumeFile) {
    cv.href = CONFIG.resumeFile; cv.setAttribute('download', '');
    $('#cvState').textContent = 'PDF ready';
  } else {
    cv.addEventListener('click', e => e.preventDefault());
    cv.style.opacity = '.45'; cv.style.pointerEvents = 'none';
  }
}

/* ═══════════════ 2 · LOADER + GLYPH SCRAMBLE ═══════════════ */
const GLYPHS = '▓▒░#@$%&*+=/\\<>|~^0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function scramble(el, text, { dur = 1300, delay = 0 } = {}) {
  const chars = [...text];
  const reveal = chars.map((c, i) =>
    c === ' ' ? 0 : dur * 0.3 + (i / chars.length) * dur * 0.7 + Math.random() * 150);
  const t0 = performance.now() + delay;

  return new Promise(resolve => {
    (function step(now) {
      const t = now - t0;
      if (t < 0) { requestAnimationFrame(step); return; }
      let done = true, out = '';
      chars.forEach((c, i) => {
        if (c === ' ') { out += ' '; return; }
        if (t >= reveal[i]) { out += c; return; }
        done = false;
        out += `<span class="sc">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`;
      });
      el.innerHTML = out;
      if (done) { resolve(); return; }
      requestAnimationFrame(step);
    })(performance.now());
  });
}

function runLoader(done) {
  const bar = $('#ldBar'), pct = $('#ldPct'), log = $('#ldLog'), name = $('#ldName');
  const lines = [
    'mounting webgl context…',
    'plotting 16 financial centres…',
    'seeding 10,000 monte carlo paths…',
    'calibrating the volatility input…',
    'simulation online'
  ];

  name.textContent = '';
  scramble(name, CONFIG.name.toUpperCase(), { dur: 1600, delay: 250 });

  let p = 0, i = 0;
  log.textContent = lines[0];

  const step = () => {
    p = Math.min(100, p + 5 + Math.random() * 13);
    bar.style.right = (100 - p) + '%';
    pct.textContent = String(Math.floor(p)).padStart(2, '0');
    const want = Math.min(lines.length - 1, Math.floor(p / 100 * lines.length));
    if (want !== i) { i = want; log.textContent = lines[i]; }

    if (p < 100) { setTimeout(step, 120 + Math.random() * 120); return; }

    setTimeout(() => {
      const L = $('#loader');
      L.classList.add('out');                 // slices part
      document.body.classList.remove('is-loading');
      moneyBurst();                           // …and the money goes up
      done();
      setTimeout(() => L.classList.add('gone'), 1500);
    }, 520);
  };
  setTimeout(step, 420);
}

/* ═══════════════ 3 · CURSOR ═══════════════ */
function cursor() {
  if (matchMedia('(hover:none)').matches) return;
  const c = $('#cursor');
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY; c.classList.add('on');
  });
  const hot = 'a,button,input,[data-hot],.chip,.sv,.slot,#roomCanvas,#viz';
  addEventListener('mouseover', e => {
    c.classList.toggle('hot', !!e.target.closest(hot));
  });
  (function loop() {
    x += (tx - x) * .22; y += (ty - y) * .22;
    c.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ═══════════════ 4 · SMOOTH SCROLL + SCROLLTRIGGER ═══════════════ */
let lenis = null;
function smoothScroll() {
  gsap.registerPlugin(ScrollTrigger);
  if (!REDUCE && window.Lenis) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;          // handle for deep-linking and testing
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    $('#drawer').classList.remove('open');
    $('#burger').classList.remove('x');
    const y = el.getBoundingClientRect().top + scrollY - 84;
    lenis ? lenis.scrollTo(y, { duration: 1.15 }) : scrollTo({ top: y, behavior: 'smooth' });
  }));
}

/* ═══════════════ 5 · SCROLL ANIMATIONS ═══════════════ */
function animations() {
  /* hero headline */
  gsap.to('.rv > span', { y: 0, duration: 1.15, ease: 'expo.out', stagger: .085, delay: .12 });
  gsap.from('.hero-tag, .hero-sub, .hero-btns, .hero-stats', {
    y: 26, opacity: 0, duration: .95, ease: 'power3.out', stagger: .09, delay: .42
  });
  gsap.from('.hud-card', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .13, delay: .7 });

  /* counters */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count;
    gsap.fromTo(el, { innerText: 0 }, {
      innerText: to, duration: 1.8, ease: 'power2.out', delay: .6, snap: { innerText: 1 },
      onUpdate() {
        const n = Math.round(+el.innerText);
        el.textContent = el.dataset.plain ? String(n) : n.toLocaleString('en-IN');
      }
    });
  });

  /* generic section reveals */
  /* NOTE: .sv / .sk / .slot are deliberately absent — they get their own
     staggered tween below, and two gsap.from()s on one element leave it
     stranded at opacity 0 when the second overwrites the first. */
  $$('.eyebrow, .sec h2, .lead, .ab-body p, .ab-meta, .term, .lab-shell, .room-stage, .ct-links')
    .forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        y: 34, opacity: 0, duration: .9, ease: 'power3.out'
      });
    });

  /* stagger inside grids */
  ['#svGrid .sv', '.sk-grid .sk', '.slots .slot', '#projGrid .proj'].forEach(sel => {
    const items = $$(sel);
    if (!items.length) return;
    gsap.from(items, {
      scrollTrigger: { trigger: items[0].parentElement, start: 'top 84%' },
      y: 44, opacity: 0, duration: .85, ease: 'power3.out', stagger: .08
    });
  });

  /* hero parallax out */
  gsap.to('#viz', {
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: .6 },
    yPercent: 16, scale: 1.1, opacity: .25, ease: 'none'
  });
  gsap.to('.hero-in', {
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: .6 },
    yPercent: -14, opacity: 0, ease: 'none'
  });

  /* hud depth on pointer */
  if (!REDUCE) {
    const cards = $$('.hud-card');
    addEventListener('mousemove', e => {
      const nx = (e.clientX / innerWidth - .5), ny = (e.clientY / innerHeight - .5);
      cards.forEach(c => {
        const d = +c.dataset.depth;
        c.style.transform = `translate3d(${-nx * d}px, ${-ny * d * .6}px, 0)`;
      });
    });
  }

  /* marquee */
  const row = $('#mq1');
  row.innerHTML = row.innerHTML + row.innerHTML;
  gsap.to(row, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });

  /* 3D tilt on service cards */
  $$('[data-tilt]').forEach(card => {
    const glow = $('.sv-glow', card);
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      if (glow) { glow.style.left = (px * r.width) + 'px'; glow.style.top = (py * r.height) + 'px'; }
      if (REDUCE) return;
      card.style.transform =
        `perspective(900px) rotateX(${(py - .5) * -7}deg) rotateY(${(px - .5) * 9}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* anime glitch-in on section headings */
  $$('.sec h2, .room-head h2').forEach(h => {
    ScrollTrigger.create({
      trigger: h, start: 'top 86%', once: true,
      onEnter: () => {
        h.classList.add('glitch-go');
        setTimeout(() => h.classList.remove('glitch-go'), 700);
      }
    });
  });

  /* nav state */
  const nav = $('#nav');
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: s => nav.classList.toggle('stuck', s.scroll() > 60)
  });
  $$('section[id]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: s => {
        const link = $(`.nav-links a[href="#${sec.id}"]`);
        if (link) link.classList.toggle('active', s.isActive);
      }
    });
  });
}

/* ═══════════════ 6 · TERMINAL TYPING ═══════════════ */
function terminal() {
  const box = $('#termBody');
  const L = [
    [['o', '>>> '], ['k', 'import'], ['o', ' numpy '], ['k', 'as'], ['o', ' np, '], ['k', 'import'], ['o', ' pandas ']],
    [['o', '>>> '], ['o', 'px = '], ['f', 'load'], ['o', '('], ['s', '"NIFTY"'], ['o', ', start='], ['s', '"2015-01-01"'], ['o', ')']],
    [['o', '>>> '], ['o', 'r  = np.'], ['f', 'log'], ['o', '(px).'], ['f', 'diff'], ['o', '().'], ['f', 'dropna'], ['o', '()']],
    [['c', '# 95% one-day VaR, historical method']],
    [['o', '>>> '], ['o', 'var95 = -np.'], ['f', 'percentile'], ['o', '(r, '], ['n', '5'], ['o', ') * BOOK']],
    [['o', '>>> '], ['o', 'es95  = -r[r <= q05].'], ['f', 'mean'], ['o', '() * BOOK']],
    [['o', '>>> '], ['f', 'print'], ['o', '(var95, es95)']],
    [['out', '₹1,84,207   ₹2,71,940']],
    [['o', '>>> '], ['f', 'backtest'], ['o', '(r, var95, window='], ['n', '252'], ['o', ')']],
    [['out', '12 breaches / 252 days · expected 12.6 → model holds']],
    [['c', '# the number is only worth what the backtest says']]
  ];

  let li = 0, ti = 0, cur = '';
  const caret = '<span class="caret"></span>';
  const wrap = (cls, txt) => `<span class="${cls === 'out' ? 'term-out' : cls}">${txt}</span>`;

  function type() {
    if (li >= L.length) { box.innerHTML = cur + caret; return; }
    const line = L[li];
    if (ti >= line.length) { cur += '<br>'; li++; ti = 0; setTimeout(type, 230); return; }

    const [cls, txt] = line[ti];
    let ci = 0;
    (function run() {
      if (ci > txt.length) { cur += wrap(cls, txt); ti++; setTimeout(type, 28); return; }
      box.innerHTML = cur + wrap(cls, txt.slice(0, ci)) + caret;
      box.scrollTop = box.scrollHeight;
      ci++;
      setTimeout(run, cls === 'out' ? 13 : 20);
    })();
  }

  new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { obs.disconnect(); setTimeout(type, 300); }
  }, { threshold: .3 }).observe(box);
}

/* ═══════════════ 7 · LIVE HUD + TICKER DRIFT ═══════════════ */
function liveNumbers() {
  /* hud bars */
  const bars = $('#hudBars');
  bars.innerHTML = Array.from({ length: 18 }, () => `<i style="--h:${20 + Math.random() * 80}%"></i>`).join('');

  /* hud sparkline */
  const spark = $('#hudSpark');
  let pts = Array.from({ length: 30 }, () => 16);
  const paint = () => {
    const d = pts.map((v, i) => `${(i / (pts.length - 1)) * 200},${34 - v}`).join(' ');
    spark.innerHTML =
      `<polyline points="${d}" fill="none" stroke="#00e87a" stroke-width="1.4"/>` +
      `<polyline points="0,34 ${d} 200,34" fill="rgba(0,232,122,.12)" stroke="none"/>`;
  };
  paint();

  /* the hero simulation drives this — one sample per publish */
  pushSpark = v => {
    pts.shift();
    pts.push(Math.max(2, Math.min(32, v * 0.6)));
    paint();
  };

  setInterval(() => {
    $$('#hudBars i').forEach(b => b.style.setProperty('--h', (18 + Math.random() * 82) + '%'));
  }, 2400);

  /* ticker drift */
  setInterval(() => {
    $$('#tape .tk').forEach(el => {
      const base = +el.dataset.px;
      const px = base * (1 + (Math.random() * .012 - .006));
      const ch = (px / base - 1) * 100;
      el.querySelector('.tk-p').textContent = px.toFixed(2);
      const c = el.querySelector('.tk-c');
      c.textContent = `${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(2)}%`;
      c.className = `tk-c ${ch >= 0 ? 'up' : 'dn'}`;
    });
  }, 3200);

  /* footer clock — IST, with session state */
  const clock = $('#ftClock');
  const tick = () => {
    const now = new Date();
    const t = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(now);
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(now);
    const get = ty => parts.find(p => p.type === ty)?.value;
    const wd = get('weekday'), mins = +get('hour') * 60 + +get('minute');
    const weekday = !['Sat', 'Sun'].includes(wd);
    const open = weekday && mins >= 555 && mins <= 930;
    clock.innerHTML = `IST ${t} · <b style="color:${open ? 'var(--green)' : 'var(--text-3)'}">NSE ${open ? 'open' : 'closed'}</b>`;
  };
  tick(); setInterval(tick, 1000);
}

/* ═══════════════ 9 · NAV DRAWER ═══════════════ */
function drawer() {
  const b = $('#burger'), d = $('#drawer');
  b.addEventListener('click', () => {
    b.classList.toggle('x');
    d.classList.toggle('open');
  });
}

/* ═══════════════ 10 · BOOT ═══════════════ */
hydrate();
cursor();
drawer();
smoothScroll();
terminal();
liveNumbers();
initCrash();

mountIcons($$('[data-icon]').map(c => ({ canvas: c, kind: c.dataset.icon })));

/* hero — the particle shapes + numeric GBM engine */
try {
  initSim($('#viz'), ({ sigma, varPct, probLoss }) => {
    const notional = 1000000;                       // quoted per ₹10L of book
    const v = $('#hudVar'), e = $('#hudExp'), f = $('#hudFlow'),
          r = $('#hudRoute'), n = $('#hudNet');
    if (v) v.innerHTML = `₹ ${Math.round(varPct / 100 * notional).toLocaleString('en-IN')}<small>/10L</small>`;
    if (e) e.innerHTML = `${probLoss.toFixed(1)}<small>%</small>`;
    if (f) f.innerHTML = `${sigma.toFixed(1)}<small>% ann.</small>`;
    if (r) r.textContent = sigma > 45 ? 'stressed tape'
                         : sigma > 30 ? 'elevated tape'
                         : sigma > 20 ? 'normal tape'
                         : 'calm tape';
    if (n) {
      n.textContent = probLoss > 50 ? 'TAIL ↑' : 'TAIL';
      n.style.color = probLoss > 50 ? 'var(--red)' : 'var(--green)';
    }
    pushSpark(probLoss);
  });
} catch (err) {
  $('#viz').style.display = 'none';
}

/* control room */
try {
  const room = initRoom($('#roomCanvas'), $('#roomTag'), () => {
    $('#roomLoad').classList.add('gone');
  });
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: '#room', start: 'top bottom', end: 'center center', scrub: .8,
    onUpdate: s => room.setLift(s.progress)
  });
} catch (err) {
  $('#roomLoad').textContent = 'webgl unavailable on this device';
}

runLoader(() => {
  animations();
  ScrollTrigger.refresh();
});
