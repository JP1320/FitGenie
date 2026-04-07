# Request & Response Examples

## Overview

This document provides full request/response examples for all core FitGenie API flows. Use these as the contract for frontend and backend implementation.

---

## 1. User Profile — GET `/user/profile`

**Request:**
```http
GET /api/v1/user/profile
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response `200 OK`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "display_name": "Aisha Malik",
  "email": "aisha@example.com",
  "phone": null,
  "auth_provider": "google",
  "age": 28,
  "gender": "female",
  "body_type": "hourglass",
  "intent": {
    "type": "for_myself",
    "occasion": "wedding",
    "recipient": null
  },
  "location": {
    "city": "Mumbai",
    "country": "IN"
  },
  "language": "en-IN",
  "is_guest": false,
  "onboarding_complete": true,
  "created_at": "2025-01-15T08:30:00Z",
  "updated_at": "2025-01-20T11:00:00Z"
}
```

---

## 2. Body Scan — POST `/scan/body`

**Request:**
```http
POST /api/v1/scan/body
Authorization: Bearer eyJ...
Content-Type: multipart/form-data

session_id=550e8400-e29b-41d4-a716-446655440000
frames=[frame1.jpg, frame2.jpg, frame3.jpg, frame4.jpg]
```

**Response `200 OK`:**
```json
{
  "scan_session_id": "550e8400-e29b-41d4-a716-446655440000",
  "measurements": {
    "height_cm": 165.0,
    "chest_cm": 88.0,
    "waist_cm": 68.0,
    "hips_cm": 94.0,
    "shoulder_width_cm": 38.5,
    "sleeve_length_cm": 58.0
  },
  "body_proportions": {
    "bust_to_waist_ratio": 1.29,
    "waist_to_hip_ratio": 0.72,
    "shoulder_to_hip_ratio": 0.41
  },
  "inferred_body_type": "hourglass",
  "recommended_size": {
    "top": "S",
    "bottom": "M",
    "dress": "S"
  },
  "fit_type": "regular",
  "confidence_score": 0.91
}
```

**Response `422 Unprocessable Entity` (pose detection failed):**
```json
{
  "error": {
    "code": "SCAN_POSE_DETECTION_FAILED",
    "message": "We could not detect a clear pose in the provided frames. Please ensure good lighting and a clear background.",
    "details": {
      "frames_received": 3,
      "frames_processed": 3,
      "frames_with_valid_pose": 0
    }
  }
}
```

---

## 3. Preferences — POST `/preferences`

**Request:**
```http
POST /api/v1/preferences
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "style": ["ethnic", "indo_western"],
  "budget": {
    "currency": "INR",
    "min": 1000,
    "max": 5000,
    "tier": "1000_2000"
  },
  "fabric": ["cotton", "silk"],
  "fit_details": {
    "sleeve_type": "three_quarter",
    "length": "midi",
    "fit": "regular"
  },
  "occasion": "wedding"
}
```

**Response `201 Created`:**
```json
{
  "id": "pref-uuid-001",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "session_id": "sess-uuid-001",
  "style": ["ethnic", "indo_western"],
  "budget": { "currency": "INR", "min": 1000, "max": 5000, "tier": "1000_2000" },
  "fabric": ["cotton", "silk"],
  "fit_details": { "sleeve_type": "three_quarter", "length": "midi", "fit": "regular" },
  "occasion": "wedding",
  "is_active": true,
  "created_at": "2025-02-01T10:00:00Z"
}
```

---

## 4. Recommendations — POST `/recommendations`

**Request:**
```http
POST /api/v1/recommendations
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "measurement_id": "meas-uuid-001",
  "preference_id": "pref-uuid-001"
}
```

**Response `200 OK`:**
```json
{
  "id": "rec-uuid-001",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "generated_at": "2025-02-01T10:01:00Z",
  "model_version": "fitgenie-rec-v1.2",
  "items": [
    {
      "rank": 1,
      "outfit_id": "CAT-78901",
      "outfit_name": "Embroidered Silk Anarkali Suit",
      "outfit_image_url": "https://cdn.fitgenie.app/catalogue/CAT-78901.jpg",
      "category": "ethnic",
      "style_tags": ["ethnic", "festive", "silk"],
      "size_recommendation": {
        "label": "S",
        "confidence_score": 0.93,
        "confidence_band": "high",
        "size_rationale": "Your chest of 88 cm places you comfortably in size S for this design."
      },
      "fit_type": "regular",
      "price": { "currency": "INR", "amount": 2800 },
      "explanation": {
        "summary": "This Anarkali's flared silhouette beautifully complements your proportions for a wedding.",
        "body_type_match": "The fitted bodice and flared skirt create a balanced look for your body type.",
        "style_match": "Matches your Ethnic and Indo-Western preferences.",
        "fabric_match": "Silk — one of your preferred fabrics — adds an elegant drape.",
        "occasion_match": "Ideal for wedding occasions."
      },
      "selected": false,
      "selected_at": null
    },
    {
      "rank": 2,
      "outfit_id": "CAT-78902",
      "outfit_name": "Cotton Kurta with Palazzo Set",
      "outfit_image_url": "https://cdn.fitgenie.app/catalogue/CAT-78902.jpg",
      "category": "ethnic",
      "style_tags": ["ethnic", "casual", "cotton"],
      "size_recommendation": {
        "label": "S",
        "confidence_score": 0.87,
        "confidence_band": "high",
        "size_rationale": "Your measurements align with size S; the palazzo provides generous ease."
      },
      "fit_type": "regular",
      "price": { "currency": "INR", "amount": 1400 },
      "explanation": {
        "summary": "A comfortable cotton set that works for both casual and semi-formal occasions.",
        "body_type_match": "The straight kurta with wide-leg palazzo elongates the silhouette for your body type.",
        "style_match": "Matches your Ethnic preference.",
        "fabric_match": "Cotton — your preferred fabric.",
        "occasion_match": null
      },
      "selected": false,
      "selected_at": null
    }
  ],
  "session_metadata": {
    "total_items_evaluated": 185,
    "filters_applied": ["style", "budget", "fabric", "occasion"],
    "fallback_used": false,
    "fallback_reason": null
  }
}
```

---

## 5. Booking — POST `/booking`

**Request:**
```http
POST /api/v1/booking
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "tailor_id": "tailor-uuid-001",
  "fit_card_id": "fitcard-uuid-001",
  "service_type": "custom_stitching",
  "delivery_mode": "offline",
  "slot": {
    "date": "2025-02-10",
    "start_time": "10:00",
    "end_time": "11:00",
    "timezone": "Asia/Kolkata"
  },
  "notes_to_tailor": "Please keep the neck slightly loose and add embroidery on the sleeves."
}
```

**Response `201 Created`:**
```json
{
  "id": "booking-uuid-001",
  "reference_number": "FG-20250201-0042",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tailor_id": "tailor-uuid-001",
  "fit_card_id": "fitcard-uuid-001",
  "service_type": "custom_stitching",
  "delivery_mode": "offline",
  "slot": {
    "date": "2025-02-10",
    "start_time": "10:00",
    "end_time": "11:00",
    "timezone": "Asia/Kolkata"
  },
  "status": "confirmed",
  "status_history": [
    {
      "status": "pending",
      "changed_at": "2025-02-01T10:05:00Z",
      "changed_by": "system",
      "note": null
    },
    {
      "status": "confirmed",
      "changed_at": "2025-02-01T10:05:01Z",
      "changed_by": "system",
      "note": "Slot reserved successfully."
    }
  ],
  "notes_to_tailor": "Please keep the neck slightly loose and add embroidery on the sleeves.",
  "price": {
    "currency": "INR",
    "quoted_amount": null,
    "final_amount": null
  },
  "estimated_delivery_date": null,
  "created_at": "2025-02-01T10:05:00Z",
  "updated_at": "2025-02-01T10:05:01Z"
}
```

---

## 6. Fit Card — GET `/fit-card/:id`

**Request:**
```http
GET /api/v1/fit-card/fitcard-uuid-001
Authorization: Bearer eyJ...
```

**Response `200 OK`:**
```json
{
  "id": "fitcard-uuid-001",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "booking_id": "booking-uuid-001",
  "tailor_id": "tailor-uuid-001",
  "generated_at": "2025-02-01T10:05:02Z",
  "version": 1,
  "user_summary": {
    "display_name": "Aisha Malik",
    "avatar_url": "https://cdn.fitgenie.app/avatars/aisha.jpg",
    "age": 28,
    "gender": "female",
    "body_type": "hourglass"
  },
  "measurements": {
    "height_cm": 165.0,
    "chest_cm": 88.0,
    "waist_cm": 68.0,
    "hips_cm": 94.0,
    "shoulder_width_cm": 38.5,
    "sleeve_length_cm": 58.0,
    "source": "ai_scan",
    "confidence_score": 0.91
  },
  "style_preferences": {
    "style": ["ethnic", "indo_western"],
    "fabric": ["cotton", "silk"],
    "fit": "regular",
    "sleeve_type": "three_quarter",
    "length": "midi",
    "occasion": "wedding"
  },
  "outfit_reference": {
    "outfit_id": "CAT-78901",
    "outfit_name": "Embroidered Silk Anarkali Suit",
    "image_url": "https://cdn.fitgenie.app/catalogue/CAT-78901.jpg",
    "category": "ethnic",
    "size_label": "S",
    "fit_type": "regular"
  },
  "tailor_notes": "Please keep the neck slightly loose and add embroidery on the sleeves.",
  "ai_notes": "Customer's shoulder width (38.5 cm) is slightly narrower than the standard S armhole. Consider reducing the armhole width by 0.5 cm each side. Preferred fit is regular; maintain standard ease at chest and waist.",
  "share_token": "tk_a1b2c3d4e5f6",
  "share_expires_at": null,
  "is_shared": true
}
```
