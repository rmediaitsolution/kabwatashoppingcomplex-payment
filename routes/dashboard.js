const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db, bucket } = require('../config/firebase');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all dashboard routes
router.use(requireAuth);

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// Dashboard page
router.get('/', async (req, res) => {
  try {
    // Get user's payment history
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', req.session.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const payments = [];
    paymentsSnapshot.forEach(doc => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      });
    });

    res.render('dashboard', {
      title: 'Dashboard - Kabwata Shopping',
      user: req.session.user,
      payments: payments
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error_msg', 'Failed to load dashboard');
    res.redirect('/login');
  }
});

// Submit payment
router.post('/submit-payment', upload.single('file'), async (req, res) => {
  try {
    const { amount } = req.body;
    const file = req.file;

    if (!amount || !file) {
      req.flash('error_msg', 'Amount and file are required');
      return res.redirect('/dashboard');
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      req.flash('error_msg', 'Please enter a valid amount');
      return res.redirect('/dashboard');
    }

    // Upload file to Firebase Storage
    const fileName = `payments/${req.session.user.uid}/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(fs.readFileSync(file.path), {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: req.session.user.uid
        }
      }
    });

    // Get download URL
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-31-2030' // Long expiry
    });

    // Save payment to Firestore
    await db.collection('payments').add({
      userId: req.session.user.uid,
      amount: numAmount,
      fileUrl: url,
      fileName: file.originalname,
      createdAt: new Date()
    });

    // Delete local file
    fs.unlinkSync(file.path);

    req.flash('success_msg', 'Payment submitted successfully!');
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Payment submission error:', error);

    // Clean up local file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    req.flash('error_msg', 'Failed to submit payment');
    res.redirect('/dashboard');
  }
});

module.exports = router;