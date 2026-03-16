import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyBiFBqlju2UtWhEGaL_Muz5MiKMz2HBRU0",
  authDomain:        "sugandhika-f6d1f.firebaseapp.com",
  projectId:         "sugandhika-f6d1f",
  storageBucket:     "sugandhika-f6d1f.firebasestorage.app",
  messagingSenderId: "171259482340",
  appId:             "1:171259482340:web:207020e20752aed3149cf1",
  measurementId:     "G-ZR3R339DMV",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── Google Provider ──
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── Sign in with Google popup ──
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// ── Email/Password sign up ──
export const registerWithEmail = async (name, email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);
  return cred.user;
};

// ── Email/Password sign in ──
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// ── Sign out ──
export const logOut = () => firebaseSignOut(auth);

// ── Send email verification ──
export const resendVerification = () =>
  auth.currentUser ? sendEmailVerification(auth.currentUser) : Promise.reject('No user');

// ── Phone auth — setup reCAPTCHA ──
export const setupRecaptcha = (containerId) => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {},
  });
  return window.recaptchaVerifier;
};

// ── Send OTP ──
export const sendOTP = (phoneNumber) => {
  const verifier = window.recaptchaVerifier;
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
};

// ── Auth state listener ──
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

export default app;
