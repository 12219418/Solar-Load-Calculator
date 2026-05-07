import { motion } from 'framer-motion';
import { ArrowDown, Sun, Leaf, BatteryCharging } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      {/* Animated background particles */}
      <div className="hero__particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="hero__particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="hero__orb hero__orb--green" />
      <div className="hero__orb hero__orb--teal" />
      <div className="hero__orb hero__orb--blue" />

      <div className="hero__content">
        {/* Badge */}
        <motion.div
          className="hero__badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sun size={14} className="hero__badge-icon" />
          <span>AI-Powered Solar Analysis</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          Transform Your
          <span className="hero__title-highlight"> Electricity Bill </span>
          Into a
          <span className="hero__title-gradient"> Solar Roadmap</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Upload your MSEDCL electricity bill and our AI instantly analyzes your
          consumption patterns, calculates optimal solar panel sizing, and generates
          a detailed load analysis report.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          <a href="#upload" className="hero__btn hero__btn--primary">
            <BatteryCharging size={18} />
            Analyze My Bill
          </a>
          <a href="#how-it-works" className="hero__btn hero__btn--secondary">
            <Leaf size={18} />
            How It Works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="hero__stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="hero__stat">
            <span className="hero__stat-value">10s</span>
            <span className="hero__stat-label">Analysis Time</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">99%</span>
            <span className="hero__stat-label">Accuracy</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">AI</span>
            <span className="hero__stat-label">Powered</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#how-it-works"
        className="hero__scroll-indicator"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll down"
      >
        <ArrowDown size={20} />
      </motion.a>
    </section>
  );
}
