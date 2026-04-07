# Data Model: Booking & Orders

## Purpose

Tracks the lifecycle of a customer's booking with a tailor or designer, from initial confirmation through to delivery and feedback.

---

## Schema

```json
{
  "id": "uuid",
  "reference_number": "string",
  "user_id": "uuid",
  "tailor_id": "uuid",
  "fit_card_id": "uuid",
  "recommendation_item_id": "uuid | null",
  "service_type": "custom_stitching | designer_wear | alteration | personal_styling",
  "delivery_mode": "online | offline | hybrid",
  "slot": {
    "date": "YYYY-MM-DD",
    "start_time": "HH:MM",
    "end_time": "HH:MM",
    "timezone": "string (IANA, e.g. Asia/Kolkata)"
  },
  "status": "pending | confirmed | accepted | in_progress | stitching | ready | shipped | picked_up | cancelled | refunded",
  "status_history": [
    {
      "status": "string",
      "changed_at": "ISO 8601 timestamp",
      "changed_by": "user | tailor | system",
      "note": "string | null"
    }
  ],
  "notes_to_tailor": "string | null",
  "price": {
    "currency": "INR",
    "quoted_amount": "integer | null",
    "final_amount": "integer | null"
  },
  "estimated_delivery_date": "YYYY-MM-DD | null",
  "actual_delivery_date": "YYYY-MM-DD | null",
  "tracking_updates": [
    {
      "stage": "string",
      "message": "string",
      "updated_at": "ISO 8601 timestamp"
    }
  ],
  "cancellation": {
    "cancelled_by": "user | tailor | system | null",
    "reason": "string | null",
    "cancelled_at": "ISO 8601 timestamp | null"
  },
  "feedback_id": "uuid | null",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

---

## Field Definitions

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID | Yes | Internal primary key |
| `reference_number` | String | Yes | Human-readable; format `FG-YYYYMMDD-XXXX`; unique |
| `user_id` | UUID | Yes | Customer |
| `tailor_id` | UUID | Yes | Service provider |
| `fit_card_id` | UUID | Yes | Fit Card sent to tailor at booking |
| `service_type` | Enum | Yes | Determines workflow and tailor capabilities required |
| `delivery_mode` | Enum | Yes | Offline = visit; Online = courier; Hybrid = measurement online, delivery offline |
| `slot` | Object | Yes | Must fall within tailor's `availability.weekly_schedule` |
| `status` | Enum | Yes | Current order status |
| `status_history` | Array | Yes | Append-only audit log of all status changes |
| `notes_to_tailor` | String | No | Max 500 chars; free-text instructions |
| `price.quoted_amount` | Integer | No | Tailor sets after reviewing Fit Card |
| `price.final_amount` | Integer | No | Set on completion; may differ from quote |
| `estimated_delivery_date` | Date | No | Set by tailor after acceptance |
| `tracking_updates` | Array | Yes | Append-only; each stage change creates a tracking entry |
| `feedback_id` | UUID | No | Linked after user submits post-delivery rating |

---

## Order Status Lifecycle

```
[pending] → [confirmed] → [accepted]
    → [in_progress] → [stitching] → [ready]
    → [shipped] or [picked_up]
    (at any point before ready) → [cancelled]
```

| Status | Trigger | Actor |
|---|---|---|
| `pending` | Booking submitted by user | System |
| `confirmed` | Booking slot reserved | System |
| `accepted` | Tailor accepts the order | Tailor |
| `in_progress` | Work started | Tailor |
| `stitching` | Stitching phase active | Tailor |
| `ready` | Order ready for delivery/pickup | Tailor |
| `shipped` | Package dispatched (online) | Tailor |
| `picked_up` | Customer collected in person | System / Tailor |
| `cancelled` | Either party cancels | User or Tailor |

---

## Cancellation Rules

- User may cancel before status = `in_progress`.
- Tailor may cancel before status = `accepted`.
- System cancellation occurs if tailor does not accept within 48 hours of booking.

---

## Notification Triggers

| Status Change | Notify |
|---|---|
| `confirmed` | User: booking confirmation |
| `accepted` | User: tailor accepted your order |
| `in_progress` | User: work has started |
| `ready` | User: your order is ready |
| `shipped` | User: tracking number + courier details |
| `cancelled` | Both parties |

---

## Relationships

- `booking.user_id` → `user_profile.id`
- `booking.tailor_id` → `tailor_designer.id`
- `booking.fit_card_id` → `fit_card.id`
- `booking.feedback_id` → `feedback.id`
