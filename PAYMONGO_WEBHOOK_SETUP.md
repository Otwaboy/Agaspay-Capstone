# PayMongo Webhook Setup Guide

## Critical Issue: Webhook Not Configured

**Your billing isn't updating after payment because PayMongo is NOT sending webhooks to your backend.**

The payment intent is created (`pi_wrodtbddDtKrC1GNTkWcFEzo`), but when the user completes payment on PayMongo, PayMongo doesn't know where to send the confirmation. You need to configure this in your PayMongo dashboard.

---

## Step 1: Access PayMongo Dashboard

1. Go to https://dashboard.paymongo.com
2. Log in with your PayMongo account
3. Navigate to **Developers** → **Webhooks** (or **Settings** → **Webhooks**)

---

## Step 2: Add Webhook Endpoint

### For Local Development (Testing):
If you want to test webhooks locally, use **ngrok** to create a public URL:

```bash
# Install ngrok if you haven't
# https://ngrok.com/download

# Start ngrok (maps localhost:3000 to public URL)
ngrok http 3000

# You'll see something like:
# Forwarding https://abc123def456.ngrok.io -> http://localhost:3000
```

Then use: `https://abc123def456.ngrok.io/paymongo/webhook`

### For Production:
Use your actual backend URL: `https://your-production-domain.com/paymongo/webhook`

---

## Step 3: Configure Webhook in PayMongo Dashboard

1. Click **Add Webhook** or **Create Webhook**
2. Enter the webhook URL:
   ```
   https://your-domain.com/paymongo/webhook
   ```

3. Select events to receive:
   - ✅ `payment.paid` - When a payment is successful
   - ✅ `checkout_session.payment.paid` - When checkout session payment succeeds
   - (optional) `payment.failed` - When a payment fails
   - (optional) `charge.succeeded` - For card payments

4. Click **Create** or **Save**

5. You should receive a **Signing Key/Secret**. Copy this and add to your `.env`:
   ```
   PAYMONGO_WEBHOOK_SECRET=<your_webhook_signing_key>
   ```

---

## Step 4: Test Webhook Delivery

### Option A: Manual Test from PayMongo Dashboard
1. In Webhooks section, find your webhook
2. Click **Test Delivery** or **Send Test Event**
3. Select event type: `payment.paid`
4. Click **Send**

You should see in your backend logs:
```
🔔 ============================================
🔔 WEBHOOK REQUEST RECEIVED!
🔔 Timestamp: 2025-11-24T21:30:00.000Z
🔔 Request Body (raw): {...}
🔔 ============================================
📥 Webhook event type: payment.paid
```

### Option B: Make an Actual Payment
1. Complete a payment in your application
2. Go back to your application → payment success page
3. Watch your backend terminal
4. After ~10-20 seconds, you should see the webhook logs

If you DON'T see the logs, the webhook is not configured correctly.

---

## Step 5: Verify Webhook is Working

After webhook fires, check your database:

```javascript
// In MongoDB, check the Billing record
db.Billing.findOne({ _id: ObjectId("6924cb0e103a46a7dc7cc629") })

// Should now show:
{
  status: "partial",  // NOT "unpaid"
  amount_paid: 1,     // Updated
  current_payment_intent: null,  // Cleared
  pending_amount: null   // Cleared
}

// Check Payment record was created
db.payments.findOne({ payment_reference: "pi_wrodtbddDtKrC1GNTkWcFEzo" })

// Should show:
{
  payment_status: "confirmed",  // NOT "pending"
  amount_paid: 1,
  bill_id: ObjectId("6924cb0e103a46a7dc7cc629")
}
```

---

## Complete Webhook Flow Diagram

```
1. User clicks "Pay Now"
   ↓
2. Frontend calls POST /api/v1/payment
   ↓
3. Backend creates payment intent with PayMongo
   ↓
4. Backend saves: billing.current_payment_intent = "pi_..."
   ↓
5. User completes payment on PayMongo page
   ↓
6. PayMongo sends webhook to /paymongo/webhook ⭐ CRITICAL
   ↓
7. Backend webhook handler:
   - Finds billing by current_payment_intent
   - Creates Payment record with status="confirmed"
   - Updates billing: status="partial", amount_paid=1
   - Clears current_payment_intent
   ↓
8. Frontend polling /api/v1/payment/verify gets payment_recorded=true
   ↓
9. Frontend dispatches "paymentSuccess" event
   ↓
10. Bill card listener invalidates query cache
    ↓
11. Bill card refetches with NEW data (status="partial", amount=5)
    ↓
12. UI Updates ✅
```

---

## Troubleshooting

### ❌ Webhook Not Received
**Symptom:** Webhook logs don't appear in backend console

**Checks:**
1. Is webhook URL correct in PayMongo dashboard?
2. Is your backend running and accessible at that URL?
3. Did you configure HTTPS URL? (HTTP won't work in production)
4. Are you using ngrok? (Check if ngrok tunnel is still active)
5. Check PayMongo dashboard → Webhooks → Delivery History to see if PayMongo tried to send it

### ❌ Webhook Received But Billing Not Updated
**Symptom:** Webhook logs appear but billing still shows unpaid

**Checks:**
1. Check console logs for errors in webhook handler
2. Verify `current_payment_intent` in billing matches webhook payment_intent
3. Check if Payment record was created in database
4. Look for logs: "⚠️ No billing found for this payment"

### ❌ Billing Updates But UI Doesn't Change
**Symptom:** Database shows correct data but bill card still shows old amount

**Checks:**
1. Check frontend console for "🔔 [BillCard] Payment success event received"
2. If not present, check if "paymentSuccess" event was dispatched
3. Check if query cache was invalidated
4. Try hard-refresh browser (Ctrl+F5) to clear cache

---

## PayMongo Webhook Events

### `payment.paid`
Fired when a GCash/PayMaya/QRPH payment succeeds

**Payload Structure:**
```json
{
  "data": {
    "attributes": {
      "type": "payment.paid",
      "data": {
        "id": "pay_xxx",
        "attributes": {
          "status": "succeeded",
          "payment_intent": {
            "id": "pi_xxx"
          },
          "payment_method_used": "gcash"
        }
      }
    }
  }
}
```

### `checkout_session.payment.paid`
Fired when a checkout session payment succeeds

**Payload Structure:**
```json
{
  "data": {
    "attributes": {
      "type": "checkout_session.payment.paid",
      "data": {
        "id": "cs_xxx"
      }
    }
  }
}
```

---

## Implementation Checklist

- [ ] Log in to PayMongo Dashboard
- [ ] Navigate to Webhooks section
- [ ] Add webhook endpoint:
  - Local: `https://your-ngrok-url.ngrok.io/paymongo/webhook`
  - Production: `https://your-domain.com/paymongo/webhook`
- [ ] Select events: `payment.paid`, `checkout_session.payment.paid`
- [ ] Copy webhook signing key to `.env` as `PAYMONGO_WEBHOOK_SECRET`
- [ ] Test webhook delivery from dashboard
- [ ] Make a test payment and verify backend logs show webhook
- [ ] Check database shows updated billing status
- [ ] Verify frontend bill card updates with new data

---

## Current Backend Status

✅ **Webhook route exists:** `/paymongo/webhook`
✅ **Webhook handler implemented:** Processes `payment.paid` and `checkout_session.payment.paid`
✅ **Duplicate prevention in place:** Won't create multiple payments for same reference
✅ **Billing update logic ready:** Will set status to "partial"/"paid" and clear payment intent
✅ **Enhanced logging added:** Will show detailed logs when webhook is called

⏳ **Waiting for:** PayMongo to be configured to send webhooks to your endpoint

---

## Questions?

If the webhook is configured but still not working:

1. Share the webhook delivery history from PayMongo dashboard
2. Check backend logs for error messages starting with "❌"
3. Verify billing record has `current_payment_intent` set when payment intent is created
4. Check if PayMongo is sending the webhook to the correct URL
5. Verify your firewall/network allows incoming webhook requests

The webhook is the critical link in the payment flow - without it, billing updates won't happen!
