import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  logOut,
  onAuthChange,
  resendVerification,
} from '../firebase';
import { getUserProfile } from '../services/firestore';
import { getAllProducts } from '../services/products';

// ─────────────────────────────────────────
// AUTH CONTEXT (Firebase)
// ─────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Fetch additional profile data from Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          // For testing: Also manually let testuser2026@gmail.com be an admin
          const isTestAdmin = firebaseUser.email === 'testuser2026@gmail.com' || firebaseUser.email === 'admin@sugandhika.com';
          setIsAdmin(profile?.isAdmin === true || isTestAdmin);
        } catch (err) {
          console.error('Failed to fetch user profile for admin check', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Sign up with email + password (sends verification email)
  const signUp = useCallback(async ({ name, email, password }) => {
    try {
      await registerWithEmail(name, email, password);
      return { success: true };
    } catch (err) {
      return { error: firebaseErrorMessage(err.code) };
    }
  }, []);

  // Sign in with email + password
  const signIn = useCallback(async ({ email, password }) => {
    try {
      await loginWithEmail(email, password);
      return { success: true };
    } catch (err) {
      return { error: firebaseErrorMessage(err.code) };
    }
  }, []);

  // Sign in with Google
  const signInGoogle = useCallback(async () => {
    try {
      await signInWithGoogle();
      return { success: true };
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return { error: null }; // user closed popup
      return { error: firebaseErrorMessage(err.code) };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    await logOut();
  }, []);

  // Resend verification email
  const resendEmail = useCallback(async () => {
    try {
      await resendVerification();
      return { success: true };
    } catch (err) {
      return { error: 'Could not resend email. Try again shortly.' };
    }
  }, []);

  const isLoggedIn = !!user;
  const isVerified = user?.emailVerified || user?.providerData?.[0]?.providerId === 'phone';

  return (
    <AuthContext.Provider value={{
      user, isAdmin, authLoading,
      signUp, signIn, signInGoogle,
      signOut, resendEmail,
      isLoggedIn, isVerified,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─────────────────────────────────────────
// PRODUCT CONTEXT
// ─────────────────────────────────────────
const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    let mounted = true;
    getAllProducts().then(data => {
      if (mounted) {
        setProducts(data);
        setLoadingProducts(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Function to re-fetch products (useful after admin edits)
  const refreshProducts = async () => {
    setLoadingProducts(true);
    const data = await getAllProducts();
    setProducts(data);
    setLoadingProducts(false);
  };

  return (
    <ProductContext.Provider value={{ products, loadingProducts, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);

// Human-readable Firebase error messages
function firebaseErrorMessage(code) {
  const map = {
    'auth/email-already-in-use':    'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Incorrect email or password.',
    'auth/too-many-requests':       'Too many attempts. Please try again later.',
    'auth/network-request-failed':  'Network error. Check your connection.',
    'auth/user-disabled':           'This account has been disabled.',
    'auth/popup-blocked':           'Popup was blocked. Please allow popups for this site.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}


// ─────────────────────────────────────────
// CART CONTEXT
// ─────────────────────────────────────────
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sg_cart_v1')) || []; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('sg_cart_v1', JSON.stringify(cart)); } catch {}
  }, [cart]);

  const addToCart = useCallback((product, size, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.size === size);
      if (existing) return prev.map(i =>
        i.id === product.id && i.size === size ? { ...i, qty: i.qty + qty } : i
      );
      return [...prev, {
        id: product.id, name: product.name,
        price: product.price, img: product.img,
        color: product.color, size, qty,
      }];
    });
  }, []);

  const removeFromCart = useCallback((id, size) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
  }, []);

  const updateQty = useCallback((id, size, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.id === id && i.size === size ? { ...i, qty } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);


// ─────────────────────────────────────────
// TOAST CONTEXT
// ─────────────────────────────────────────
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg: '', show: false });

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
