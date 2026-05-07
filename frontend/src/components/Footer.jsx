import { Sun, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <img src="/logo.png" alt="EnergyBae" className="footer__logo-img" />
              <span className="footer__logo-text">
                <span className="footer__logo-energy">Energy</span>
                <span className="footer__logo-bae">Bae</span>
              </span>
            </div>
            <p className="footer__desc">
              AI-powered solar analysis for renewable energy professionals. Transform
              electricity bills into actionable solar proposals in seconds.
            </p>
          </div>

          {/* Quick links */}
          <div className="footer__col">
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__links">
              <li><a href="#hero">Home</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#upload">Analyze Bill</a></li>
              <li><a href="#benefits">Benefits</a></li>
            </ul>
          </div>

          {/* Technology */}
          <div className="footer__col">
            <h4 className="footer__col-title">Technology</h4>
            <ul className="footer__links">
              <li><span>Google Gemini AI</span></li>
              <li><span>Groq Vision</span></li>
              <li><span>OpenRouter</span></li>
              <li><span>React + Flask</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__col-title">Contact</h4>
            <ul className="footer__contact">
              <li>
                <MapPin size={14} />
                <span>Maharashtra, India</span>
              </li>
              <li>
                <Mail size={14} />
                <a href="mailto:info@energybae.in">info@energybae.in</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p>© {year} EnergyBae. All rights reserved.</p>
          <p className="footer__bottom-tech">
            <Sun size={13} />
            Powered by Renewable Energy & AI
          </p>
        </div>
      </div>
    </footer>
  );
}
