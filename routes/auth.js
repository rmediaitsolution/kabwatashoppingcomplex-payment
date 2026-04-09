const express = require('express');
const axios = require('axios');
const { db, auth } = require('../config/firebase');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Firebase Auth REST API endpoints
const FIREBASE_API_KEY = 'AIzaSyAYor7k6ON0vZ2mXKFGEiP9e9MlTrXOebg'; // Replace with your API key

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login - Kabwata Shopping' });
});

// Signup page
router.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('signup', { title: 'Sign Up - Kabwata Shopping' });
});

// Signup POST
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      req.flash('error_msg', 'All fields are required');
      return res.redirect('/signup');
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters');
      return res.redirect('/signup');
    }

    // Create user with Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name
    });

    // Save user details to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      name: name,
      email: email,
      createdAt: new Date()
    });

    // Create session
    req.session.user = {
      uid: userRecord.uid,
      name: name,
      email: email
    };

    req.flash('success_msg', 'Account created successfully!');
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Signup error:', error);
    let errorMessage = 'Failed to create account';

    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email already exists';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }

    req.flash('error_msg', errorMessage);
    res.redirect('/signup');
  }
});

// Login POST
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Email and password are required');
      return res.redirect('/login');
    }

    // Sign in with Firebase Auth REST API
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
      email: email,
      password: password,
      returnSecureToken: true
    });

    const { localId, displayName } = response.data;

    // Get user details from Firestore
    const userDoc = await db.collection('users').doc(localId).get();
    if (!userDoc.exists) {
      req.flash('error_msg', 'User data not found');
      return res.redirect('/login');
    }

    const userData = userDoc.data();

    // Create session
    req.session.user = {
      uid: localId,
      name: userData.name,
      email: userData.email
    };

    req.flash('success_msg', 'Logged in successfully!');
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Invalid email or password';

    if (error.response && error.response.data && error.response.data.error) {
      const firebaseError = error.response.data.error.message;
      if (firebaseError === 'EMAIL_NOT_FOUND' || firebaseError === 'INVALID_PASSWORD') {
        errorMessage = 'Invalid email or password';
      } else if (firebaseError === 'USER_DISABLED') {
        errorMessage = 'Account is disabled';
      }
    }

    req.flash('error_msg', errorMessage);
    res.redirect('/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;