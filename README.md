# Adithya Machavarapu — Portfolio

A single-page portfolio site. Near-black terminal palette, one green, Apple spacing.
No build step, no npm, no framework.

---

## Editing it

**Everything personal lives in one file: `js/config.js`.**
Change a value, save, refresh the page. That's the whole workflow.

```js
email:    '',   // ← put your address here and the contact button starts working
linkedin: '',   // ← full https:// URL
github:   '',   // ← full https:// URL
resumeFile: '', // ← e.g. 'assets/Adithya-Resume.pdf'
```

Any field left as `''` degrades quietly — the link renders as *"to be added"*
and the button goes inert. Nothing breaks, nothing looks unfinished.

### Adding your résumé
1. Drop the PDF into `assets/`
2. Set `resumeFile: 'assets/Your-Resume.pdf'`
3. The download button activates and the label flips to "PDF ready"

### Adding or reordering a project
Projects render from `CONFIG.projects` in `js/config.js` — title, blurb, metric
line, tags and repo URL. Add or reorder objects there, save, refresh.

Certifications work the same way, in the **CERTIFICATIONS** section.

---

## What's on the page

| Section | Notes |
|---|---|
| **Loader** | Slice reveal, radial sweep, rotating rings, glyph scramble resolving to your name, then a one-shot fountain of banknotes |
| **Hero** | Nine thousand particles that keep becoming the work: a return distribution with its 5% tail in red, a candlestick tape, a growth series, a scatter with its regression line. Click to morph, drag to tilt, and the cursor pushes particles aside. A numbers-only GBM engine runs alongside and feeds the three HUD cards live |
| **About** | Self-typing Python terminal (a real historical-VaR routine) |
| **Services** | Three cards, each with its own live canvas animation |
| **Control Room** | Isometric risk desk in WebGL. Every desk monitor and floating panel draws real animated data. Drag to orbit, hover a panel |
| **Skills** | From `CONFIG.skills` |
| **Crash Test** | Historical stress testing, replayed: pick a crisis (1987, Dot-com, 2008, Demonetisation, COVID), set a portfolio, and watch the drawdown fill in — max pain, days falling, time to recover. Stylised paths; depths, durations and recoveries match the record |
| **Work** | Four featured GitHub projects (RiskScope, BlackRock Risk Lab, Credit Risk Analysis, UPI Transaction Risk), rendered from `CONFIG.projects`, plus a More-on-GitHub button |
| **Certifications / Résumé** | Empty by design. Styled slot shells, ready to fill |
| **Contact** | Degrades gracefully until you fill in `config.js` |

---

## Running it locally

It's static, but ES modules need to be served over HTTP (opening `index.html`
straight off the disk will fail on CORS).

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321

---

## Putting it online

Drag the whole folder onto [netlify.com/drop](https://app.netlify.com/drop) — it's
live in about ten seconds, no account needed to preview.

For a permanent URL, push to GitHub and connect the repo to Netlify or Vercel.
There is no build command and no output directory; it's plain static files.

---

## Files

```
index.html        page structure
css/style.css     the whole design system (tokens at the top)
js/config.js      ← YOUR DETAILS GO HERE
js/main.js        boots everything, scroll animation, loader
js/particles.js   hero particle shapes + GBM stat engine
js/room.js        isometric control room
js/crash.js       Crash Test stress-test replays
js/cash.js        intro banknote fountain
js/icons.js       service card animations
assets/           put your résumé PDF and images here
```

Three libraries, all from CDN: **three.js** (WebGL), **GSAP + ScrollTrigger**
(scroll animation), **Lenis** (smooth scrolling).

---

## A note on the Risk Lab

The numbers are real, not decorative. The simulator runs geometric Brownian motion:

$$S_{t+1} = S_t \cdot \exp\left(\left(\mu - \tfrac{\sigma^2}{2}\right)\Delta t + \sigma\sqrt{\Delta t}\,Z\right)$$

VaR is the loss quantile of the terminal P&L distribution; Expected Shortfall is
the mean loss beyond it. At ₹10L, 22% vol, 10 days, 95% confidence it returns
roughly ₹67–69k — which matches the parametric answer (1.645 × σ√h × V, less
drift) to within a rounding error.

It is illustrative. It is not investment advice.
