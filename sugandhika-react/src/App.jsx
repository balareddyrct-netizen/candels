import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider, ToastProvider, AuthProvider, ProductProvider } from './context/AppContext';
import { useAuth } from './context/AppContext';
import Navbar      from './components/Navbar';
import Footer      from './components/Footer';
import PageLoader  from './components/PageLoader';
import Home        from './pages/Home';
import Collection  from './pages/Collection';
import Product     from './pages/Product';
import Customize   from './pages/Customize';
import Cart        from './pages/Cart';
import Story       from './pages/Story';
import Ritual      from './pages/Ritual';
import SignIn      from './pages/SignIn';
import SignUp      from './pages/SignUp';
import Account     from './pages/Account';
import Checkout    from './pages/Checkout';
import Admin       from './pages/Admin';

function RouteTransition() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    import('gsap').then(mod => {
      const gsap = mod.gsap || mod.default;
      if (!gsap) return;
      gsap.fromTo('main', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }).catch(() => {});
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) return null;
  if (!isLoggedIn) return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, authLoading } = useAuth();
  if (authLoading) return null;
  if (!isLoggedIn) return <Navigate to="/signin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function Cursor() {
  useEffect(() => {
    const c = document.getElementById('cursor');
    const r = document.getElementById('cursor-ring');
    if (!c || !r) return;
    let raf;
    const move   = (e) => { c.style.left=e.clientX+'px'; c.style.top=e.clientY+'px'; raf=requestAnimationFrame(()=>{r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';}); };
    const grow   = () => { c.style.width='20px';c.style.height='20px';r.style.width='50px';r.style.height='50px';r.style.opacity='.3'; };
    const shrink = () => { c.style.width='10px';c.style.height='10px';r.style.width='34px';r.style.height='34px';r.style.opacity='.5'; };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', e => { if(e.target.closest('a,button,[data-hover]')) grow(); else shrink(); });
    return () => { document.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  });
  return <><div id="cursor" /><div id="cursor-ring" /></>;
}

function AppLayout() {
  return (
    <>
      <Cursor />
      <Navbar />
      <RouteTransition />
      <main>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/collection"  element={<Collection />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/customize"   element={<Customize />} />
          <Route path="/cart"        element={<Cart />} />
          <Route path="/story"       element={<Story />} />
          <Route path="/ritual"      element={<Ritual />} />
          <Route path="/signin"      element={<SignIn />} />
          <Route path="/signup"      element={<SignUp />} />
          <Route path="/account"     element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/checkout"    element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/admin"       element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*"            element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <ToastProvider>
              {!loaded && <PageLoader onComplete={() => setLoaded(true)} />}
              <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
                <AppLayout />
              </div>
            </ToastProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
