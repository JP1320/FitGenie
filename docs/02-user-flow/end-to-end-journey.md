# End-to-End User Journey

## Overview

The FitGenie user journey is a 12-step flow from first launch to post-delivery feedback. Each step is mapped to the data it consumes and produces.

---

## Journey Map

### Step 1 – Onboarding

**Trigger:** User opens the app for the first time.

**Actions:**
- Sign up / log in via Google, Apple, Phone number, or Guest mode.
- Accept terms of service and privacy notice (explicit consent for body data storage).

**Data produced:**
- `user.id`, `user.email` or `user.phone`, `user.auth_provider`, `user.created_at`

**Exit condition:** Authenticated session established.

---

### Step 2 – User Intent

**Trigger:** Post-login, intent selection screen.

**Actions:**
- Select shopping intent:
  - For Myself
  - For Someone Else (Partner, Family Member, Friend, Child)
  - Gift / Occasion (Birthday, Wedding, Festival, Other)

**Data produced:**
- `user.intent.type`, `user.intent.occasion`, `user.intent.recipient`

**Exit condition:** Intent stored; user proceeds to profile input.

---

### Step 3 – Profile Input

**Trigger:** Intent selected.

**Actions:**
- Enter age, gender, and optionally select body type (illustrated guide provided).
- Input manual measurements (height, weight, chest, waist, hips) — optional if scan used.

**Data produced:**
- `user.profile.age`, `user.profile.gender`, `user.profile.body_type`
- `user.measurements.height`, `user.measurements.weight`, `user.measurements.chest`, `user.measurements.waist`, `user.measurements.hips`

**Exit condition:** Minimum required fields collected; user proceeds to scan or skips.

---

### Step 4 – AI Fit Scanner

**Trigger:** User opts into body scan.

**Actions:**
- Camera activates; user follows on-screen pose guide (front and side views).
- AI computer vision model processes frames.
- Extracted measurements surfaced for user review/correction.

**Data produced:**
- `scan.result.height`, `scan.result.measurements`, `scan.result.body_proportions`, `scan.result.recommended_size`, `scan.result.fit_type`
- `scan.confidence_score`

**Non-goal:** Scan does not store raw video or images beyond the session.

**Exit condition:** Scan complete or skipped; measurements confirmed.

---

### Step 5 – Smart Filters

**Trigger:** Measurements confirmed.

**Actions:**
- User selects guided preferences:
  - Style (Ethnic, Western, Indo-Western, Casual, Formal, Sportswear)
  - Budget range
  - Fabric (Cotton, Linen, Silk, Wool, Denim, Blends)
  - Fit details (sleeve type, length, slim/regular/oversized)

**Data produced:**
- `user.preferences.style`, `user.preferences.budget`, `user.preferences.fabric`, `user.preferences.fit_details`

**Exit condition:** Preferences saved; recommendation engine triggered.

---

### Step 6 – AI Recommendation

**Trigger:** Preferences submitted.

**Actions:**
- Backend sends profile + preferences to AI layer.
- AI returns ranked outfit recommendations with confidence scores and explanations.
- User browses recommended items.

**Data produced:**
- `recommendation.items[]` (outfit_id, confidence_score, size_label, explanation)

**Exit condition:** User selects an item or browses further.

---

### Step 7 – Service Selection

**Trigger:** User selects a recommended outfit.

**Actions:**
- User chooses fulfilment mode:
  - Custom Stitching
  - Designer Wear
  - Ready-made + Alteration
  - Personal Styling

**Data produced:**
- `order.service_type`

**Exit condition:** Service type confirmed; user proceeds to tailor/designer discovery.

---

### Step 8 – Expert Discovery

**Trigger:** Service type selected.

**Actions:**
- Marketplace shown with filtered tailor/designer listings.
- Filters: rating (3+, 4+, 4.5+), location (Near Me, Within City, Online), specialisation.
- User views profiles: portfolio, price range, delivery time, reviews.

**Data consumed:** `user.location`, `order.service_type`, `user.preferences`

**Exit condition:** User selects a tailor/designer and proceeds to booking.

---

### Step 9 – Booking

**Trigger:** User selects a provider.

**Actions:**
- Select delivery mode: Online, Offline, or Hybrid.
- Pick available appointment slot from tailor's calendar.
- Confirm booking.

**Data produced:**
- `booking.tailor_id`, `booking.slot`, `booking.mode`, `booking.status = "confirmed"`

**Exit condition:** Booking confirmed; Fit Card auto-generated.

---

### Step 10 – Fit Card Generation

**Trigger:** Booking confirmed.

**Actions:**
- AI assembles structured Fit Card from user measurements, preferences, outfit selection, and notes.
- Card shared with tailor/designer and saved to user dashboard.

**Data produced:**
- `fit_card.measurements`, `fit_card.body_type`, `fit_card.style_preferences`, `fit_card.outfit_reference`, `fit_card.tailor_notes`

**Exit condition:** Fit Card delivered to tailor; order enters tracking.

---

### Step 11 – Order Tracking

**Trigger:** Tailor accepts order.

**Actions:**
- User monitors order through stages:
  ```
  Confirmed → Accepted → In Progress → Stitching → Ready → Shipped / Pickup
  ```
- Push notifications at each status change.

**Data produced:**
- `order.status`, `order.updated_at`, `order.estimated_delivery`

**Exit condition:** Order marked "Delivered" or "Picked up".

---

### Step 12 – Feedback Loop

**Trigger:** Order delivered/collected.

**Actions:**
- User rates the experience:
  - Fit Accuracy (1–5 stars)
  - Service (1–5 stars)
  - Delivery / Timeliness (1–5 stars)
- Optional: upload outfit photo.
- Optional: written review.

**Data produced:**
- `feedback.fit_accuracy`, `feedback.service_rating`, `feedback.delivery_rating`, `feedback.photo_url`, `feedback.review_text`

**Exit condition:** Feedback submitted; data fed back into recommendation model training pipeline.

---

## Journey Data Flow Summary

```
User Auth → Intent → Profile → Scan → Preferences
    → Recommendation (AI) → Service Selection → Discovery
    → Booking → Fit Card (AI) → Tracking → Feedback
```
