// functions/index.js
// Firebase Cloud Functions for NexCart

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// ─── 1. On Order Created: Update Stock & Send Notification ───────────────────
exports.onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const { orderId } = context.params;

    try {
      // Update stock for each item
      const batch = db.batch();
      for (const item of order.items || []) {
        const productRef = db.collection('products').doc(item.productId);
        const productSnap = await productRef.get();
        if (productSnap.exists) {
          const currentStock = productSnap.data().stock || 0;
          const newStock = Math.max(0, currentStock - item.qty);
          batch.update(productRef, {
            stock: newStock,
            sales: admin.firestore.FieldValue.increment(item.qty),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
      await batch.commit();

      // Send notification to the buyer
      await db.collection('notifications').add({
        userId: order.userId,
        title: '🎉 Order Confirmed!',
        message: `Your order #${orderId.slice(-6).toUpperCase()} has been placed. Total: $${order.total?.toFixed(2)}`,
        type: 'success',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Order ${orderId} processed: stock updated, notification sent.`);
    } catch (err) {
      console.error('onOrderCreated error:', err);
    }
  });

// ─── 2. On Order Status Updated: Notify User ─────────────────────────────────
exports.onOrderStatusUpdated = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { orderId } = context.params;

    if (before.status === after.status) return null;

    const statusMessages = {
      processing: '⚙️ Your order is being processed.',
      shipped: '🚚 Your order has been shipped!',
      delivered: '✅ Your order has been delivered. Enjoy!',
      cancelled: '❌ Your order has been cancelled.',
    };

    const message = statusMessages[after.status];
    if (!message) return null;

    try {
      await db.collection('notifications').add({
        userId: after.userId,
        title: `Order ${after.status.charAt(0).toUpperCase() + after.status.slice(1)}`,
        message: `Order #${orderId.slice(-6).toUpperCase()}: ${message}`,
        type: after.status === 'cancelled' ? 'error' : 'info',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Notification sent for order ${orderId} status: ${after.status}`);
    } catch (err) {
      console.error('onOrderStatusUpdated error:', err);
    }

    return null;
  });

// ─── 3. Validate Order Before Write (Prevent Overselling) ────────────────────
exports.validateOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.');
  }

  const { items } = data;

  // Check user is not blocked
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (userDoc.exists && userDoc.data().isBlocked) {
    throw new functions.https.HttpsError('permission-denied', 'Your account has been blocked.');
  }

  // Validate each item's stock
  const errors = [];
  for (const item of items) {
    const productDoc = await db.collection('products').doc(item.productId).get();
    if (!productDoc.exists) {
      errors.push(`Product ${item.name} no longer exists.`);
      continue;
    }
    const { stock, name } = productDoc.data();
    if (stock < item.qty) {
      errors.push(`Insufficient stock for "${name}". Available: ${stock}, Requested: ${item.qty}`);
    }
  }

  if (errors.length > 0) {
    throw new functions.https.HttpsError('failed-precondition', errors.join(' | '));
  }

  return { valid: true };
});

// ─── 4. Role Validation: Promote User (SuperAdmin Only) ──────────────────────
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated.');
  }

  // Verify caller is superadmin
  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'superadmin') {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can change roles.');
  }

  const { targetUid, role } = data;
  const validRoles = ['user', 'vendor', 'admin', 'superadmin'];

  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${role}`);
  }

  await db.collection('users').doc(targetUid).update({ role });
  return { success: true, message: `Role updated to ${role}` };
});

// ─── 5. Cleanup: Delete user data on account deletion ────────────────────────
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  try {
    const batch = db.batch();
    // Delete user profile
    batch.delete(db.collection('users').doc(uid));
    // Delete user cart
    batch.delete(db.collection('carts').doc(uid));
    await batch.commit();
    console.log(`Cleaned up data for deleted user: ${uid}`);
  } catch (err) {
    console.error('onUserDeleted error:', err);
  }
});
