# PAYMENT FLOW TEST DOCUMENTATION

## Critical Bug Fixed

### The Root Cause
The bill card was not updating after payment because the backend's `balance` field calculation was not being recalculated after `amount_paid` was updated by the webhook.

**The specific issue:**
- Billing schema has a `balance` field with a default function: `total_amount - amount_paid`
- This function only runs when the document is first created
- When `amount_paid` is updated by the webhook, the `balance` field does NOT automatically recalculate
- Frontend receives old/stale `balance` value

### The Solution
**Backend Fix (billing.js line 115):**
```javascript
// BEFORE (WRONG):
balance: billing?.balance ?? billing?.total_amount ?? 0,

// AFTER (CORRECT):
balance: (billing?.total_amount ?? 0) - (billing?.amount_paid ?? 0),
```

Now the balance is **always calculated fresh** from current values when the API returns data.

---

## Complete Payment Flow

### Step 1: User Initiates Payment
- User clicks "Pay ₱X.XX Now" button in bill card
- `openPayBillModal` event is dispatched
- Modal opens showing:
  - Total amount due
  - Account details
  - Payment amount (can select full or partial)
  - Payment method (e.g., GCash)

### Step 2: Payment Processing
- User submits payment form
- Frontend creates payment intent via PayMongo API
- User is redirected to payment page to complete payment
- After user completes payment, redirected to `/payment-success?status=succeeded&payment_intent_id=XXX`

### Step 3: Payment Verification (Frontend)
**File: [payment-success.jsx](Frontend/src/components/payment-success.jsx)**

The component repeatedly checks if payment was recorded in database:
```javascript
// Try up to 15 times, every 3 seconds
GET /api/v1/payment/verify?payment_intent_id={paymentIntentId}
```

**Response when payment is recorded:**
```json
{
  "success": true,
  "payment_recorded": true,
  "status": "succeeded",
  "payment_details": {
    "_id": "payment_id",
    "amount_paid": 1.00,
    "payment_method": "gcash",
    "payment_status": "confirmed"
  }
}
```

**Debug Logs to Watch:**
```
✅ [PaymentSuccess] Payment recorded! Details: {...}
📢 [PaymentSuccess] Dispatching 'paymentSuccess' event
📢 [PaymentSuccess] Dispatching 'paymentCompleted' event
```

### Step 4: Webhook Processing (Backend)
**File: [webhook.js](Backend/routes/webhook.js)**

PayMongo sends payment notification to webhook endpoint:
```
POST /api/v1/webhook/paymongo
```

**Webhook Debug Logs:**
```
📥 Webhook received: payment.paid
💰 [Webhook] Processing payment - Total: 6, Pending: 1, Amount to pay: 1, Is Partial: true
✅ [Webhook] Payment processed and billing updated:
   - Status: unpaid → partial
   - Amount Paid: 0 → 1
   - Balance: 5
```

**What the webhook does:**
1. Checks if payment already exists (prevents duplicates)
2. Calculates if payment is partial or full
3. Creates Payment record with `payment_status: "confirmed"`
4. Updates Billing:
   - `status: "partial"` (NOT "partially_paid")
   - `amount_paid: 1` (adds to existing amount_paid)
   - `balance: calculated fresh` (total_amount - amount_paid)
   - Clears `current_payment_intent`, `pending_amount`

### Step 5: Cache Invalidation & UI Update (Frontend)
**File: [payment-success.jsx](Frontend/src/components/payment-success.jsx) + [resident-bill-payment-card.jsx](Frontend/src/components/dashboard/resident-bill-payment-card.jsx)**

When payment is recorded, payment-success.jsx dispatches events:
```javascript
window.dispatchEvent(new Event("paymentSuccess"));      // Bill card refresh
window.dispatchEvent(new Event("paymentCompleted"));    // Modal refresh
```

**Bill Card Listener (resident-bill-payment-card.jsx):**
```javascript
useEffect(() => {
  const handlePaymentSuccess = () => {
    console.log("🔔 [BillCard] Payment success event received");
    queryClient.invalidateQueries({
      queryKey: ["resident-current-bill", connectionId]
    });
    console.log("🔔 [BillCard] Query invalidated, will refetch");
  };

  window.addEventListener("paymentSuccess", handlePaymentSuccess);
  // ...
}, [connectionId, queryClient]);
```

**Query Fetch (resident-bill-payment-card.jsx):**
```javascript
const { data: billingData } = useQuery({
  queryKey: ["resident-current-bill", connectionId],
  queryFn: async () => {
    console.log("📡 [BillCard] Fetching bill data for connectionId:", connectionId);
    const res = await apiClient.getCurrentBill(connectionId);
    console.log("📡 [BillCard] Raw response from API:", res.data);

    // Transform and return
    const transformedData = {
      amount: currentBill.balance || currentBill.total_amount,  // CRITICAL: Uses balance
      status: currentBill.payment_status || currentBill.status,  // Should be "partial"
      amountPaid: currentBill.amount_paid,                      // Should be 1
      // ... other fields
    };
    console.log("✅ [BillCard] Transformed billing data:", transformedData);
    return transformedData;
  }
});
```

**Render (resident-bill-payment-card.jsx):**
```javascript
console.log("🎨 [BillCard] Rendering with billingData:", {
  status: billingData.status,        // Should be "partial"
  amount: billingData.amount,        // Should be 5 (was 6, minus 1 paid)
  amountPaid: billingData.amountPaid // Should be 1
});

const isPartial = billingData.status === "partial";  // TRUE!
```

**UI Changes:**
- Badge changes to "Partial" (orange)
- Amount displayed changes from "₱6.00" to "₱5.00"
- Additional section shows:
  - Original Total: ₱6.00
  - Amount Paid: -₱1.00

---

## Testing Checklist

### ✅ Setup
- [ ] Backend is running (listens on port 3000 or configured port)
- [ ] Frontend is running (listens on port 5173 or configured port)
- [ ] You're logged in as a resident
- [ ] You have a billing account with an unpaid bill (e.g., ₱6.00)

### ✅ Test Partial Payment (₱1 from ₱6)
1. [ ] Open bill card showing "Amount Due: ₱6.00" with "Pending" badge
2. [ ] Click "Pay ₱6.00 Now"
3. [ ] Modal opens
4. [ ] Select payment amount: ₱1.00 (partial)
5. [ ] Select payment method: GCash
6. [ ] Click proceed to payment
7. [ ] Complete PayMongo payment
8. [ ] Redirected to payment-success page
9. [ ] Payment status shows "Verifying Payment" then "Payment Successful"
10. [ ] **CRITICAL CHECK**: Open browser DevTools Console
    - [ ] See: `✅ [PaymentSuccess] Payment recorded! Details: {...}`
    - [ ] See: `📢 [PaymentSuccess] Dispatching 'paymentSuccess' event`
    - [ ] See: `🔔 [BillCard] Payment success event received`
    - [ ] See: `🔔 [BillCard] Query invalidated, will refetch`
    - [ ] See: `📡 [BillCard] Fetching bill data for connectionId: ...`
    - [ ] See: `📡 [BillCard] Raw response from API: [...]`
    - [ ] See: `✅ [BillCard] Transformed billing data: {...status: "partial", amount: 5, amountPaid: 1}`
    - [ ] See: `🎨 [BillCard] Rendering with billingData: {status: "partial", amount: 5, amountPaid: 1}`
11. [ ] Click "Return to Dashboard"
12. [ ] **CRITICAL ASSERTION**: Bill card shows:
    - [ ] Badge: "Partial" (orange)
    - [ ] Amount Due: ₱5.00 (was ₱6.00)
    - [ ] Status text shows "Remaining Balance"
    - [ ] Shows breakdown:
      - Original Total: ₱6.00
      - Amount Paid: -₱1.00
13. [ ] Payment history page shows the ₱1.00 payment

### ✅ Test Full Payment
1. [ ] Bill card shows "Remaining Balance: ₱5.00" with "Partial" badge
2. [ ] Click "Pay ₱5.00 Now"
3. [ ] Modal opens showing ₱5.00
4. [ ] Select full payment
5. [ ] Complete payment
6. [ ] After verification, bill card shows:
    - [ ] Badge: "Paid" (green)
    - [ ] Button shows: "Payment Confirmed" (disabled)
    - [ ] Amount Due section shows: "₱0.00"

### ✅ Backend Verification (Check Logs)
1. [ ] First payment (₱1):
   - [ ] Backend logs show: `💰 [Webhook] Processing payment - Total: 6, Pending: 1, Amount to pay: 1, Is Partial: true`
   - [ ] Webhook logs show: `Status: unpaid → partial`, `Amount Paid: 0 → 1`, `Balance: 5`
   - [ ] No duplicate payment created (check if second webhook fires)

2. [ ] Second payment (₱5):
   - [ ] Backend logs show: `💰 [Webhook] Processing payment - Total: 6, Pending: 0, Amount to pay: 5, Is Partial: false`
   - [ ] Webhook logs show: `Status: partial → paid`, `Amount Paid: 1 → 6`, `Balance: 0`

### ✅ No Duplicate Payments
- [ ] Database shows exactly 2 payment records (one for ₱1, one for ₱5)
- [ ] Each has unique `payment_reference` (payment_intent_id)
- [ ] Both have `payment_status: "confirmed"`

---

## Expected Behavior Summary

| Step | Expected Result |
|------|---|
| Initial Bill | ₱6.00 Due, "Pending" badge |
| After ₱1 Payment | ₱5.00 Remaining, "Partial" badge |
| After ₱5 Payment | ₱0.00 Due, "Paid" badge, Button Disabled |
| Payment Method | GCash (or whatever selected) |
| Status | "partial" then "paid" (enum values) |
| No Duplicates | Exactly 2 payment records |
| Cache Refresh | Bill card updates within 1-2 seconds |

---

## If Something Doesn't Work

### Bill Card Not Updating After Payment
**Check:**
1. Browser console for errors
2. Backend logs for webhook errors
3. Confirm `paymentSuccess` event was dispatched
4. Confirm event listener is attached (check for `🔔 [BillCard]` logs)
5. Confirm new query fetch logs appear
6. Confirm `amount_paid` is actually updated in database

### Wrong Status/Balance After Payment
**Check:**
1. Is `billing.status` actually set to `"partial"`? (Not `"partially_paid"`)
2. Is `billing.amount_paid` actually incremented?
3. Confirm database shows correct values (use MongoDB Compass or CLI)
4. Confirm API returns correct balance: `total_amount - amount_paid`

### Duplicate Payments
**Check:**
1. Webhook is receiving duplicate events from PayMongo
2. Database has duplicate payment records with same `payment_reference`
3. Look for logs: `⚠️ Payment already processed for this reference`

---

## Files Modified

### Backend
- `Backend/controller/billing.js` - Fixed balance calculation
- `Backend/routes/webhook.js` - Added comprehensive debugging
- `Backend/model/Billing.js` - No changes (schema was already correct)

### Frontend
- `Frontend/src/components/dashboard/resident-bill-payment-card.jsx` - Added cache invalidation listener + debugging
- `Frontend/src/components/payment-success.jsx` - Added event dispatch + debugging

---

## Key Insights

1. **Balance must be calculated fresh** from `total_amount - amount_paid` every time (not stored)
2. **Status enum must be exact**: `"partial"` not `"partially_paid"`
3. **Events must connect components**: payment-success → bill card query invalidation
4. **Cache invalidation must trigger refetch**: React Query automatically refetches when query is invalidated
5. **Webhook must prevent duplicates**: Check existing payment before creating new one
