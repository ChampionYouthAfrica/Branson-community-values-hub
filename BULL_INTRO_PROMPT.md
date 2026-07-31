Add a cinematic full-screen intro animation featuring the Branson Bulls mascot that plays once when the site loads, plus a matching dark navy/blue/green "Branson" visual theme. This is for a React + Vite + Tailwind CSS v4 project. If the target project uses a different stack, adapt the JSX to that framework but keep the CSS and timing identical.

## 1. The mascot image

Download the official Branson Bulls logo and remove its white background so it works on a dark backdrop:

```bash
mkdir -p src/assets
curl -sL "https://image.maxpreps.io/school-mascot/8/c/c/8ccdb557-16f2-41cd-a724-6b71bc221661.gif?version=637740388800000000&width=1024&height=1024" -o /tmp/bull.gif
python3 -m pip install --user pillow -q
python3 - <<'PY'
from PIL import Image
im = Image.open('/tmp/bull.gif').convert('RGBA')
im.putdata([(r,g,b,0) if r>240 and g>240 and b>240 else (r,g,b,a) for r,g,b,a in im.getdata()])
im.crop(im.getbbox()).save('src/assets/branson-bull-real.png')
PY
```

The mascot is a bull head: royal blue (#004B87) face, green (#00A651) horns. School colors are **Branson blue #004B87** and **Branson green #00A651**.

## 2. The intro component

Create `src/components/IntroSequence.jsx`:

```jsx
import { useEffect, useState } from 'react';
import bransonBull from '../assets/branson-bull-real.png';

// Full-screen cinematic intro: the bull charges in, energy rings ripple out,
// then the page is revealed through an expanding portal. Plays once per session.
export default function IntroSequence({ onDone }) {
  const [phase, setPhase] = useState('enter'); // enter -> charge -> burst -> gone

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('charge'), 900);
    const t2 = setTimeout(() => setPhase('burst'), 2100);
    const t3 = setTimeout(() => { setPhase('gone'); onDone(); }, 3050);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  if (phase === 'gone') return null;

  return (
    <div
      className={`intro-overlay ${phase === 'burst' ? 'intro-burst' : ''}`}
      onClick={() => { setPhase('gone'); onDone(); }}
      role="presentation"
    >
      <div className="intro-stars" />
      <div className="intro-center">
        <div className="intro-halo" />
        <div className={`intro-rings ${phase !== 'enter' ? 'intro-rings-live' : ''}`}>
          <span /><span /><span />
        </div>
        <img
          src={bransonBull}
          alt=""
          className={`intro-bull ${phase === 'enter' ? 'intro-bull-enter' : ''} ${phase === 'charge' ? 'intro-bull-charge' : ''} ${phase === 'burst' ? 'intro-bull-burst' : ''}`}
        />
        <p className={`intro-tagline ${phase === 'charge' ? 'intro-tagline-show' : ''}`}>
          COMMUNITY&nbsp;·&nbsp;VALUES&nbsp;·&nbsp;HUB
        </p>
      </div>
    </div>
  );
}
```

Change the tagline text to fit the new project.

## 3. Mount it once per session

In the top-level page/App component:

```jsx
import { useCallback, useState } from 'react';
import IntroSequence from './components/IntroSequence';

// inside the component:
const [introDone, setIntroDone] = useState(() => sessionStorage.getItem('introPlayed') === '1');
const finishIntro = useCallback(() => {
  sessionStorage.setItem('introPlayed', '1');
  setIntroDone(true);
}, []);

// in the JSX, before everything else:
{!introDone && <IntroSequence onDone={finishIntro} />}
```

Using `sessionStorage` means it plays once per browser session (not on every route change). Clicking anywhere skips it.

## 4. The CSS

Append this to your global stylesheet (e.g. `src/index.css`). It is self-contained — the `glow-pulse` keyframe it depends on is included:

```css
@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ═══════════ INTRO SEQUENCE ═══════════ */
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: radial-gradient(ellipse at 50% 40%, #06365f 0%, #02223f 45%, #010f1f 100%);
  cursor: pointer;
  transition: opacity 0.9s cubic-bezier(0.7, 0, 0.84, 0), transform 0.9s cubic-bezier(0.7, 0, 0.84, 0);
}
.intro-overlay.intro-burst {
  opacity: 0;
  transform: scale(2.4);
  pointer-events: none;
}
.intro-stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 20% 30%, rgb(255 255 255 / 0.8), transparent),
    radial-gradient(1px 1px at 70% 20%, rgb(255 255 255 / 0.6), transparent),
    radial-gradient(2px 2px at 85% 65%, rgb(134 239 172 / 0.7), transparent),
    radial-gradient(1px 1px at 40% 75%, rgb(255 255 255 / 0.5), transparent),
    radial-gradient(1.5px 1.5px at 10% 60%, rgb(125 211 252 / 0.7), transparent),
    radial-gradient(1px 1px at 55% 45%, rgb(255 255 255 / 0.4), transparent),
    radial-gradient(2px 2px at 92% 12%, rgb(125 211 252 / 0.6), transparent),
    radial-gradient(1px 1px at 30% 10%, rgb(134 239 172 / 0.5), transparent);
  animation: glow-pulse 2.2s ease-in-out infinite;
}
.intro-center {
  position: relative;
  display: grid;
  place-items: center;
}
/* soft white halo so the blue/green bull pops against the dark backdrop */
.intro-halo {
  position: absolute;
  width: clamp(220px, 46vw, 380px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.92) 0%, rgb(226 244 255 / 0.55) 45%, transparent 72%);
  filter: blur(6px);
  animation: glow-pulse 3s ease-in-out infinite;
  pointer-events: none;
}
.intro-bull {
  width: clamp(140px, 30vw, 240px);
  position: relative;
  filter: drop-shadow(0 0 26px rgb(255 255 255 / 0.55));
}
.intro-bull-enter { animation: bull-arrive 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.intro-bull-charge { animation: bull-charge 1.2s ease-in-out both; }
.intro-bull-burst { animation: bull-burst 0.9s cubic-bezier(0.7, 0, 0.84, 0) both; }
@keyframes bull-arrive {
  0% { opacity: 0; transform: scale(0.15) rotate(-20deg); filter: blur(12px); }
  60% { opacity: 1; filter: blur(0) drop-shadow(0 0 40px rgb(125 211 252 / 0.45)); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes bull-charge {
  0%, 100% { transform: scale(1); }
  20% { transform: scale(1.04) rotate(-1.5deg); }
  40% { transform: scale(0.98) rotate(1.5deg); }
  60% { transform: scale(1.06) rotate(-1deg); }
  80% { transform: scale(1.02) rotate(0.5deg); }
}
@keyframes bull-burst {
  to { transform: scale(7); opacity: 0; filter: blur(20px); }
}
.intro-rings {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.intro-rings span {
  position: absolute;
  width: clamp(140px, 30vw, 240px);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid rgb(125 211 252 / 0.6);
  opacity: 0;
}
.intro-rings-live span { animation: ring-ripple 1.4s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
.intro-rings-live span:nth-child(2) { animation-delay: 0.35s; border-color: rgb(134 239 172 / 0.55); }
.intro-rings-live span:nth-child(3) { animation-delay: 0.7s; }
@keyframes ring-ripple {
  from { transform: scale(1); opacity: 0.9; }
  to { transform: scale(2.6); opacity: 0; }
}
.intro-tagline {
  position: absolute;
  bottom: -64px;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgb(186 230 253 / 0.9);
  letter-spacing: 0.55em;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.7s ease, transform 0.7s ease, letter-spacing 1.1s ease;
  white-space: nowrap;
}
.intro-tagline-show { opacity: 1; transform: translateY(0); letter-spacing: 0.72em; }

@media (prefers-reduced-motion: reduce) {
  .intro-overlay *, .intro-overlay { animation: none !important; transition: opacity 0.3s !important; }
}
```

## 5. Matching page theme (optional but recommended)

To carry the intro's look into the page, use a dark animated hero band and Branson colors elsewhere:

- Register the brand colors. In Tailwind v4, add to your `@theme` block in the CSS:
  ```css
  @theme {
    --color-branson-blue: #004B87;
    --color-branson-green: #00A651;
  }
  ```
- Hero background: an animated gradient across the school colors.
  ```css
  .hero-animated {
    background: linear-gradient(120deg, #003a6b, #004B87, #0a6aa8, #00734a, #004B87);
    background-size: 300% 300%;
    animation: gradient-shift 12s ease infinite;
  }
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  ```
- Card/link surfaces: white cards (`bg-white dark:bg-slate-900`) with a thin top accent bar in Branson blue or green, an icon tile filled with a `from-branson-blue to-[#0a6aa8]` (or green) gradient, dark slate headings, and blue/green CTA text. Alternate blue and green between cards.
- Use the same de-backgrounded bull PNG as a faint watermark (`opacity: 0.05`) in the corner of hero bands and cards.

## Timing summary

The whole intro runs ~3 seconds: bull springs in (0–0.9s) → shakes/charges while rings ripple and the tagline spreads (0.9–2.1s) → bull and overlay zoom-burst outward revealing the page (2.1–3.05s). Clicking anywhere ends it immediately.
```
