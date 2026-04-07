# API Endpoint Catalog

## Base URL

```
https://api.fitgenie.app/api/v1
```

All endpoints require `Authorization: Bearer <access_token>` unless marked **[Public]**.

---

## Authentication Endpoints

### POST `/auth/register`
Register a new user with email/phone.

### POST `/auth/login`
Authenticate and receive JWT + refresh token.

### POST `/auth/oauth/callback`
Handle OAuth callback (Google, Apple).

### POST `/auth/refresh`
Exchange refresh token for new access token.

### POST `/auth/logout`
Revoke refresh token.

---

## User Profile Endpoints

### GET `/user/profile`
Retrieve the authenticated user's profile.

**Response:** `200 OK` — user profile object.

---

### PUT `/user/profile`
Update user profile fields.

**Body:**
```json
{
  "display_name": "string",
  "age": "integer",
  "gender": "string",
  "body_type": "string",
  "language": "string",
  "intent": { "type": "string", "occasion": "string | null", "recipient": "string | null" }
}
```

**Response:** `200 OK` — updated profile object.

---

### DELETE `/user/profile`
Initiate account deletion (soft-delete; hard-delete after 30 days).

**Response:** `204 No Content`

---

## Body Scan Endpoints

### POST `/scan/body`
Submit a body scan session and receive extracted measurements.

**Request:** `multipart/form-data`
- `frames`: array of image files (2–6 frames; front and side views)
- `session_id`: UUID (client-generated)

**Response:** `200 OK`
```json
{
  "scan_session_id": "uuid",
  "measurements": {
    "height_cm": 168.0,
    "chest_cm": 90.0,
    "waist_cm": 72.0,
    "hips_cm": 96.0
  },
  "body_proportions": { "waist_to_hip_ratio": 0.75 },
  "inferred_body_type": "hourglass",
  "recommended_size": { "top": "M", "bottom": "M", "dress": "M" },
  "fit_type": "regular",
  "confidence_score": 0.88
}
```

**Errors:** `400` (invalid frames), `422` (pose detection failed), `429` (rate limit)

---

### GET `/scan/body/history`
List all previous scan sessions for the authenticated user.

**Response:** `200 OK` — array of measurement records.

---

## Measurements Endpoints

### GET `/measurements`
Get the user's active measurement record.

**Response:** `200 OK` — active measurement object.

---

### POST `/measurements`
Save a manually entered measurement record.

**Body:**
```json
{
  "source": "manual",
  "measurements": {
    "height_cm": 170,
    "chest_cm": 92,
    "waist_cm": 74,
    "hips_cm": 98
  },
  "fit_type": "regular"
}
```

**Response:** `201 Created` — new measurement record.

---

### PUT `/measurements/:id`
Update an existing measurement record.

**Response:** `200 OK` — updated record.

---

## Preferences Endpoints

### GET `/preferences`
Get the user's active preference set.

**Response:** `200 OK`

---

### POST `/preferences`
Save a new preference set.

**Body:**
```json
{
  "style": ["ethnic", "casual"],
  "budget": { "currency": "INR", "min": 500, "max": 2000, "tier": "500_1000" },
  "fabric": ["cotton"],
  "fit_details": { "sleeve_type": "full", "length": "regular", "fit": "regular" },
  "occasion": "wedding"
}
```

**Response:** `201 Created`

---

## Recommendations Endpoints

### POST `/recommendations`
Generate a personalised recommendation set.

**Body:**
```json
{
  "measurement_id": "uuid",
  "preference_id": "uuid"
}
```

**Response:** `200 OK` — recommendation object with ranked items.

---

### GET `/recommendations/:id`
Retrieve a saved recommendation session.

**Response:** `200 OK`

---

### PATCH `/recommendations/:id/items/:outfit_id/select`
Mark a recommendation item as selected.

**Response:** `200 OK`

---

## Fit Card Endpoints

### GET `/fit-card`
List the authenticated user's fit cards.

**Response:** `200 OK` — array of fit card summaries.

---

### GET `/fit-card/:id`
Get a specific fit card.

**Response:** `200 OK` — full fit card object.

---

### POST `/fit-card/generate`
Generate a fit card for a booking.

**Body:**
```json
{
  "booking_id": "uuid",
  "measurement_id": "uuid",
  "preference_id": "uuid",
  "outfit_reference": { "outfit_id": "string", "size_label": "string" },
  "tailor_notes": "string | null"
}
```

**Response:** `201 Created` — fit card object.

---

### GET `/fit-card/share/:share_token` **[Public]**
Retrieve a shared fit card by token (read-only, anonymised).

**Response:** `200 OK` — public fit card view.

---

## Tailors Endpoints

### GET `/tailors`
List and search the tailor/designer marketplace.

**Query params:**
- `service_type`: filter by service type
- `rating_min`: minimum rating (e.g., `4.0`)
- `city`: filter by city name
- `lat`, `lng`, `radius_km`: proximity search
- `online_only`: `true | false`
- `page`, `limit`: pagination

**Response:** `200 OK` — paginated array of tailor listing cards.

---

### GET `/tailors/:id`
Get full tailor/designer profile.

**Response:** `200 OK` — full provider profile.

---

### GET `/tailors/:id/slots`
Get available booking slots for a provider.

**Query params:**
- `date_from`: `YYYY-MM-DD`
- `date_to`: `YYYY-MM-DD`

**Response:** `200 OK`
```json
{
  "tailor_id": "uuid",
  "slots": [
    { "slot_start": "2025-02-10T10:00:00+05:30", "slot_end": "2025-02-10T11:00:00+05:30" }
  ]
}
```

---

## Booking Endpoints

### POST `/booking`
Create a new booking.

**Body:**
```json
{
  "tailor_id": "uuid",
  "fit_card_id": "uuid",
  "service_type": "custom_stitching",
  "delivery_mode": "offline",
  "slot": {
    "date": "2025-02-10",
    "start_time": "10:00",
    "end_time": "11:00",
    "timezone": "Asia/Kolkata"
  },
  "notes_to_tailor": "Please keep the neck slightly loose."
}
```

**Response:** `201 Created` — booking object with `reference_number`.

---

### GET `/booking`
List the authenticated user's bookings.

**Query params:** `status`, `page`, `limit`

**Response:** `200 OK` — paginated array.

---

### GET `/booking/:id`
Get a specific booking with full status history.

**Response:** `200 OK`

---

### PATCH `/booking/:id/cancel`
Cancel a booking.

**Body:**
```json
{ "reason": "string" }
```

**Response:** `200 OK` — updated booking with `status: "cancelled"`.

---

## Feedback Endpoints

### POST `/feedback`
Submit post-delivery feedback.

**Body:**
```json
{
  "booking_id": "uuid",
  "fit_accuracy": 5,
  "service_rating": 4,
  "delivery_rating": 5,
  "review_text": "Excellent stitching, perfect fit.",
  "photo_url": "string | null"
}
```

**Response:** `201 Created`

---

## Pagination

All list endpoints support:
- `page` (default: `1`)
- `limit` (default: `20`, max: `100`)

Response includes:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```
