import {
  doc, setDoc, addDoc, collection,
  query, where, orderBy, getDocs, getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ── User Profile ──
export const saveUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return snap.data();
  return null;
};

// ── Orders ──
export const saveOrder = async (orderData) => {
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp(),
    status: 'paid',
  });
  return ref.id;
};

export const getOrdersByUser = async (uid) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('uid', '==', uid)
    );
    const snap = await getDocs(q);
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort client-side (newest first) to avoid needing a composite index
    orders.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
    return orders;
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return [];
  }
};

// Admin: Get all orders across the entire store
export const getAllOrders = async () => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    if (err.message.includes('index')) {
      console.warn('Index required for ordered getAllOrders, falling back to client sort');
      const snap = await getDocs(collection(db, 'orders'));
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      orders.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      });
      return orders;
    }
    console.error('Failed to fetch all orders:', err);
    return [];
  }
};
