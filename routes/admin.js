const express = require('express');
const { db } = require('../config/firebase');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth and admin middleware
router.use(requireAuth);
router.use(requireAdmin);

// Admin dashboard
router.get('/', async (req, res) => {
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = [];

    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      });
    });

    res.render('admin', {
      title: 'Admin Panel - Kabwata Shopping',
      user: req.session.user,
      users: users,
      selectedUser: null,
      payments: []
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.flash('error_msg', 'Failed to load admin panel');
    res.redirect('/dashboard');
  }
});

// View user payments
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user details
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin-9382-hidden');
    }

    const user = {
      id: userDoc.id,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt.toDate()
    };

    // Get user's payments
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', userId)
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

    // Group payments by month
    const groupedPayments = groupPaymentsByMonth(payments);

    // Get all users for the list
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      });
    });

    res.render('admin', {
      title: 'Admin Panel - Kabwata Shopping',
      user: req.session.user,
      users: users,
      selectedUser: user,
      payments: groupedPayments
    });

  } catch (error) {
    console.error('User payments error:', error);
    req.flash('error_msg', 'Failed to load user payments');
    res.redirect('/admin-9382-hidden');
  }
});

function groupPaymentsByMonth(payments) {
  const groups = {};

  payments.forEach(payment => {
    const date = payment.createdAt;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    if (!groups[monthKey]) {
      groups[monthKey] = {
        name: monthName,
        payments: [],
        total: 0
      };
    }

    groups[monthKey].payments.push(payment);
    groups[monthKey].total += payment.amount;
  });

  // Sort by month (newest first)
  const sortedGroups = Object.keys(groups)
    .sort()
    .reverse()
    .reduce((result, key) => {
      result[key] = groups[key];
      return result;
    }, {});

  return sortedGroups;
}

module.exports = router;