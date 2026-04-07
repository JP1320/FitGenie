# Screen Flow

## Overview

This document defines the screen-level navigation flow for the FitGenie application. Each screen is named, its entry/exit conditions noted, and primary actions listed. This serves as the wireframe contract for the frontend team.

---

## Screen Inventory

### S01 – Splash / Launch Screen
- **Entry:** App launch
- **Actions:** Auto-redirect after 2 s
- **Exit:** → S02

---

### S02 – Authentication Screen
- **Entry:** First launch or logged-out state
- **Sections:**
  - Sign In / Sign Up toggle
  - Google SSO button
  - Apple SSO button
  - Phone number + OTP flow
  - Guest mode (limited functionality)
- **Exit:** → S03 (new user) or → S05 (returning user with profile)

---

### S03 – Intent Selection Screen
- **Entry:** New authenticated user
- **Sections:**
  - "Who are you shopping for?" prompt
  - Card tiles: For Myself | For Someone Else | Gift / Occasion
  - Sub-options appear conditionally (e.g., occasion type picker)
- **Exit:** → S04

---

### S04 – Profile Input Screen
- **Entry:** Intent confirmed
- **Sections:**
  - Personal details: age, gender
  - Body type selector (illustrated cards)
  - Manual measurement inputs: height, weight, chest, waist, hips
  - "Scan Instead" CTA → S05
  - "Skip for now" link (returns partial profile)
- **Exit:** → S05 (scan) or → S06 (preferences)

---

### S05 – AI Fit Scanner Screen
- **Entry:** User taps "Scan Instead" or is guided from S04
- **Sections:**
  - Camera permission prompt
  - Pose guide overlay (front view, side view)
  - Progress indicator during scan
  - Review screen: extracted measurements displayed, editable
  - Confidence indicator
- **Exit:** → S06

---

### S06 – Smart Filters Screen
- **Entry:** Measurements confirmed (scan or manual)
- **Sections:**
  - Style picker (illustrated cards: Ethnic, Western, etc.)
  - Budget range slider / quick-select tiles
  - Fabric multi-select chips
  - Fit details (sleeve type, length, slim/regular/oversized)
- **Exit:** → S07

---

### S07 – AI Recommendation Screen
- **Entry:** Preferences submitted (triggers API call)
- **Sections:**
  - Loading state ("Finding your perfect fit…")
  - Recommendation cards grid/list:
    - Outfit image
    - Size label + Confidence Score badge
    - Brief explanation snippet
    - "Why this suits you" expandable panel
  - Filter/sort controls (refine without re-scanning)
- **Exit:** → S08 (item selected)

---

### S08 – Outfit Detail Screen
- **Entry:** User taps a recommendation card
- **Sections:**
  - Outfit image gallery
  - Full "Why this suits you" explanation
  - Size recommendation with confidence breakdown
  - Style/fabric/fit tags
  - Service Selection CTA
- **Exit:** → S09 (service selected)

---

### S09 – Service Selection Screen
- **Entry:** User ready to fulfil outfit
- **Sections:**
  - Option cards: Custom Stitching | Designer Wear | Ready-made + Alteration | Personal Styling
  - Brief description of each option
- **Exit:** → S10

---

### S10 – Expert Discovery Screen (Marketplace)
- **Entry:** Service type selected
- **Sections:**
  - Search bar
  - Filter bar: rating, location, specialisation
  - Listing cards:
    - Profile photo, name, rating
    - Specialisation tags
    - Price range indicator
    - Estimated delivery time
    - "View Profile" button
  - Map view toggle (Phase 2)
- **Exit:** → S11 (provider selected)

---

### S11 – Provider Profile Screen
- **Entry:** User taps "View Profile"
- **Sections:**
  - Cover photo + avatar
  - Name, rating, review count
  - Bio and specialisation
  - Portfolio image gallery
  - Price range
  - Delivery/turnaround time
  - Reviews list
  - "Book Now" CTA
- **Exit:** → S12

---

### S12 – Booking Screen
- **Entry:** User taps "Book Now"
- **Sections:**
  - Delivery mode selector: Online | Offline | Hybrid
  - Calendar date picker (tailor's available slots)
  - Time slot picker
  - Notes to tailor (free-text, optional)
  - Booking summary
  - Confirm Booking button
- **Exit:** → S13 (booking confirmed)

---

### S13 – Booking Confirmation Screen
- **Entry:** Booking API returns success
- **Sections:**
  - Success confirmation message
  - Booking reference number
  - Fit Card preview (auto-generated)
  - "View Fit Card" button → S14
  - "Track Order" button → S15
- **Exit:** → S14 or S15

---

### S14 – Fit Card Screen
- **Entry:** From S13 or user dashboard
- **Sections:**
  - User name and avatar
  - Body measurements table
  - Body type label
  - Style preferences summary
  - Outfit reference (image + name)
  - Tailor notes
  - Share button (link or PDF)
  - Download button
- **Exit:** Back to S13 or S15

---

### S15 – Order Tracking Screen
- **Entry:** From S13 or order history
- **Sections:**
  - Order reference + tailor name
  - Status progress bar:
    ```
    Confirmed → Accepted → In Progress → Stitching → Ready → Shipped/Pickup
    ```
  - Status update timestamps
  - Contact Tailor button (Phase 2: opens chat)
  - Estimated delivery date
- **Exit:** → S16 (order completed)

---

### S16 – Feedback Screen
- **Entry:** Order status = "Delivered" or "Picked up"
- **Sections:**
  - Star rating rows: Fit Accuracy | Service | Delivery
  - Text review input (optional)
  - Photo upload (optional)
  - Submit button
- **Exit:** → S17 (thank you / home)

---

### S17 – Home / Dashboard Screen
- **Entry:** After onboarding complete, or via nav bar
- **Sections:**
  - Welcome banner
  - "Start New Fit" CTA
  - Recent recommendations
  - Active orders summary
  - Past fit cards
  - Saved tailors / designers

---

## Navigation Structure

```
S01 Splash
└── S02 Auth
    ├── S03 Intent
    │   └── S04 Profile Input
    │       ├── S05 Scan
    │       └── S06 Smart Filters
    │           └── S07 Recommendations
    │               └── S08 Outfit Detail
    │                   └── S09 Service Selection
    │                       └── S10 Discovery
    │                           └── S11 Provider Profile
    │                               └── S12 Booking
    │                                   └── S13 Confirmation
    │                                       ├── S14 Fit Card
    │                                       └── S15 Order Tracking
    │                                           └── S16 Feedback
    │                                               └── S17 Dashboard
    └── S17 Dashboard (returning user)
```

---

## Screen State Rules

- Screens S04–S12 maintain progressive state in a session object; the user can navigate back without losing input.
- Guest mode users are blocked at S12 (booking requires authentication).
- Profile data from S04/S05 persists across sessions and can be updated from S17 Dashboard.
