import { useEffect, useRef, useState } from 'react';
import './HowItWorks.css';

import loginImg   from '../assets/login.png';
import watchImg   from '../assets/watching.png';
import measureImg from '../assets/measure.png';
import moneyImg   from '../assets/money.png';

const STEPS = [
  {
    number: '01',
    title: ['Sign up in', '2 minutes.'],
    gradientWords: ['Sign up'],
    description:
      'Create your account, tell us where you deliver and how much you earn daily. No paperwork. No branch visit. Done from your phone.',
    bullets: [
      'Name, city & platform — 3 fields',
      'Pick Basic or Premium plan',
      'Account ready instantly',
    ],
    image: loginImg,
    alt: 'Sign up screen',
    align: 'left',
  },
  {
    number: '02',
    title: ['We watch,', 'you deliver.'],
    gradientWords: ['watch,', 'deliver.'],
    description:
      "Once active, Coveer silently monitors weather, AQI, and local disruptions in your city every hour. You don't lift a finger.",
    bullets: [
      'Hourly weather & AQI monitoring',
      'City-level disruption tracking',
      'Zero action needed from you',
    ],
    image: watchImg,
    alt: 'Monitoring system',
    align: 'right',
  },
  {
    number: '03',
    title: ['Impact measured', 'automatically.'],
    gradientWords: ['automatically.'],
    description:
      'Every affected hour is counted and recorded in real time. No forms to fill. No calls to make. The system measures it on its own.',
    bullets: [
      'Percentage-based impact scoring',
      'Every disrupted hour tracked',
      'No manual claims ever',
    ],
    image: measureImg,
    alt: 'Impact measurement',
    align: 'left',
  },
  {
    number: '04',
    title: ['Money in your', 'wallet at 10 PM.'],
    gradientWords: ['Money'],
    description:
      'At 10 PM every day, the settlement engine runs. Affected hours × hourly income = payout. Credited to your wallet instantly.',
    bullets: [
      'Daily automatic settlement',
      'Withdraw via UPI anytime',
      'Full transaction history',
    ],
    image: moneyImg,
    alt: 'Wallet payout',
    align: 'right',
  },
];

/*
  Connector SVG logic:
  - Step 'left'  → image is on LEFT side  → bottom-center of left image  ~25% from left
  - Step 'right' → image is on RIGHT side → bottom-center of right image ~75% from left
  - Connector goes from bottom of current image → curves → top of next image
  - Line fades in (opacity 0→1) for first 20%, stays solid, fades out (1→0) last 20%
  - Direction alternates: left→right, right→left, left→right
*/
function Connector({ fromAlign }) {
  // fromAlign: where the EXITING image sits ('left' or 'right')
  // toAlign: opposite of fromAlign (next step flips)
  const fromX = fromAlign === 'left' ? 25 : 75;  // % of width
  const toX   = fromAlign === 'left' ? 75 : 25;  // % of width

  // Path: start bottom of card → down slightly → curve → across → curve → up to top of next card
  // Using viewBox 0 0 100 100 so coords are percentages
  const startX = fromX;
  const endX   = toX;
  const midY   = 50; // middle of connector height

  // Smooth S-curve path
  const d = `
    M ${startX} 0
    C ${startX} ${midY - 10}, ${endX} ${midY + 10}, ${endX} 100
  `;

  const gradId = `connGrad-${fromAlign}`;

  return (
    <div className="hiw-connector">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vertical gradient for fade-in at top, fade-out at bottom */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(123,121,196,0)"   />
            <stop offset="18%"  stopColor="rgba(167,165,232,0.75)"/>
            <stop offset="82%"  stopColor="rgba(167,165,232,0.75)"/>
            <stop offset="100%" stopColor="rgba(123,121,196,0)"   />
          </linearGradient>
        </defs>

        {/* Main dashed connector path */}
        <path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="0.5"
          strokeDasharray="2.5 3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export function HowItWorks() {
  const stepRefs = useRef([]);
  const [activeSteps, setActiveSteps] = useState(() => STEPS.map(() => false));

  useEffect(() => {
    const handleScroll = () => {
      const windowH = window.innerHeight;
      setActiveSteps(prev => prev.map((already, i) => {
        if (already) return true; // never un-activate
        const el = stepRefs.current[i];
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < windowH * 0.75;
      }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="hiw-section">

      {/* Section headline */}
      <div className="hiw-headline-block">
        <h2 className="hiw-headline">
          How <span className="hiw-headline-gradient">Coveer</span> works.
        </h2>
        <p className="hiw-headline-sub">
          No complexity. No claims. <br />
          Just automatic income protection.
        </p>
      </div>

      {/* Steps — interleaved with connectors */}
      <div className="hiw-steps">
        {STEPS.map((step, i) => (
          <>
            {/* Step card */}
            <div
              key={`step-${i}`}
              ref={(el) => (stepRefs.current[i] = el)}
              className={[
                'hiw-step',
                `hiw-step--${step.align}`,
                activeSteps[i] ? 'hiw-step--active' : '',
              ].join(' ')}
            >
              {/* Image */}
              <div className="hiw-img-side">
                <div className="hiw-img-card">
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="hiw-img"
                    draggable={false}
                  />
                  <div className="hiw-img-glow" />
                </div>
              </div>

              {/* Content */}
              <div className="hiw-content-side">
                <span className="hiw-step-num">{step.number}</span>
                <h2 className="hiw-step-title">
                  {step.title.map((line, li) => {
                    const words = line.split(' ');
                    const gradientWordIndices = new Set();
                    
                    if (step.gradientWords) {
                      step.gradientWords.forEach(gradWord => {
                        const gradWords = gradWord.split(' ');
                        for (let i = 0; i <= words.length - gradWords.length; i++) {
                          if (words.slice(i, i + gradWords.length).join(' ') === gradWord) {
                            for (let j = i; j < i + gradWords.length; j++) {
                              gradientWordIndices.add(j);
                            }
                          }
                        }
                      });
                    }
                    
                    return (
                      <span key={li} className="hiw-title-line">
                        {words.map((word, wi) => (
                          <span
                            key={wi}
                            className={gradientWordIndices.has(wi) ? 'hiw-title-gradient' : ''}
                          >
                            {word}
                            {wi < words.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </span>
                    );
                  })}
                </h2>
                <p className="hiw-step-desc">{step.description}</p>
                <ul className="hiw-bullets">
                  {step.bullets.map((b, bi) => (
                    <li key={bi} className="hiw-bullet">
                      <span className="hiw-bullet-dot" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Connector after steps 1, 2, 3 (not after last) */}
            {i < STEPS.length - 1 && (
              <Connector key={`conn-${i}`} fromAlign={step.align} />
            )}
          </>
        ))}
      </div>

    </section>
  );
}