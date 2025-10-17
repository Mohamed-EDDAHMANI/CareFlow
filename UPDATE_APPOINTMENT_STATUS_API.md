# Update Appointment Status API

Allows doctors to change appointment status (scheduled, completed, cancelled).

## Endpoint

**PATCH** `/api/appointments/:id/status`

---

## Authorization

**Required**: Bearer Token (JWT)

**Access Control**:
- ✅ **Assigned Doctor**: The doctor assigned to the appointment can update it
- ✅ **Admin**: Users with admin role or administration permission
- ❌ **Other Doctors**: Cannot update appointments they're not assigned to
- ❌ **Patients**: Cannot update appointment status

---

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Appointment ID |

---

## Request Body

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| status | string | Yes | `scheduled`, `completed`, `cancelled` | New status for the appointment |

---

## Status Transition Rules

### Valid Transitions

| From Status | To Status | Allowed | Notes |
|------------|-----------|---------|-------|
| scheduled | completed | ✅ Yes | Only if appointment date has passed |
| scheduled | cancelled | ✅ Yes | Any time |
| completed | scheduled | ❌ No | Cannot revert completed appointments |
| completed | cancelled | ❌ No | Cannot change completed appointments |
| cancelled | scheduled | ❌ No | Cannot reactivate cancelled appointments |
| cancelled | completed | ❌ No | Cannot change cancelled appointments |

### Business Rules

1. **Completion Rule**: Cannot mark a future appointment as "completed"
   - System checks if appointment start time has passed
   - Error: `INVALID_OPERATION` if trying to complete future appointment

2. **Cancellation Permanence**: Once cancelled, appointments cannot be changed
   - This prevents accidental modifications to historical data
   - Error: `INVALID_OPERATION` if trying to change cancelled appointment

3. **Authorization**: Only assigned doctor or admin can update
   - Error: `FORBIDDEN` if other users try to update

---

## Request Examples

### Example 1: Mark Appointment as Completed

```bash
PATCH /api/appointments/68f0e8bff5a469392e0343bc/status
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "status": "completed"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Appointment status updated from \"scheduled\" to \"completed\"",
  "data": {
    "id": "68f0e8bff5a469392e0343bc",
    "patientId": {
      "_id": "68f0e7ca8e911b88da31770f",
      "name": "John Doe",
      "email": "john@example.com",
      "cin": "AB123456"
    },
    "doctorId": {
      "_id": "68f0e7ca8e911b88da31770e",
      "name": "Dr. Smith",
      "email": "dr.smith@example.com",
      "cin": "CD789012"
    },
    "start": "2025-10-17T09:00:00.000Z",
    "end": "2025-10-17T10:00:00.000Z",
    "reason": "Annual Checkup",
    "type": "consultation générale",
    "status": "completed",
    "document": [
      "uploads/appointments/appointment-1729160000000-123456.pdf"
    ],
    "updatedAt": "2025-10-17T15:30:00.000Z"
  }
}
```

---

### Example 2: Cancel Appointment

```bash
PATCH /api/appointments/68f0e8bff5a469392e0343bc/status
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "status": "cancelled"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Appointment status updated from \"scheduled\" to \"cancelled\"",
  "data": {
    "id": "68f0e8bff5a469392e0343bc",
    "patientId": {...},
    "doctorId": {...},
    "start": "2025-10-20T14:00:00.000Z",
    "end": "2025-10-20T15:00:00.000Z",
    "reason": "Follow-up",
    "type": "suivi",
    "status": "cancelled",
    "document": [],
    "updatedAt": "2025-10-17T16:00:00.000Z"
  }
}
```

---

### Example 3: Reschedule (Set back to Scheduled)

```bash
PATCH /api/appointments/68f0e8bff5a469392e0343bc/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "scheduled"
}
```

**Note**: Can only change to "scheduled" if appointment was never completed or cancelled.

---

## Error Responses

### 400 - Invalid Status

**Scenario**: Providing invalid status value

```json
{
  "success": false,
  "error": "INVALID_STATUS",
  "message": "Invalid status. Must be one of: scheduled, completed, cancelled"
}
```

---

### 400 - Cannot Complete Future Appointment

**Scenario**: Trying to mark a future appointment as completed

```json
{
  "success": false,
  "error": "INVALID_OPERATION",
  "message": "Cannot mark a future appointment as completed"
}
```

---

### 400 - Cannot Change Cancelled Appointment

**Scenario**: Trying to modify a cancelled appointment

```json
{
  "success": false,
  "error": "INVALID_OPERATION",
  "message": "Cannot change status of a cancelled appointment"
}
```

---

### 403 - Not Authorized

**Scenario**: Doctor trying to update another doctor's appointment

```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "You are not authorized to update this appointment. Only the assigned doctor or admin can update it."
}
```

---

### 404 - Appointment Not Found

**Scenario**: Invalid appointment ID

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Appointment not found"
}
```

---

## Use Cases

### 1. **Doctor Completes Appointment**
After finishing a consultation:
```javascript
// Doctor marks appointment as completed after patient visit
PATCH /api/appointments/68f123.../status
{ "status": "completed" }
```

### 2. **Patient Cancellation**
When patient calls to cancel:
```javascript
// Admin/Secretary cancels on behalf of patient
PATCH /api/appointments/68f123.../status
{ "status": "cancelled" }
```

### 3. **Doctor Emergency Cancellation**
When doctor has an emergency:
```javascript
// Doctor cancels their scheduled appointments
PATCH /api/appointments/68f123.../status
{ "status": "cancelled" }
```

### 4. **Administrative Correction**
When admin needs to fix a mistake:
```javascript
// Admin can change any appointment status (unless cancelled)
PATCH /api/appointments/68f123.../status
{ "status": "scheduled" }
```

---

## cURL Examples

### Mark as Completed
```bash
curl -X PATCH http://localhost:3000/api/appointments/68f0e8bff5a469392e0343bc/status \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Cancel Appointment
```bash
curl -X PATCH http://localhost:3000/api/appointments/68f0e8bff5a469392e0343bc/status \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "cancelled"}'
```

---

## Frontend Integration

### React Example

```javascript
const updateAppointmentStatus = async (appointmentId, newStatus) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/appointments/${appointmentId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      }
    );

    const data = await response.json();

    if (data.success) {
      alert(`Appointment ${newStatus} successfully`);
      // Refresh appointment list
      fetchAppointments();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    alert('Failed to update appointment status');
  }
};

// Usage
<button onClick={() => updateAppointmentStatus('68f123...', 'completed')}>
  Mark as Completed
</button>
```

---

## Status Icons & Colors (UI Recommendation)

| Status | Icon | Color | Badge |
|--------|------|-------|-------|
| scheduled | 📅 | Blue | `bg-blue-100 text-blue-800` |
| completed | ✅ | Green | `bg-green-100 text-green-800` |
| cancelled | ❌ | Red | `bg-red-100 text-red-800` |

---

## Logging

Every status change is logged in the console:

```
✅ Appointment 68f0e8bff5a469392e0343bc status changed from "scheduled" to "completed" by Dr. Smith
```

This helps with:
- Audit trail
- Debugging
- Monitoring appointment workflows

---

## Validation

Request validation uses Joi schema:

```javascript
{
  status: Joi.string()
    .valid('scheduled', 'completed', 'cancelled')
    .required()
}
```

Invalid requests are rejected before reaching the controller.

---

## Best Practices

### For Doctors:
1. ✅ **Mark completed immediately** after patient consultation
2. ✅ **Cancel early** if unable to attend
3. ✅ **Don't mark future appointments** as completed

### For Admins:
1. ✅ **Verify before changing status** - confirm with doctor/patient
2. ✅ **Use cancellation for no-shows** - mark as cancelled if patient doesn't show up
3. ✅ **Keep audit trail** - log reasons for status changes

### For System:
1. ✅ **Send notifications** when status changes (email/SMS)
2. ✅ **Update patient records** when appointment completed
3. ✅ **Free up slot** when appointment cancelled (allow rebooking)

---

## Future Enhancements

Potential improvements:

1. **Reason for Cancellation**: Add optional `cancellationReason` field
2. **Rescheduling**: Add endpoint to reschedule instead of cancel
3. **No-Show Status**: Add "no_show" status for patients who don't attend
4. **Notification System**: Send email/SMS when status changes
5. **History Tracking**: Keep log of all status changes with timestamps
6. **Batch Operations**: Update multiple appointment statuses at once

---

## Related Endpoints

- `POST /api/appointments/create/:patientId` - Create appointment
- `GET /api/appointments/:id` - Get appointment details
- `GET /api/appointments/doctor/:doctorId` - Get doctor's appointments
- `GET /api/appointments/all` - Get all appointments

---

## Testing Checklist

- [ ] Assigned doctor can update their appointment status
- [ ] Other doctors cannot update the appointment
- [ ] Admin can update any appointment
- [ ] Cannot complete future appointments
- [ ] Cannot change cancelled appointments
- [ ] Status transitions follow business rules
- [ ] Invalid status values are rejected
- [ ] Appointment not found returns 404
- [ ] Response includes updated appointment data
- [ ] Logging works correctly
