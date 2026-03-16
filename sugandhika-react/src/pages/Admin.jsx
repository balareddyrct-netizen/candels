import { useState, useEffect } from 'react';
import { useProducts, useToast } from '../context/AppContext';
import { getAllOrders } from '../services/firestore';
import { updateProduct, addProduct, deleteProduct } from '../services/products';
import { useRevealAll } from '../hooks/useReveal';
import './Admin.css';

export default function Admin() {
  const [tab, setTab] = useState('products');
  const { products, loadingProducts, refreshProducts } = useProducts();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const showToast = useToast();
  useRevealAll();

  // Price Edit State
  const [editingPrice, setEditingPrice] = useState(null); // id of product
  const [newPrice, setNewPrice] = useState('');

  // Add Product State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [form, setForm] = useState({
    name: '', scent: '', price: '', color: '#F8F2E8',
    category: 'floral', weight: '200g', burnTime: '45hr', desc: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (tab === 'orders') {
      setLoadingOrders(true);
      getAllOrders().then(data => {
        setOrders(data);
        setLoadingOrders(false);
      });
    }
  }, [tab]);

  // ── Handlers for Products ──

  const handleSavePrice = async (p) => {
    if (!newPrice || isNaN(newPrice)) return;
    try {
      await updateProduct(p.id, { price: parseInt(newPrice, 10) });
      showToast('Price updated successfully');
      setEditingPrice(null);
      refreshProducts();
    } catch (err) {
      showToast('Failed to update price');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = async () => {
    if (!form.name.trim() || !form.price) return;
    setSubmitting(true);
    try {
      const newProduct = {
        ...form,
        price: parseInt(form.price) || 0,
        sizes: ['S', 'M', 'L'],
        featured: false,
        stock: 20,
        img: imgPreview || null,
        gallery: imgPreview ? [imgPreview] : [],
      };
      await addProduct(newProduct);
      showToast(`${form.name} added successfully!`);
      setUploadOpen(false);
      setImgPreview(null);
      setForm({ name: '', scent: '', price: '', color: '#F8F2E8', category: 'floral', weight: '200g', burnTime: '45hr', desc: '' });
      refreshProducts();
    } catch (err) {
      showToast('Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (window.confirm(`Are you sure you want to delete ${p.name}?`)) {
      try {
        await deleteProduct(p.id);
        showToast('Product deleted');
        refreshProducts();
      } catch (err) {
        showToast('Failed to delete product');
      }
    }
  };

  // ── Render Helpers ──

  const renderProductsTab = () => (
    <div className="admin-panel-content">
      <div className="admin-header-row">
        <h2>Manage Collection</h2>
        <button className="btn-solid" onClick={() => setUploadOpen(true)}>+ Add New Candle</button>
      </div>

      {loadingProducts ? (
        <div style={{ padding: '40px 0' }}>Loading products...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-cell">
                      <img src={p.img || '/images/rose_01.jpg'} alt="" className="admin-thumb" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                  <td>{p.stock}</td>
                  <td>
                    {editingPrice === p.id ? (
                      <div className="price-edit-row">
                        <span>₹</span>
                        <input
                          type="number"
                          className="price-input"
                          value={newPrice}
                          onChange={e => setNewPrice(e.target.value)}
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleSavePrice(p)}
                        />
                        <button className="btn-save-sm" onClick={() => handleSavePrice(p)}>Save</button>
                        <button className="btn-cancel-sm" onClick={() => setEditingPrice(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="price-display-row">
                        <span>₹{p.price}</span>
                        <button 
                          className="btn-edit-sm" 
                          onClick={() => { setEditingPrice(p.id); setNewPrice(p.price); }}
                        >✎</button>
                      </div>
                    )}
                  </td>
                  <td>
                    <button className="btn-delete-sm" onClick={() => handleDelete(p)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOrdersTab = () => (
    <div className="admin-panel-content">
      <div className="admin-header-row">
        <h2>Store Orders</h2>
        <span className="order-count">{orders.length} Total Orders</span>
      </div>

      {loadingOrders ? (
        <div style={{ padding: '40px 0' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">No orders placed yet.</div>
      ) : (
        <div className="admin-orders-list">
          {orders.map(o => (
            <div key={o.id} className="admin-order-card">
              <div className="admin-order-header">
                <div>
                  <span className="order-id">#{o.id.slice(-8).toUpperCase()}</span>
                  <span className={`order-status ${o.status}`}>{o.status === 'paid' ? '✓ PAID' : o.status}</span>
                </div>
                <div className="order-date">
                  {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'}
                </div>
              </div>

              <div className="admin-order-body">
                <div className="admin-order-customer">
                  <strong>Customer</strong>
                  <p>{o.delivery?.name}</p>
                  <p>{o.delivery?.email}</p>
                  <p>{o.delivery?.phone}</p>
                </div>
                <div className="admin-order-address">
                  <strong>Delivery Address</strong>
                  <p>{o.delivery?.address}</p>
                  <p>{o.delivery?.city}, {o.delivery?.state} - {o.delivery?.pincode}</p>
                  <p style={{ fontSize: '0.8em', color: 'var(--deep)' }}>Loc: {o.delivery?.location?.lat.toFixed(4)}, {o.delivery?.location?.lng.toFixed(4)}</p>
                </div>
                <div className="admin-order-items">
                  <strong>Items</strong>
                  {o.items?.map((item, idx) => (
                    <div key={idx} className="admin-order-item-row">
                      <span>{item.qty}x {item.name} ({item.size})</span>
                      <span>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="admin-order-total">
                    <span>Total</span>
                    <span>₹{o.total}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-page page-enter">
      <div className="breadcrumb">
        <span>Admin Dashboard</span>
      </div>

      <div className="admin-layout">
        <div className="admin-sidebar">
          <h3>Admin Panel</h3>
          <button 
            className={`admin-tab ${tab === 'products' ? 'active' : ''}`} 
            onClick={() => setTab('products')}
          >
            🕯️ Products
          </button>
          <button 
            className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} 
            onClick={() => setTab('orders')}
          >
            📦 Orders
          </button>
        </div>

        <div className="admin-main">
          {tab === 'products' ? renderProductsTab() : renderOrdersTab()}
        </div>
      </div>

      {/* Upload Modal (Moved from Collection) */}
      {uploadOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setUploadOpen(false)}>
          <div className="modal-box admin-modal">
            <button className="modal-x" onClick={() => setUploadOpen(false)}>×</button>
            <h3 className="modal-title">Add New Candle</h3>

            <div className="file-drop" onClick={() => document.getElementById('img-upload').click()}>
              <input
                id="img-upload" type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleFileChange}
              />
              {imgPreview
                ? <img src={imgPreview} alt="preview" className="img-preview" />
                : <>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🕯️</div>
                    <p>Tap to upload candle photo</p>
                  </>
              }
            </div>

            <div className="f-row">
              <div className="f-group">
                <label>Product Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Midnight Rose"
                />
              </div>
              <div className="f-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="floral">Floral</option>
                  <option value="sculptural">Sculptural</option>
                  <option value="tealight">Tealight</option>
                  <option value="gift">Gift</option>
                </select>
              </div>
            </div>

            <div className="f-group">
              <label>Fragrance Notes</label>
              <input
                value={form.scent}
                onChange={e => setForm(f => ({ ...f, scent: e.target.value }))}
                placeholder="e.g. Rose · Oud · Amber"
              />
            </div>

            <div className="f-row">
              <div className="f-group">
                <label>Price (₹)</label>
                <input
                  type="number" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="699"
                />
              </div>
              <div className="f-group">
                <label>Wax Color</label>
                <input
                  type="color" value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ height: 42, padding: 4, width: '100%' }}
                />
              </div>
            </div>

            <div className="f-row">
              <div className="f-group">
                <label>Weight</label>
                <input
                  value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                  placeholder="e.g. 200g"
                />
              </div>
              <div className="f-group">
                <label>Burn Time</label>
                <input
                  value={form.burnTime}
                  onChange={e => setForm(f => ({ ...f, burnTime: e.target.value }))}
                  placeholder="e.g. 45hr"
                />
              </div>
            </div>

            <div className="f-group">
              <label>Description</label>
              <textarea
                value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                placeholder="Describe the scent story…"
              />
            </div>

            <button className="submit-btn" onClick={handleAddSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Add to Collection'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
