import './PlatformStrip.css';

import swiggy   from '../assets/swiggy.png';
import zomato   from '../assets/zomato.png';
import blinkit  from '../assets/blinkit.png';
import zepto    from '../assets/zepto.png';
import amazon   from '../assets/amazon.png';
import flipkart from '../assets/flipkart.png';

const platforms = [
  { name: 'Swiggy',   img: swiggy   },
  { name: 'Zomato',   img: zomato   },
  { name: 'Blinkit',  img: blinkit  },
  { name: 'Zepto',    img: zepto    },
  { name: 'Amazon',   img: amazon   },
  { name: 'Flipkart', img: flipkart },
];

// Triple array → seamless infinite loop with no visible gap
const items = [...platforms, ...platforms, ...platforms];

export function PlatformStrip() {
  return (
    <div className="ps-wrapper">
      <p className="ps-label">Trusted by workers on</p>

      <div className="ps-viewport">
        {/* Soft edge fades so logos dissolve at edges */}
        <div className="ps-fade ps-fade--left"  />
        <div className="ps-fade ps-fade--right" />

        <div className="ps-track">
          {items.map((p, i) => (
            <div
              className="ps-item"
              key={i}
              aria-hidden={i >= platforms.length}
            >
              <img
                src={p.img}
                alt={p.name}
                className="ps-logo"
                draggable={false}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}