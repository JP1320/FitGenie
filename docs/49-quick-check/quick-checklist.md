# Quick Check Checklist

## Frontend
- [ ] All routes render without crash
- [ ] Profile -> Measurements -> Recommendations flow works
- [ ] Loading/empty/error/success states implemented on API pages
- [ ] Mobile nav and responsive layout verified (375/768/1440)

## Backend
- [ ] /health and /ready return 200
- [ ] /user/profile, /scan/body, /recommendations, /booking work end-to-end
- [ ] Error responses follow structured contract

## Data/Contracts
- [ ] Required schemas exist and are used in validation
- [ ] OpenAPI file present and aligned with endpoints

## Deployment
- [ ] Staging deploy succeeds
- [ ] Env vars are set correctly
- [ ] Logs/alerts visible
