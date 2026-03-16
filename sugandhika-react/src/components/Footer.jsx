import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <img src="/images/logo.jpg" alt="Sugandhika" className="footer-logo-img" />
            <span className="footer-logo-name">Sugandhika</span>
          </div>
          <p>Handcrafted sculptural candles from Nellore, Andhra Pradesh. Each piece is shaped by hand, scented with botanicals, made to bring light into your home.</p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/collection">All Candles</Link>
          <Link to="/collection?cat=floral">Floral</Link>
          <Link to="/collection?cat=sculptural">Sculptural</Link>
          <Link to="/collection?cat=tealight">Tealights</Link>
          <Link to="/customize">Customize</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/story">Our Story</Link>
          <Link to="/ritual">Candle Ritual</Link>
          <Link to="/story#craft">Craft & Materials</Link>
          <Link to="/story#sustainability">Sustainability</Link>
        </div>
        <div className="footer-col">
          <h4>Connect</h4>
          <a href="#">Instagram</a>
          <a href="#">WhatsApp</a>
          <a href="mailto:hello@sugandhika.in">hello@sugandhika.in</a>
          <a href="#">Nellore, Andhra Pradesh</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Sugandhika. All rights reserved.</span>
        <span>Made with love in Nellore, Andhra Pradesh</span>
      </div>
    </footer>
  );
}
