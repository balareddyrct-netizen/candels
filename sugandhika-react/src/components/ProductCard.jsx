import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/AppContext';
import { useToast } from '../context/AppContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();
  const showToast = useToast();
  const navigate = useNavigate();

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0]);
    showToast(`${product.name} added to cart`);
  };

  const goToProduct = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="prod-card" onClick={goToProduct}>

      {/* Image area */}
      <div className="prod-img-wrap">
        {product.img && !imgError ? (
          <img
            src={product.img}
            alt={product.name}
            className="prod-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="prod-img-fallback" style={{ background: product.color || '#F5F0E0' }}>
            <span>🕯️</span>
          </div>
        )}

        {/* Badges */}
        {product.featured && (
          <span className="prod-badge">Featured</span>
        )}
        {product.stock <= 8 && (
          <span className="prod-badge prod-badge-low">Low Stock</span>
        )}

        {/* Hover overlay */}
        <div className="prod-overlay">
          <button
            className="overlay-btn"
            onClick={goToProduct}
          >
            View
          </button>
          <button
            className="overlay-btn"
            onClick={handleAdd}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="prod-body">
        <div className="prod-name">{product.name}</div>
        <div className="prod-scent">{product.scent}</div>
        <div className="prod-foot">
          <div>
            <div className="prod-price">₹{product.price}</div>
            <div className="prod-meta">{product.weight} · {product.burnTime}</div>
          </div>
          <div className="prod-foot-right">
            <span
              className="prod-swatch"
              style={{ background: product.color }}
            />
            <button
              className="prod-add"
              onClick={handleAdd}
              aria-label="Add to cart"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
