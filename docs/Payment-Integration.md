# Payment Integration

Vigil supports two payment providers to serve both global and Philippine markets:

- **Stripe**: Credit/debit cards globally
- **PayMongo**: GCash, Maya, and GrabPay (Philippines)

## Architecture

Both providers use webhook-based asynchronous confirmation:

```
User selects plan
    │
    ▼
┌─────────────────┐     ┌─────────────────┐
│   Stripe        │     │   PayMongo      │
│  (Cards)        │     │  (E-wallets)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
    Checkout Session         Source Created
         │                       │
         ▼                       ▼
    Redirect to Stripe      Redirect to GCash/
    Hosted Page             Maya App
         │                       │
         ▼                       ▼
    Payment Complete        Payment Authorized
         │                       │
         ▼                       ▼
    Webhook:               Webhook:
    checkout.session.      source.chargeable/
    completed              payment.paid
         │                       │
         └───────────┬───────────┘
                     ▼
            ┌─────────────────┐
            │   Vigil Backend │
            │  sync_org_from  │
            │    _webhook()   │
            └────────┬────────┘
                     ▼
            Organization activated
            Subscription status: active
```

## Stripe Setup

### 1. Create Stripe Account
Sign up at [stripe.com](https://stripe.com). Use test mode for development.

### 2. Create Products and Prices

In Stripe Dashboard:
- Products → Create Product → "Starter Plan"
- Add price: $25/month (recurring)
- Repeat for Professional ($55/month) and Enterprise ($150/month)

### 3. Configure Webhook Endpoint

In Stripe Dashboard:
- Developers → Webhooks → Add endpoint
- Endpoint URL: `https://your-domain.com/api/v1/billing/webhook`
- Events to listen to:
  - `checkout.session.completed`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`

### 4. Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Test Checkout

```bash
curl -X POST http://localhost:8000/api/v1/billing/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "starter",
    "success_url": "http://localhost:5173/app/settings?upgraded=1",
    "cancel_url": "http://localhost:5173/app/settings?canceled=1"
  }'
```

## PayMongo Setup

### 1. Create PayMongo Account
Sign up at [paymongo.com](https://paymongo.com). Use test mode for development.

### 2. Configure Webhook Endpoint

In PayMongo Dashboard:
- Webhooks → Add endpoint
- URL: `https://your-domain.com/api/v1/billing/webhook/paymongo`
- Events:
  - `source.chargeable`
  - `payment.paid`
  - `payment.failed`

### 3. Environment Variables

```env
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
PAYMONGO_PUBLIC_KEY=pk_test_...
```

### 4. Test GCash Checkout

```bash
curl -X POST http://localhost:8000/api/v1/billing/checkout/paymongo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "starter",
    "type": "gcash",
    "success_url": "http://localhost:5173/app/settings?upgraded=1",
    "failed_url": "http://localhost:5173/app/settings?canceled=1"
  }'
```

### GCash Test Flow

In PayMongo test mode:
1. User is redirected to GCash simulator
2. Enter test phone: `09171234567`
3. Enter OTP: `123456`
4. Payment is authorized
5. Webhook fires `source.chargeable` event

## Webhook Security

### Stripe Signature Verification

```python
stripe.Webhook.construct_event(
    payload=request.body,
    signature=stripe_signature,
    secret=settings.STRIPE_WEBHOOK_SECRET
)
```

### PayMongo Signature Verification

PayMongo uses HMAC-SHA256:

```python
hmac.new(
    webhook_secret.encode(),
    f"{timestamp}.{payload.decode()}".encode(),
    hashlib.sha256
).hexdigest()
```

**Important**: Use `hmac.compare_digest()` to prevent timing attacks.

## Subscription States

| State | Trigger | Action |
|-------|---------|--------|
| `trial` | Organization created | No payment required |
| `active` | Webhook: checkout completed / source chargeable | Full access granted |
| `past_due` | Webhook: invoice failed / payment failed | Grace period (configurable) |
| `canceled` | User cancellation / subscription deleted | Access revoked at period end |

## Multi-Provider Subscriptions

Vigil supports switching providers:

1. User has active Stripe subscription
2. User cancels Stripe subscription (status → `canceled` at period end)
3. User creates new PayMongo subscription
4. Org record updated with new `payment_provider` and provider-specific IDs

The `sync_org_from_webhook()` function handles state transitions atomically.

## Testing Webhooks Locally

### Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/v1/billing/webhook
```

### PayMongo

PayMongo doesn't have an official CLI. Use ngrok:

```bash
# Install ngrok
brew install ngrok

# Start tunnel
ngrok http 8000

# Set webhook endpoint in PayMongo Dashboard to:
# https://your-ngrok-url.ngrok.io/api/v1/billing/webhook/paymongo
```

## Currency Handling

| Provider | Currency | Amount Unit | Example |
|----------|----------|-------------|---------|
| Stripe | USD | Cents | `2500` = $25.00 |
| PayMongo | PHP | Cents | `140000` = ₱1,400.00 |

All amounts are stored as integers (cents) to avoid floating-point precision issues.

## Refunds and Disputes

Currently handled through provider dashboards:
- **Stripe**: Dashboard → Payments → Refund
- **PayMongo**: Dashboard → Payments → Refund

Future versions will support API-initiated refunds.
