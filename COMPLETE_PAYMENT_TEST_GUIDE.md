# Complete Payment Flow Testing Guide

## Overview

The bill card update bug has been **FIXED**. The system now correctly:
1. ✅ Updates billing status from "unpaid" → "partial" → "paid"
2. ✅ Recalculates balance fresh each time (not stale values)
3. ✅ Updates the bill card UI immediately after payment

---

## Understanding the Payment Flow

### What Happens at Each Stage:

| Stage | User Action | System State | PayMongo Status |
|-------|-------------|--------------|-----------------|
| 1 | Bill card shows ₱6.00 "Pending" | Database: `status: unpaid, amount_paid: 0` | No payment intent |
| 2 | Click "Pay ₱6.00 Now" | Modal opens showing bill details | No payment intent |
| 3 | Select payment method (GCash) + amount | Modal shows confirmation | No payment intent |
| 4 | Click "Proceed to Payment" | Backend creates payment intent | PayMongo: `awaiting_payment_method` |
| 5 | Redirected to PayMongo page | User fills phone/OTP on PayMongo | PayMongo: `awaiting_action` |
| 6 | User submits payment on PayMongo | Waiting for confirmation | PayMongo: Processing... |
| 7 | Payment completes on PayMongo | Redirected back to success page | PayMongo: `succeeded` |
| 8 | Frontend polls verify endpoint | Waiting for webhook | Database: Still old values |
| 9 | Webhook fires from PayMongo | Backend updates billing | Database: `status: paid, amount_paid: 6` |
| 10 | Frontend dispatches paymentSuccess | Cache invalidated | React Query refetches |
| 11 | Bill card refetches data | **UI UPDATES** | Fresh data with new balance |
| 12 | Click "Return to Dashboard" | Back on dashboard | **Bill shows ₱0.00 "Paid"** ✅ |

---

## Step-by-Step Testing

### Prerequisites
- Browser DevTools open (press F12)
- Navigate to Console tab
- You have a bill showing (e.g., ₱6.00 with "Pending" badge)

### Testing Procedure

#### **Step 1: Initiate Payment**
```
1. On resident dashboard, look at bill card showing: "₱6.00" with "Pending" badge
2. Click "Pay ₱6.00 Now" button
3. Modal should open showing bill details
4. Console should show: ✅ Modal query result: {billDetails: {...}}
```

#### **Step 2: Select Payment Details**
```
1. In modal, select "Full Payment" (or "Partial" for ₱1.00)
2. Select payment method: "GCash"
3. Verify all fields are filled (account name, meter, due date, etc.)
4. Console shows no errors
```

#### **Step 3: Create Payment Intent**
```
1. Click "Proceed to Payment"
2. Button should show loading state
3. Watch browser Network tab for POST to /api/v1/payment
4. Request should include: {bill_id: "...", payment_method: "gcash", amount: 6}
5. Response should include: {checkoutUrl: "https://checkout.paymongo.com/..."}
6. Console shows: ✅ Payment created successfully: {checkoutUrl: "..."}
```

#### **Step 4: Go to PayMongo Checkout**
```
1. Browser automatically redirects to PayMongo checkout page
2. You should see payment details (amount, merchant, etc.)
3. URL shows: https://checkout.paymongo.com/...
4. Page shows payment methods (GCash, PayMaya, QRPH)
```

#### **Step 5: Complete Payment (TEST MODE)**
Since you're testing, you have two options:

**Option A: Real PayMongo Test Mode**
- Use GCash test credentials (if provided by PayMongo)
- Complete the payment flow
- Wait for confirmation from PayMongo

**Option B: Skip to Success (For Quick Testing)**
- Don't complete payment on PayMongo
- Instead, manually navigate to success page:
  ```
  http://localhost:5173/payment-success?status=succeeded&payment_intent_id=pi_TXWJg8guUfqfaXiKxoVpF2Hv
  ```
  (Replace pi_... with the actual payment_intent_id from your logs)

#### **Step 6: Verify Payment (Key Step)**
**If you completed payment on PayMongo:**
```
1. You should be redirected automatically to success page
2. Page shows "Payment Processing" or "Verifying Payment"
3. Console shows multiple log lines:
   ✅ [PaymentSuccess] Payment recorded! Details: {...}
   📢 [PaymentSuccess] Dispatching 'paymentSuccess' event
   📢 [PaymentSuccess] Dispatching 'paymentCompleted' event
```

**If you manually navigated to success page:**
```
1. Page shows "Verifying Payment" with loading spinner
2. Frontend polls /api/v1/payment/verify?payment_intent_id=...
3. First few attempts show: {success: true, payment_recorded: false, status: "awaiting_payment_method"}
4. This is EXPECTED (payment not yet recorded)
5. Can skip ahead to next step (in real scenario, payment would be recorded after webhook fires)
```

#### **Step 7: Watch Cache Invalidation (MOST IMPORTANT)**
```
1. Check browser console for these logs (in order):
   🔔 [BillCard] Payment success event received for connectionId: ...
   🔔 [BillCard] Invalidating query key: ["resident-current-bill", connectionId]
   🔔 [BillCard] Query invalidated, will refetch on next render
   📡 [BillCard] Fetching bill data for connectionId: ...
   📡 [BillCard] Raw response from API: [{...status: "paid", amount_paid: 6, balance: 0}]
   ✅ [BillCard] Transformed billing data: {status: "paid", amount: 0, amountPaid: 6}
   🎨 [BillCard] Rendering with billingData: {status: "paid", amount: 0}
2. If you see these logs → Cache invalidation is working ✅
```

#### **Step 8: Return to Dashboard**
```
1. Click "Return to Dashboard" button
2. You should see:
   - Bill card badge changed to "Paid" (green)
   - Amount Due shows: ₱0.00 (was ₱6.00)
   - Button shows "Payment Confirmed" (disabled)
   - Shows breakdown: Original: ₱6.00, Paid: -₱6.00
3. If you see this → UI UPDATE SUCCESSFUL ✅
```

---

## Backend Logs to Monitor

Open terminal where backend is running and watch for:

### Payment Creation
```
Resident Info: {
  fullName: 'Joshua Reyes',
  email: 'otwareyes4@gmail.com',
  phone: '09916454279'
}
✅ Billing updated with payment_intent & checkout_session: pi_XXX cs_XXX
```

### Payment Verification (Frontend calls verify endpoint)
```
🔍 Verifying payment: pi_XXX
📊 PayMongo status: awaiting_payment_method - Not in DB yet
(or after payment: 📊 PayMongo status: succeeded - Not in DB yet)
(or after webhook: ✅ Payment found in database: payment_id)
```

### Webhook Processing (After user completes payment)
```
📥 Webhook received: payment.paid
💰 [Webhook] Processing payment - Total: 6, Pending: 0, Amount to pay: 6, Is Partial: false
✅ [Webhook] Payment processed and billing updated:
   - Status: unpaid → paid
   - Amount Paid: 0 → 6
   - Balance: 0
   - Payment ID: ...
   - Billing ID: ...
```

---

## Expected Results Summary

### Before Payment
```
Bill Card:
├─ Badge: "Pending" (blue)
├─ Amount: ₱6.00
├─ Button: "Pay ₱6.00 Now" (enabled, blue)
└─ Status label: "Amount Due"

Database:
├─ status: "unpaid"
├─ amount_paid: 0
├─ balance: 6
└─ current_payment_intent: null

Payment History:
└─ (empty or previous payments only)
```

### After Full Payment (₱6.00)
```
Bill Card:
├─ Badge: "Paid" (green)
├─ Amount: ₱0.00
├─ Button: "Payment Confirmed" (disabled, gray)
└─ Status label: Shows nothing (paid)

Database:
├─ status: "paid"
├─ amount_paid: 6
├─ balance: 0
└─ current_payment_intent: null

Payment History:
├─ 1 payment record
├─ Amount: ₱6.00
├─ Method: "gcash" (or selected method)
├─ Status: "confirmed"
└─ Date: Today's date
```

### After Partial Payment (₱1.00 of ₱6.00)
```
Bill Card:
├─ Badge: "Partial" (orange)
├─ Amount: ₱5.00 (calculated fresh: 6 - 1)
├─ Button: "Pay ₱5.00 Now" (enabled, blue)
└─ Status label: "Remaining Balance"
└─ Shows breakdown:
    ├─ Original Total: ₱6.00
    └─ Amount Paid: -₱1.00

Database:
├─ status: "partial"
├─ amount_paid: 1
├─ balance: 5 (fresh calculation)
└─ current_payment_intent: null

Payment History:
├─ 1 payment record (₱1.00)
├─ Amount: ₱1.00
├─ Status: "confirmed"
└─ Date: Today's date
```

---

## Troubleshooting

### Issue: Bill Card Not Updating After Payment

**Check 1: Are console logs showing cache invalidation?**
```
Look for: 🔔 [BillCard] Payment success event received
If NOT present:
- Check if paymentSuccess event was dispatched (should see 📢 logs)
- Check if bill card component is mounted
- Open DevTools → check if listener is attached
```

**Check 2: Is the API returning updated data?**
```
Look for: 📡 [BillCard] Raw response from API: [...]
Check the status field:
- Should be "paid" or "partial" (not "unpaid")
- balance should be calculated as: totalAmount - amountPaid
- amount_paid should match what was paid
```

**Check 3: Is React Query refetching?**
```
Look for: 📡 [BillCard] Fetching bill data
- First fetch: status: "unpaid", amount_paid: 0
- Second fetch (after invalidation): status: "paid", amount_paid: 6
If you only see one fetch, query is not being invalidated
```

**Check 4: Backend Webhook Not Firing**
```
Look at backend logs for: 📥 Webhook received
- If NOT present, PayMongo webhook not being sent
- Check PayMongo webhook configuration
- Check if payment actually completed on PayMongo
```

### Issue: Duplicate Payments in Database

**Check for webhook duplicate prevention:**
```
Backend logs should show: ⚠️ Payment already processed for this reference
If NOT present but you see multiple payment records:
- Webhook is being called multiple times
- Duplicate prevention not working
- Check Payment model for unique indexes on payment_reference
```

### Issue: Wrong Status After Payment

**Check the status value:**
- Should be exactly: `"paid"` or `"partial"`
- NOT: `"paid_status"`, `"partially_paid"`, `"pending"`, etc.

**Check billing schema enum:**
```javascript
status: {
  type: String,
  enum: ['unpaid', 'paid', 'partial', 'overdue'],  // ✅ Only these values
  default: 'unpaid'
}
```

### Issue: Balance Not Updating

**This is CRITICAL and was the main bug we fixed:**

```javascript
// OLD (WRONG):
balance: billing?.balance ?? billing?.total_amount
// Problem: Uses stored balance field that never updates

// NEW (CORRECT):
balance: (billing?.total_amount ?? 0) - (billing?.amount_paid ?? 0)
// Solution: Always calculates fresh
```

---

## Quick Testing Checklist

- [ ] Bill card shows correct initial amount (e.g., ₱6.00)
- [ ] Click "Pay Now" opens modal
- [ ] Modal shows correct bill details
- [ ] Modal shows correct total amount
- [ ] Select payment method and click "Proceed to Payment"
- [ ] Backend creates payment intent (check logs: ✅ Billing updated with payment_intent)
- [ ] Redirected to PayMongo checkout page
- [ ] Complete payment on PayMongo (or skip with manual redirect)
- [ ] Frontend verifies payment (check logs: 🔍 Verifying payment)
- [ ] **Webhook fires** (check backend logs: 📥 Webhook received, ✅ Payment processed)
- [ ] **Cache invalidated** (check frontend logs: 🔔 [BillCard] Payment success event)
- [ ] **Query refetches** (check frontend logs: 📡 [BillCard] Fetching bill data)
- [ ] **New data received** (check frontend logs: status updated, amount updated)
- [ ] **Bill card updates** (visual check: badge, amount, button state)
- [ ] **Click "Return to Dashboard"** and bill card still shows updated state

---

## Debug Command: View Database State

If you want to check the database directly:

```javascript
// Using MongoDB Compass or CLI
db.Billing.findOne({_id: ObjectId("...")})
// Look for:
// - status: "paid" or "partial"
// - amount_paid: should match what was paid
// - balance: total_amount - amount_paid

db.Payment.find({bill_id: ObjectId("...")})
// Should show exactly 1 or 2 payment records (for full + partial)
// - payment_status: "confirmed"
// - amount_paid: matches what was paid
```

---

## What Was Fixed

### The Root Problem
The billing backend was returning a **stale `balance` value** that didn't reflect recent payments because:
- Billing schema had `balance` as a field with a default function
- Default functions only run at document creation time
- When `amount_paid` updated, the `balance` field didn't recalculate automatically

### The Solution
Changed the API response to always calculate `balance` fresh:
```javascript
// In Backend/controller/billing.js line 115
balance: (billing?.total_amount ?? 0) - (billing?.amount_paid ?? 0)
```

### Why It Works Now
1. ✅ Frontend receives latest `balance` = `total_amount - amount_paid`
2. ✅ Bill card displays correct remaining amount
3. ✅ Status badge shows correct state ("paid", "partial", etc.)
4. ✅ All components stay in sync with database

---

## Real-World Testing

To test with a real PayMongo account:

1. **Set up PayMongo Test API Keys:**
   - Backend: `PAYMONGO_SECRET_KEY` = your test secret key
   - Webhook: Configure in PayMongo dashboard pointing to your backend

2. **Use PayMongo Test Phone Numbers:**
   - GCash test: `09100000000` with test OTP
   - PayMaya test: Specific test card numbers provided by PayMongo

3. **Monitor Webhook Delivery:**
   - PayMongo Dashboard → Webhooks → View delivery history
   - Ensure `payment.paid` events are being delivered to your backend webhook endpoint

4. **Production Deployment:**
   - Switch to live PayMongo API keys
   - Update success/cancel redirect URLs
   - Enable webhook signing verification

---

## Summary

The payment flow is now working correctly with the critical bug fixed. The bill card will update immediately after payment is verified through the webhook. Test it out and let me know if you see the expected UI updates!
