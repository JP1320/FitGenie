# ✨ AI Fit – Smart Fashion Recommendation & Tailoring Platform

> *Find your perfect fit in seconds.*  
An intelligent fashion platform that combines **AI body analysis, personalized recommendations, and marketplace integration**.

## ✅ Live MVP Status (as of 2026-04-09)

**Frontend (Vercel):** https://fit-genie-two.vercel.app/  
**Backend (Render):** https://fitgenie-26il.onrender.com/health  
**Stable Release Tag:** `v1.0-live-mvp`

### Implemented & Verified APIs
- `GET /health`
- `POST /user/profile`
- `POST /scan/body`
- `POST /recommendations`
- `GET /tailors`
- `POST /booking`

### Quick Test (Live)
1. Open frontend URL.
2. Use buttons in sequence:
   - Health
   - Save Profile
   - Scan Body
   - Get Recommendations
   - Get Tailors
   - Create Booking
3. Verify JSON response after each action.
4. Booking should return HTTP `201`.

### Environment Variables

#### Vercel (Frontend)
- `VITE_API_BASE_URL=https://fitgenie-26il.onrender.com`

#### Render (Backend)
- `CORS_ORIGIN=https://fit-genie-two.vercel.app`

---

## 🚀 Overview

**AI Fit** is a next-generation fashion assistant that eliminates the frustration of incorrect sizing and poor fit.  
From **AI-powered body scanning** to **tailor/designer matching**, the platform provides a complete, guided shopping and stitching experience.

### 🎯 What This Project Solves
- Wrong size issues in online shopping  
- Lack of personalization  
- Disconnect between users and tailors/designers  

---

## 🧠 Core Features (Vision)

### 🔷 Smart Onboarding & User Intent
- Login options: Google / Apple / Phone / Guest Mode  
- Shopping intent:
  - For Myself  
  - For Someone Else (Partner, Family, Friend, Child)  
  - Gift / Occasion (Birthday, Wedding, Festival)  

### 🔷 Intelligent Profile Builder
- Age & gender segmentation  
- Optional body type selection:
  - Rectangle  
  - Triangle / Pear  
  - Inverted Triangle  
  - Oval / Round  
  - Hourglass  
- Manual size + height input  

### 📸 AI Fit Scanner (USP)
- Camera-based body scan  
- Auto-detect:
  - Height  
  - Body proportions  
  - Recommended size  
  - Fit type (Slim / Regular / Relaxed)  

### 🎯 Guided Smart Filters
- Style, budget, fabric, fit-detail based recommendations

### 🤖 AI Recommendation Engine
- Personalized outfit suggestions  
- Fit recommendations  
- Size confidence score  
- “Why this suits you” explanation  

### 🧵 Marketplace Integration
- Custom stitching
- Designer wear
- Ready-made + alteration
- Personal styling

### 📅 Booking & Interaction
- Online / Offline / Hybrid delivery
- Scheduling + communication flow

### 🪪 AI Fit Card
- Measurements, preferences, notes
- Shareable with tailor/designer and user dashboard

---

## 🏗️ Current Tech Stack (Implemented)

**Frontend**
- React + Vite
- Hosted on Vercel

**Backend**
- Node.js + Express
- Hosted on Render

**Other**
- CORS configured for production frontend origin

---

## ⚠️ Current MVP Limitations
- Some endpoint responses are mock/static
- No persistent database yet
- No auth yet (JWT/OAuth pending)
- Recommendation engine is baseline/demo logic

---

## 📌 Roadmap
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Input validation middleware
- [ ] Auth + user sessions
- [ ] Real recommendation model
- [ ] Tailor marketplace expansion
- [ ] Payments & order lifecycle
- [ ] Mobile app

---

## 👨‍💻 Author
**Janvi Patel**

## 📄 License
MIT
