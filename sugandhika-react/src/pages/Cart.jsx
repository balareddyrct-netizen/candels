import { Link, useNavigate } from 'react-router-dom';
import { useCart, useToast, useAuth } from '../context/AppContext';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart();
  const { isLoggedIn } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const handleRemove = (id, size, name) => {
    removeFromCart(id, size);
    showToast(`${name} removed`);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      showToast('Please sign in to checkout');
      navigate('/signin', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-page page-enter">
      <div className="cart-header">
        <span className="sec-eyebrow">Review your selection</span>
        <h1 className="sec-title">Your <em>Cart</em></h1>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty.</p>
              <Link to="/collection" className="btn-solid">Explore Collection</Link>
            </div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={`${item.id}-${item.size}`}>
                <div className="ci-img">
                  {item.img
                    ? <img src={item.img} alt={item.name} />
                    : <div style={{ width: '100%', height: '100%', background: item.color || 'var(--sand)' }} />}
                </div>
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-size">Size: {item.size}</div>
                  <div className="ci-qty">
                    <button className="ci-qty-btn" onClick={() => updateQty(item.id, item.size, item.qty - 1)}>−</button>
                    <span className="ci-qty-val">{item.qty}</span>
                    <button className="ci-qty-btn" onClick={() => updateQty(item.id, item.size, item.qty + 1)}>+</button>
                  </div>
                </div>
                <div className="ci-right">
                  <div className="ci-price">₹{item.price * item.qty}</div>
                  <button className="ci-remove" onClick={() => handleRemove(item.id, item.size, item.name)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="cs-title">Order Summary</div>
          {cart.map(item => (
            <div className="cs-row" key={`${item.id}-${item.size}`}>
              <span>{item.name} × {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="cs-total">
            <span>Total</span>
            <span className="cs-amount">₹{cartTotal}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
          <Link to="/collection" className="continue-btn">Continue Shopping</Link>
          <div className="cs-assurances">
            {['Free shipping above ₹1,000','Ships in 3 business days','100% natural ingredients','Recyclable packaging'].map(a => (
              <div className="cs-assurance" key={a}><span className="cs-dot" />{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
