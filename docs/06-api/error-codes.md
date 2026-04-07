# API Error Codes

## Overview

All FitGenie API errors follow a consistent response envelope. HTTP status codes are used semantically. Every error response includes a machine-readable `code` and a human-readable `message`.

---

## Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable description of the error.",
    "details": { } 
  }
}
```

`details` is optional and may contain field-level validation errors or additional context.

---

## HTTP Status Code Usage

| Status | Meaning |
|---|---|
| `400 Bad Request` | Malformed request syntax or invalid parameter types |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | Authenticated but not authorised to access the resource |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Request conflicts with existing state (e.g., duplicate booking slot) |
| `422 Unprocessable Entity` | Request is well-formed but fails business logic validation |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected server-side failure |
| `503 Service Unavailable` | AI layer or downstream service temporarily unavailable |

---

## Authentication Errors

| Code | HTTP | Description |
|---|---|---|
| `AUTH_TOKEN_MISSING` | 401 | No `Authorization` header provided |
| `AUTH_TOKEN_INVALID` | 401 | JWT signature invalid or token malformed |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired; client should refresh |
| `AUTH_REFRESH_INVALID` | 401 | Refresh token invalid, expired, or revoked |
| `AUTH_INSUFFICIENT_SCOPE` | 403 | Token does not have permission for this operation |
| `AUTH_ACCOUNT_DELETED` | 403 | Account has been deactivated or deleted |
| `AUTH_GUEST_NOT_PERMITTED` | 403 | Action requires a registered account (guest mode blocked) |

---

## Validation Errors

| Code | HTTP | Description |
|---|---|---|
| `VALIDATION_REQUIRED_FIELD` | 400 | A required field is missing |
| `VALIDATION_INVALID_FORMAT` | 400 | Field value does not match expected format (e.g., invalid UUID) |
| `VALIDATION_OUT_OF_RANGE` | 422 | Numeric value is outside allowed range |
| `VALIDATION_INVALID_ENUM` | 400 | Enum field contains an unrecognised value |
| `VALIDATION_MAX_LENGTH` | 400 | String field exceeds maximum allowed length |
| `VALIDATION_DUPLICATE` | 409 | Unique constraint violated (e.g., email already registered) |

**Example (field-level validation):**
```json
{
  "error": {
    "code": "VALIDATION_REQUIRED_FIELD",
    "message": "One or more required fields are missing.",
    "details": {
      "fields": [
        { "field": "measurements.chest_cm", "issue": "required" },
        { "field": "measurements.waist_cm", "issue": "required" }
      ]
    }
  }
}
```

---

## Resource Errors

| Code | HTTP | Description |
|---|---|---|
| `RESOURCE_NOT_FOUND` | 404 | The requested resource does not exist |
| `RESOURCE_ACCESS_DENIED` | 403 | User does not own this resource |
| `RESOURCE_ALREADY_EXISTS` | 409 | Attempt to create a resource that already exists |
| `RESOURCE_DELETED` | 404 | Resource has been soft-deleted |

---

## Scan Errors

| Code | HTTP | Description |
|---|---|---|
| `SCAN_FRAMES_INVALID` | 400 | Uploaded frames are not valid image files |
| `SCAN_FRAMES_INSUFFICIENT` | 422 | Fewer than the required minimum frames provided |
| `SCAN_POSE_DETECTION_FAILED` | 422 | No valid pose detected in uploaded frames |
| `SCAN_LOW_QUALITY` | 422 | Frames are too dark, blurry, or obstructed; prompt user to retry |
| `SCAN_SERVICE_UNAVAILABLE` | 503 | AI scan service temporarily unavailable |

---

## Recommendation Errors

| Code | HTTP | Description |
|---|---|---|
| `REC_MEASUREMENT_REQUIRED` | 422 | No active measurement record; scan or manual entry required first |
| `REC_PREFERENCE_REQUIRED` | 422 | No preference record provided |
| `REC_NO_RESULTS` | 200 | Request succeeded but zero items matched even after fallback |
| `REC_SERVICE_UNAVAILABLE` | 503 | AI recommendation service temporarily unavailable |

Note: `REC_NO_RESULTS` returns `200` (not an error) with an empty `items` array and a user-facing message.

---

## Booking Errors

| Code | HTTP | Description |
|---|---|---|
| `BOOKING_SLOT_UNAVAILABLE` | 409 | The requested slot is no longer available |
| `BOOKING_TAILOR_NOT_ACCEPTING` | 422 | Tailor has paused new orders |
| `BOOKING_FIT_CARD_REQUIRED` | 422 | A fit card must be generated before booking |
| `BOOKING_CANNOT_CANCEL` | 422 | Booking is past the cancellable stage (in_progress or later) |
| `BOOKING_NOT_FOUND` | 404 | Booking ID does not exist or belongs to another user |

---

## Fit Card Errors

| Code | HTTP | Description |
|---|---|---|
| `FIT_CARD_NOT_FOUND` | 404 | Fit card does not exist |
| `FIT_CARD_SHARE_TOKEN_INVALID` | 404 | Share token is invalid or expired |
| `FIT_CARD_GENERATION_FAILED` | 500 | AI layer failed to generate fit card notes |

---

## Rate Limit Errors

| Code | HTTP | Description |
|---|---|---|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests; includes `Retry-After` header in seconds |

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after_seconds": 47
    }
  }
}
```

---

## Server Errors

| Code | HTTP | Description |
|---|---|---|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error; logged server-side with request ID |
| `SERVICE_UNAVAILABLE` | 503 | One or more downstream services are unavailable |

Server error responses include a `request_id` for support tracing:
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again.",
    "details": {
      "request_id": "req_abc123xyz"
    }
  }
}
```

---

## Client Handling Guidance

| Scenario | Client Action |
|---|---|
| `401 AUTH_TOKEN_EXPIRED` | Silently refresh token and retry request once |
| `401 AUTH_REFRESH_INVALID` | Redirect to login screen |
| `403 AUTH_GUEST_NOT_PERMITTED` | Show "Create an account to continue" prompt |
| `409 BOOKING_SLOT_UNAVAILABLE` | Refresh available slots and prompt user to pick another |
| `422 SCAN_POSE_DETECTION_FAILED` | Show retry guidance with tips (lighting, background) |
| `429 RATE_LIMIT_EXCEEDED` | Show non-intrusive "Please wait" indicator; respect `Retry-After` |
| `503 SERVICE_UNAVAILABLE` | Show "This feature is temporarily unavailable" and offer to retry |
| `500 INTERNAL_SERVER_ERROR` | Show generic error with `request_id` for support |
