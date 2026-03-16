import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import './Collection.css';

const CATS = [
  { key: 'all',        label: 'All'        },
  { key: 'floral',     label: 'Floral'     },
  { key: 'sculptural', label: 'Sculptural' },
  { key: 'tealight',   label: 'Tealights'  },
  { key: 'gift',       label: 'Gifts'      },
];

export default function Collection() {
  const [searchParams]                  = useSearchParams();
  const [cat, setCat]                   = useState(searchParams.get('cat') || 'all');
  const [sort, setSort]                 = useState('default');
  const { products, loadingProducts }   = useProducts();
  const gridRef = useRef(null);

  // Animate grid whenever filtered list changes
  useEffect(() => {
    import('gsap').then(mod => {
      const gsap = mod.gsap || mod.default;
      if (!gsap || !gridRef.current) return;
      const cards = gridRef.current.querySelectorAll('.prod-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all',   // remove inline styles after animation so CSS takes over
        }
      );
    }).catch(() => {});
  }, [cat, sort, products]);

  // Filter + sort
  const filtered = (() => {
    if (!products) return [];
    let list = cat === 'all' ? products : products.filter(p => p.category === cat);
    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name')       list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  })();



  return (
    <div className="collection-page">

      {/* Page hero */}
      <div className="page-hero">
        <div>
          <span className="sec-eyebrow">Handcrafted Selection</span>
          <h1 className="sec-title">The <em>Collection</em></h1>
        </div>
        <p>Every candle is a story. Hand-sculpted and hand-poured in Nellore from natural botanicals.</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-tabs">
          {CATS.map(c => (
            <button
              key={c.key}
              className={`filter-tab ${cat === c.key ? 'active' : ''}`}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="filters-right">
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low–High</option>
            <option value="price-desc">Price: High–Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="coll-grid" ref={gridRef}>
        {loadingProducts ? (
          <div className="coll-loading" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>Loading collection...</div>
        ) : (
          filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={0} />
          ))
        )}
      </div>

    </div>
  );
}
