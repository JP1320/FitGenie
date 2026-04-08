# First Live Deploy Plan

## Phase 1: Backend Live
- [ ] Create Render account
- [ ] New Web Service -> connect GitHub repo JP1320/FitGenie
- [ ] Set Root Directory to backend (if monorepo)
- [ ] Build command: npm install && npm run build (or npm install)
- [ ] Start command: npm run start
- [ ] Add env variables
- [ ] Deploy and copy backend URL

## Phase 2: Frontend Live
- [ ] Create Vercel account
- [ ] Import GitHub repo JP1320/FitGenie
- [ ] Set Root Directory to frontend
- [ ] Framework preset: Vite/React
- [ ] Add env: VITE_API_BASE_URL=<backend_url>
- [ ] Deploy and copy frontend URL

## Phase 3: Verification
- [ ] Test backend /health and /ready
- [ ] Test frontend full flow
- [ ] Fix CORS if needed
