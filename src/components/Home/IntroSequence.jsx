import { useEffect, useState } from 'react';
import bransonBull from '../../assets/branson-bull-real.png';

// Full-screen cinematic intro: the bull charges in, energy rings ripple out,
// then the page is revealed through an expanding portal. Plays once per session.
export default function IntroSequence({ onDone }) {
  const [phase, setPhase] = useState('enter'); // enter -> charge -> burst -> gone

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('charge'), 900);
    const t2 = setTimeout(() => setPhase('burst'), 2100);
    const t3 = setTimeout(() => {
      setPhase('gone');
      onDone();
    }, 3050);
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
