# Partner API Spec (Tailors/Designers)

## Endpoints
- POST /partner/orders/accept
- POST /partner/orders/update-status
- GET /partner/orders/pending
- POST /partner/availability

## Security
- API key + signature header
- Tenant-scoped credentials
- Rate limits per partner

## SLAs
- Status update latency < 60s
- Availability sync every 5 min
