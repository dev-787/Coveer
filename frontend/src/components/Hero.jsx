import { ArrowRight, Search, Wrench, UserCircle } from 'lucide-react';
import './Hero.css';

export function Hero() {
  return (
    <div className="hero-container">
      {/* Badge Pills */}
      <div className="badge-container">
        <div className="badge">
          <Wrench className="badge-icon" />
          <span className="badge-text">Built for Gig Workers</span>
        </div>
      </div>

      {/* Main Heading */}
      <div className="heading-container">
        <h1 className="hero-heading">
          AI-Powered <span className="gradient-text">Income Protection</span> For Gig Workers, At Scale.
        </h1>
      </div>

      {/* Subtitle */}
      <p className="subtitle">
        Powering Trillions of Tokens per Month, Chutes is the leading open-source, decentralized compute provider
        for deploying, scaling and running open-source models in production.
      </p>

      {/* CTA Buttons */}
      <div className="cta-container">
        <button className="btn btn-primary">
          <ArrowRight className="btn-icon" />
          Get Started
        </button>
        <button className="btn btn-secondary">
          <UserCircle className="btn-icon icon-light" />
          Create Account
        </button>
      </div>
    </div>
  );
}