import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Image as ImageIcon, FileText } from 'lucide-react';

export function SiteFooter() {
  return (
    <>
      <div className="idx-footer-partners">
        <div className="idx-container idx-footer-partners-inner">
          <div className="idx-footer-partner">ARDUINO</div>
          <div className="idx-footer-partner">RASPBERRY PI</div>
          <div className="idx-footer-partner">ESP32</div>
          <div className="idx-footer-partner">NASA OPEN</div>
          <div className="idx-footer-partner">IEEE</div>
          <div className="idx-footer-partner">MAKER FAIRE</div>
        </div>
      </div>

      <footer className="idx-footer">
        <div className="idx-container">
          <div className="idx-footer-grid">
            <div>
              <h3 className="idx-footer-col-title">Office</h3>
              <div className="idx-footer-office-item">
                <span className="idx-footer-icon"><MapPin size={16} /></span>
                <span>Lagos, Nigeria</span>
              </div>
              <div className="idx-footer-office-item">
                <span className="idx-footer-icon"><Phone size={16} /></span>
                <span>+234 (0) 800 000 0000</span>
              </div>
              <div className="idx-footer-office-item">
                <span className="idx-footer-icon"><Mail size={16} /></span>
                <span>hello@idevrx.com</span>
              </div>
              <div className="idx-footer-office-item">
                <span className="idx-footer-icon"><Clock size={16} /></span>
                <span>Mon–Fri, 9 AM – 6 PM WAT</span>
              </div>
            </div>

            <div>
              <h3 className="idx-footer-col-title">Latest news</h3>
              <Link to="/blog/first-rover" className="idx-footer-news-item">
                <span className="idx-footer-news-thumb"><ImageIcon size={22} /></span>
                <span className="idx-footer-news-content">
                  <div className="idx-footer-news-title">
                    Project 001 published — the first IDEVRX engineering record
                  </div>
                  <div className="idx-footer-news-date">
                    <Clock size={12} /> October 2026
                  </div>
                </span>
              </Link>
              <Link to="/blog/creator-guidelines" className="idx-footer-news-item">
                <span className="idx-footer-news-thumb"><FileText size={22} /></span>
                <span className="idx-footer-news-content">
                  <div className="idx-footer-news-title">
                    Creator guidelines: what makes a project reproducible
                  </div>
                  <div className="idx-footer-news-date">
                    <Clock size={12} /> October 2026
                  </div>
                </span>
              </Link>
            </div>

            <div>
              <h3 className="idx-footer-col-title">Shortcuts</h3>
              <div className="idx-footer-shortcuts">
                <div>
                  <Link className="idx-footer-shortcut" to="/explore">Explore</Link>
                  <Link className="idx-footer-shortcut" to="/learning">Learning paths</Link>
                  <Link className="idx-footer-shortcut" to="/challenges">Challenges</Link>
                  <Link className="idx-footer-shortcut" to="/components">Components</Link>
                  <Link className="idx-footer-shortcut" to="/tutorials">Tutorials</Link>
                </div>
                <div>
                  <Link className="idx-footer-shortcut" to="/creator-guidelines">Creator guide</Link>
                  <Link className="idx-footer-shortcut" to="/community-guidelines">Community guide</Link>
                  <Link className="idx-footer-shortcut" to="/about">About</Link>
                  <Link className="idx-footer-shortcut" to="/contact">Contact</Link>
                  <Link className="idx-footer-shortcut" to="/help">Help</Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className="idx-footer-col-title">Platform hours</h3>
              <p className="idx-footer-hours-text">
                IDEVRX is always available. Human support and project review happen during working hours.
              </p>
              <div className="idx-footer-hours-row">
                <span>Monday – Friday</span>
                <span className="idx-footer-hours-dots" />
                <span>9 AM – 6 PM</span>
              </div>
              <div className="idx-footer-hours-row">
                <span>Saturday</span>
                <span className="idx-footer-hours-dots" />
                <span>10 AM – 2 PM</span>
              </div>
              <div className="idx-footer-hours-row">
                <span>Sunday</span>
                <span className="idx-footer-hours-dots" />
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="idx-footer-bottom">
          <div className="idx-container idx-footer-bottom-inner">
            <div>Copyright © 2026 IDEVRX. All Rights Reserved.</div>
            <div className="idx-footer-bottom-links">
              <Link to="/policies/privacy">Privacy Policy</Link>
              <Link to="/policies/terms">Terms</Link>
              <Link to="/policies/cookies">Cookies</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
