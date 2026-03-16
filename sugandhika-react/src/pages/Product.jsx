import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart, useToast, useProducts } from '../context/AppContext';
import { useRevealAll } from '../hooks/useReveal';
import ProductCard from '../components/ProductCard';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loadingProducts } = useProducts();
  const { addToCart } = useCart();
  const showToast = useToast();
  useRevealAll();

  // Find product by id (comparing string id from URL to product.id directly since migration stored IDs are often strings/numbers)
  const product = products.find(p => p.id && p.id.toString() === id.toString());

  const [selectedImg, setSelectedImg] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);

  // Safely initialize state once product is loaded
  useEffect(() => {
    if (product) {
      setSelectedImg(product.img);
      setSelectedSize(product.sizes[Math.min(1, product.sizes.length - 1)]);
    }
  }, [product]);

  if (loadingProducts) {
    return <div className="product-page page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading candle details...</div>;
  }

  if (!product) {
    return (
      <div className="product-page page-enter" style={{ minHeight: '80vh', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Candle not found</h2>
        <Link to="/collection" className="btn-solid" style={{ marginTop: 20 }}>Return to Collection</Link>
      </div>
    );
  }

  const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
  const fallback = products.filter(p => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(product, selectedSize, qty);
    showToast(`${product.name} × ${qty} added to cart`);
  };

  return (
    <div className="product-page page-enter">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/collection">Collection</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="detail-grid">
        {/* Visual */}
        <div className="detail-visual">
          <div className="detail-img-wrap">
            <img src={selectedImg} alt={product.name} className="detail-main-img" />
          </div>
          {product.gallery && product.gallery.length > 1 && (
            <div className="detail-thumbs">
              {product.gallery.map((src, i) => (
                <img
                  key={i} src={src} alt={`${product.name} ${i + 1}`}
                  className={`detail-thumb ${selectedImg === src ? 'active' : ''}`}
                  onClick={() => setSelectedImg(src)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="detail-info">
          <Link to="/collection" className="back-link">← Back to Collection</Link>
          <div className="prod-cat">{product.category}</div>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-notes">{product.scent}</div>
          <div className="detail-rating">★★★★★ <span>48 reviews</span></div>
          <p className="detail-desc">{product.desc}</p>

          <div className="detail-specs">
            {[
              { k: 'Weight', v: product.weight || '200g' },
              { k: 'Burn Time', v: product.burnTime || '45hr' },
              { k: 'Wax', v: 'Soy & Beeswax' },
              { k: 'Wick', v: 'Cotton' },
            ].map(s => (
              <div className="spec" key={s.k}>
                <div className="spec-key">{s.k}</div>
                <div className="spec-val">{s.v}</div>
              </div>
            ))}
          </div>

          <span className="size-label">Size</span>
          <div className="size-row">
            {product.sizes.map(s => (
              <button key={s} className={`size-opt ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
            ))}
          </div>

          <div className="qty-row">
            <span className="qty-label">Qty</span>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <div className="qty-val">{qty}</div>
              <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>

          <div className="price-row">
            <div className="big-price">₹{product.price * qty}</div>
            <div className="price-note">Free shipping<br />above ₹1,000</div>
          </div>

          <div className="action-row">
            <button className="btn-solid" style={{ flex: 1 }} onClick={handleAdd}>Add to Cart</button>
            <Link to="/customize" className="btn-outline"><span>Customize</span></Link>
          </div>

          <div className="assurances">
            {['Natural wax & botanicals', 'Ships in 3 days', 'Recyclable vessel'].map(a => (
              <div className="assurance" key={a}><span className="assurance-dot" />{a}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="related">
        <span className="sec-eyebrow">You may also like</span>
        <h2 className="sec-title">Related <em>Candles</em></h2>
        <div className="related-grid">
          {(related.length ? related : fallback).map((p, i) => (
            <ProductCard key={p.id} product={p} delay={i * 80} />
          ))}
        </div>
      </div>
    </div>
  );
}
