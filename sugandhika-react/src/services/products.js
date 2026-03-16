import {
  collection, doc, setDoc, getDocs, getDoc,
  updateDoc, deleteDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { PRODUCTS as staticProducts } from '../data/products';

const PRODUCTS_COLLECTION = 'products';

// ── CRUD Operations ──

// Fetch all products (ordered by name)
export const getAllProducts = async () => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
};

// Get a single product by ID
export const getProductById = async (id) => {
  try {
    // We store the original static IDs as string doc IDs during migration for consistency
    const docRef = doc(db, PRODUCTS_COLLECTION, id.toString());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.error('Error fetching product:', err);
    return null;
  }
};

// Add a new product (generates random ID or uses provided)
export const addProduct = async (productData) => {
  try {
    const id = productData.id ? productData.id.toString() : Date.now().toString();
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(docRef, { ...productData, id: parseInt(id) });
    return id;
  } catch (err) {
    console.error('Error adding product:', err);
    throw err;
  }
};

// Update an existing product
export const updateProduct = async (id, updates) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id.toString());
    await updateDoc(docRef, updates);
    return true;
  } catch (err) {
    console.error('Error updating product:', err);
    throw err;
  }
};

// Delete a product
export const deleteProduct = async (id) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id.toString());
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting product:', err);
    throw err;
  }
};

// ── Migration Utility ──

// ONE-TIME SCRIPT: Uploads static products to Firestore
// Call this once from the browser console or a temporary button
export const migrateStaticProductsToFirestore = async () => {
  console.log('Starting migration of static products to Firestore...');
  let migratedCount = 0;
  
  for (const product of staticProducts) {
    try {
      // Use the static product ID as the Firestore document ID for routing stability
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id.toString());
      await setDoc(docRef, product);
      console.log(`Migrated: ${product.name}`);
      migratedCount++;
    } catch (err) {
      console.error(`Failed to migrate ${product.name}:`, err);
    }
  }
  
  console.log(`Migration complete! Successfully migrated ${migratedCount} products.`);
  return migratedCount;
};
