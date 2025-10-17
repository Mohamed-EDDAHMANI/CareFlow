# Patient History API Documentation

Complete patient medical history combining appointments and medical records in chronological order.

## Endpoint

**GET** `/api/users/history/:patientId`

Get complete patient history including appointments and medical records, combined and sorted chronologically.

---

## Authorization

**Required**: Bearer Token (JWT)

**Permissions**: Any authenticated user can access

---

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| patientId | string | Yes | Patient's user ID |

---

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 20 | Number of items per page |
| sortOrder | string | desc | Sort order: "asc" (oldest first) or "desc" (newest first) |
| type | string | all | Filter by type: "appointment", "medical_record", or "all" |
| from | date | - | Start date filter (ISO 8601 format) |
| to | date | - | End date filter (ISO 8601 format) |

---

## Request Examples

### Get All History (Default)
```bash
GET /api/users/history/68f0e7ca8e911b88da31770f
Authorization: Bearer <token>
```

### Filter by Type (Only Appointments)
```bash
GET /api/users/history/68f0e7ca8e911b88da31770f?type=appointment&page=1&limit=10
Authorization: Bearer <token>
```

### Filter by Date Range
```bash
GET /api/users/history/68f0e7ca8e911b88da31770f?from=2025-01-01&to=2025-12-31
Authorization: Bearer <token>
```

### Sort Oldest First
```bash
GET /api/users/history/68f0e7ca8e911b88da31770f?sortOrder=asc
Authorization: Bearer <token>
```

---

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "Patient history retrieved successfully",
  "patient": {
    "id": "68f0e7ca8e911b88da31770f",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "cin": "AB123456",
    "birthDate": "1990-05-15T00:00:00.000Z"
  },
  "statistics": {
    "total": 15,
    "appointments": 8,
    "medicalRecords": 7,
    "urgentRecords": 2
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  },
  "data": [
    {
      "id": "68f1234567890abcdef12345",
      "type": "medical_record",
      "date": "2025-10-15T10:30:00.000Z",
      "title": "Blood Test",
      "description": "Annual checkup blood test",
      "priority": "Normal",
      "medicalType": "Blood Test",
      "appointment": {
        "id": "68f0e8bff5a469392e0343bc",
        "reason": "Annual Checkup",
        "date": "2025-10-15T09:00:00.000Z"
      },
      "documents": [
        "uploads/medical-records/medical-1729170000000-123456789.pdf"
      ],
      "actions": [
        {
          "_id": "68f987...",
          "type": "analysis",
          "description": "Blood sample sent to lab",
          "document": "uploads/medical-records/...",
          "createdAt": "2025-10-15T11:00:00.000Z"
        }
      ],
      "metadata": {
        "priority": "Normal",
        "typeMedical": "Blood Test",
        "description": "Annual checkup blood test",
        "resultDate": "2025-10-15T10:30:00.000Z",
        "actionsCount": 1
      },
      "createdAt": "2025-10-15T10:30:00.000Z",
      "updatedAt": "2025-10-15T14:00:00.000Z"
    },
    {
      "id": "68f0e8bff5a469392e0343bc",
      "type": "appointment",
      "date": "2025-10-15T09:00:00.000Z",
      "endDate": "2025-10-15T10:00:00.000Z",
      "title": "Annual Checkup",
      "description": "Annual Checkup",
      "status": "confirmed",
      "appointmentType": "consultation générale",
      "doctor": {
        "id": "68f0e7ca8e911b88da31770e",
        "name": "Dr. Smith",
        "email": "dr.smith@example.com"
      },
      "documents": [
        "uploads/appointments/appointment-1729160000000-987654321.pdf"
      ],
      "metadata": {
        "reason": "Annual Checkup",
        "type": "consultation générale",
        "status": "confirmed",
        "start": "2025-10-15T09:00:00.000Z",
        "end": "2025-10-15T10:00:00.000Z"
      },
      "createdAt": "2025-10-10T08:00:00.000Z",
      "updatedAt": "2025-10-10T08:00:00.000Z"
    }
  ]
}
```

---

## Data Structure

### Unified History Item Format

Each item in the `data` array follows a unified format regardless of type:

#### Common Fields (All Items)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| type | string | "appointment" or "medical_record" |
| date | date | Primary date for sorting |
| title | string | Summary/title of the item |
| description | string | Detailed description |
| documents | array | Array of document file paths |
| createdAt | date | Creation timestamp |
| updatedAt | date | Last update timestamp |
| metadata | object | Type-specific additional data |

#### Appointment-Specific Fields
| Field | Type | Description |
|-------|------|-------------|
| endDate | date | Appointment end time |
| status | string | Appointment status |
| appointmentType | string | Type of appointment |
| doctor | object | Doctor information |

#### Medical Record-Specific Fields
| Field | Type | Description |
|-------|------|-------------|
| priority | string | Priority level (Normal, À suivre, etc.) |
| medicalType | string | Type of medical record |
| appointment | object | Related appointment info |
| actions | array | Medical actions (treatments, scans, etc.) |

---

## Statistics Object

The response includes statistics about the patient's history:

```json
{
  "total": 15,              // Total items in history
  "appointments": 8,        // Number of appointments
  "medicalRecords": 7,      // Number of medical records
  "urgentRecords": 2        // Number of urgent medical records
}
```

---

## Error Responses

### 404 - Patient Not Found
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Patient not found"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Please authenticate"
}
```

---

## Use Cases

### 1. **Patient Dashboard**
Display complete medical history timeline with appointments and records

### 2. **Doctor Consultation**
Review patient's medical history before appointment

### 3. **Medical Reports**
Generate comprehensive patient reports with all medical data

### 4. **History Export**
Export patient data for transfer or archival purposes

### 5. **Timeline View**
Visualize patient's medical journey chronologically

---

## Sorting & Filtering

### Sort Order
- **desc** (default): Most recent first (2025 → 2024 → 2023)
- **asc**: Oldest first (2023 → 2024 → 2025)

### Type Filtering
- **all** (default): Returns both appointments and medical records
- **appointment**: Only appointments
- **medical_record**: Only medical records

### Date Filtering
- **from**: Include items from this date onward
- **to**: Include items up to this date
- Both can be combined for a date range

---

## Example Use Cases with cURL

### 1. Get Last 3 Months of History
```bash
curl -X GET "http://localhost:3000/api/users/history/68f0e7ca8e911b88da31770f?from=2025-07-01&to=2025-10-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Only Urgent Medical Records
```bash
curl -X GET "http://localhost:3000/api/users/history/68f0e7ca8e911b88da31770f?type=medical_record" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Patient's Appointment History
```bash
curl -X GET "http://localhost:3000/api/users/history/68f0e7ca8e911b88da31770f?type=appointment&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Timeline View (Oldest First)
```bash
curl -X GET "http://localhost:3000/api/users/history/68f0e7ca8e911b88da31770f?sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance Considerations

- **Pagination**: Use appropriate `limit` values to avoid large responses
- **Date Filtering**: Use date ranges to limit data retrieval
- **Type Filtering**: Filter by type when only specific data is needed
- **Caching**: Consider caching frequently accessed patient histories

---

## Future Enhancements

Potential improvements for this endpoint:

1. **Group by Date**: Option to group items by day/week/month
2. **Include Statistics**: Add health metrics and trends
3. **Export Options**: PDF/CSV export functionality
4. **Search**: Search within patient history
5. **Filtering**: Filter by doctor, priority, status, etc.
6. **Aggregation**: Summary views and analytics
