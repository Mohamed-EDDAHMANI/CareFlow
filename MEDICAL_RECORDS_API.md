# Medical Records API Documentation

Complete CRUD operations for medical records with document upload functionality.

## Base URL
```
/api/medical-records
```

---

## Endpoints

### 1. CREATE Medical Record
**POST** `/api/medical-records`

Create a new medical record with optional document uploads.

**Authorization**: Bearer Token (Permission: `create_medical_record`)

**Content-Type**: `multipart/form-data`

**Body Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| patientId | string | Yes | Patient's user ID |
| appointmentId | string | Yes | Related appointment ID |
| priority | string | No | Normal, À suivre, Traitement nécessaire, Urgent (default: Normal) |
| typeMedical | string | Yes | Type of medical record |
| description | string | No | Description/notes |
| resultDate | date | No | Result date (default: now) |
| documents | file[] | No | Multiple medical documents (max 10, 20MB each) |

**Example Request**:
```bash
POST /api/medical-records
Authorization: Bearer <token>
Content-Type: multipart/form-data

patientId: 68f0e7ca8e911b88da31770f
appointmentId: 68f0e8bff5a469392e0343bc
priority: Normal
typeMedical: Blood Test
description: Annual checkup blood test
documents: [file1.pdf]
documents: [file2.jpg]
```

**Response** (201):
```json
{
  "success": true,
  "message": "Medical record created successfully",
  "data": {
    "_id": "68f1234567890abcdef12345",
    "patientId": {
      "_id": "68f0e7ca8e911b88da31770f",
      "name": "John Doe",
      "email": "john@example.com",
      "cin": "AB123456"
    },
    "appointmentId": {
      "_id": "68f0e8bff5a469392e0343bc",
      "start": "2025-10-17T09:00:00.000Z",
      "end": "2025-10-17T10:00:00.000Z",
      "reason": "Checkup",
      "type": "consultation générale"
    },
    "priority": "Normal",
    "typeMedical": "Blood Test",
    "description": "Annual checkup blood test",
    "document": [
      "uploads/medical-records/medical-1729170000000-123456789.pdf",
      "uploads/medical-records/medical-1729170000000-987654321.jpg"
    ],
    "actions": [],
    "resultDate": "2025-10-17T10:30:00.000Z",
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z"
  }
}
```

---

### 2. GET All Medical Records
**GET** `/api/medical-records/all`

Get all medical records with optional filters.

**Authorization**: Bearer Token (Permission: `view_medical_record`)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| patientId | string | Filter by patient ID |
| priority | string | Filter by priority |
| typeMedical | string | Filter by medical type |
| from | date | Start date filter (ISO format) |
| to | date | End date filter (ISO format) |
| sort | string | Sort field (default: resultDate) |
| order | string | asc or desc (default: desc) |

**Example Request**:
```bash
GET /api/medical-records/all?priority=Urgent&page=1&limit=20
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "total": 45,
  "totalPages": 3,
  "data": [...]
}
```

---

### 3. GET Patient's Medical Records
**GET** `/api/medical-records/patient/:patientId`

Get all medical records for a specific patient.

**Authorization**: Bearer Token (Permission: `view_medical_record`)

**Path Parameters**:
- `patientId` - Patient's user ID

**Query Parameters**: Same as "Get All Medical Records"

**Example Request**:
```bash
GET /api/medical-records/patient/68f0e7ca8e911b88da31770f?page=1&limit=10
Authorization: Bearer <token>
```

---

### 4. GET Medical Record by ID
**GET** `/api/medical-records/:id`

Get a single medical record with full details.

**Authorization**: Bearer Token (Permission: `view_medical_record`)

**Example Request**:
```bash
GET /api/medical-records/68f1234567890abcdef12345
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "68f1234567890abcdef12345",
    "patientId": {...},
    "appointmentId": {...},
    "priority": "Normal",
    "typeMedical": "Blood Test",
    "description": "Annual checkup blood test",
    "document": [...],
    "actions": [
      {
        "_id": "68f123...",
        "type": "analysis",
        "description": "Blood sample sent to lab",
        "document": "uploads/medical-records/medical-...",
        "createdAt": "2025-10-17T11:00:00.000Z"
      }
    ],
    "resultDate": "2025-10-17T10:30:00.000Z"
  }
}
```

---

### 5. UPDATE Medical Record
**PUT** `/api/medical-records/:id`

Update an existing medical record. Can add new documents.

**Authorization**: Bearer Token (Permission: `update_medical_record`)

**Content-Type**: `multipart/form-data`

**Body Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| priority | string | No | Update priority |
| typeMedical | string | No | Update medical type |
| description | string | No | Update description |
| resultDate | date | No | Update result date |
| documents | file[] | No | Add new documents (appends to existing) |

**Example Request**:
```bash
PUT /api/medical-records/68f1234567890abcdef12345
Authorization: Bearer <token>
Content-Type: multipart/form-data

priority: Urgent
description: Updated with new findings
documents: [new-scan.pdf]
```

**Response** (200):
```json
{
  "success": true,
  "message": "Medical record updated successfully",
  "data": {...}
}
```

---

### 6. DELETE Medical Record
**DELETE** `/api/medical-records/:id`

Delete a medical record.

**Authorization**: Bearer Token (Permission: `update_medical_record`)

**Example Request**:
```bash
DELETE /api/medical-records/68f1234567890abcdef12345
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Medical record deleted successfully",
  "data": null
}
```

---

### 7. ADD Action to Medical Record
**POST** `/api/medical-records/:id/action`

Add an action (treatment, scanner, analysis) to a medical record.

**Authorization**: Bearer Token (Permission: `update_medical_record`)

**Content-Type**: `multipart/form-data`

**Body Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | treatment, scanner, or analysis |
| description | string | Yes | Action description |
| document | file | No | Single document for this action |

**Example Request**:
```bash
POST /api/medical-records/68f1234567890abcdef12345/action
Authorization: Bearer <token>
Content-Type: multipart/form-data

type: scanner
description: CT Scan performed
document: [ct-scan-results.pdf]
```

**Response** (200):
```json
{
  "success": true,
  "message": "Action added successfully",
  "data": {
    "_id": "68f1234567890abcdef12345",
    "actions": [
      {
        "_id": "68f987...",
        "type": "scanner",
        "description": "CT Scan performed",
        "document": "uploads/medical-records/medical-...",
        "createdAt": "2025-10-17T14:00:00.000Z"
      }
    ],
    ...
  }
}
```

---

### 8. SEARCH Medical Records
**GET** `/api/medical-records/search`

Search medical records by patient name, medical type, or description.

**Authorization**: Bearer Token (Permission: `view_medical_record`)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (min 2 characters) |
| page | number | No | Page number |
| limit | number | No | Items per page |
| priority | string | No | Filter by priority |
| typeMedical | string | No | Filter by type |
| from | date | No | Start date |
| to | date | No | End date |
| sort | string | No | Sort field |
| order | string | No | asc or desc |

**Example Request**:
```bash
GET /api/medical-records/search?q=blood&priority=Urgent
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "query": "blood",
  "page": 1,
  "limit": 20,
  "total": 5,
  "totalPages": 1,
  "data": [...]
}
```

---

## File Upload Specifications

### Accepted File Types
- Documents: PDF, DOC, DOCX
- Images: JPG, JPEG, PNG
- Medical: DICOM, DCM

### Limits
- **Max file size**: 20MB per file
- **Max files per request**: 10 files (for create/update)
- **Max file for action**: 1 file

### Storage Location
```
uploads/medical-records/medical-{timestamp}-{random}.{ext}
```

---

## Model Schema

```javascript
{
  patientId: ObjectId (ref: User),
  appointmentId: ObjectId (ref: Appointment),
  priority: String (enum: ["Normal", "À suivre", "Traitement nécessaire", "Urgent"]),
  typeMedical: String,
  description: String,
  document: [String], // Array of file paths
  actions: [
    {
      type: String (enum: ["treatment", "scanner", "analysis"]),
      description: String,
      document: String,
      createdAt: Date
    }
  ],
  resultDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "INVALID_SEARCH",
  "message": "Search query must be at least 2 characters"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Medical record not found"
}
```

### 404 Appointment Not Found
```json
{
  "success": false,
  "error": "APPOINTMENT_NOT_FOUND",
  "message": "Appointment not found"
}
```

### 400 Invalid File Type
```json
{
  "success": false,
  "error": "INVALID_FILE_TYPE",
  "message": "Only PDF, DOC, DOCX, DICOM, and image files are allowed!"
}
```

---

## Permission Requirements

| Endpoint | Required Permission |
|----------|---------------------|
| Create | `create_medical_record` |
| Read (All, Patient, By ID) | `view_medical_record` |
| Update | `update_medical_record` |
| Delete | `update_medical_record` |
| Add Action | `update_medical_record` |
| Search | `view_medical_record` |

---

## Usage Examples

### Create with Documents
```bash
curl -X POST http://localhost:3000/api/medical-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "patientId=68f0e7ca8e911b88da31770f" \
  -F "appointmentId=68f0e8bff5a469392e0343bc" \
  -F "priority=Normal" \
  -F "typeMedical=Blood Test" \
  -F "description=Annual checkup" \
  -F "documents=@/path/to/file1.pdf" \
  -F "documents=@/path/to/file2.jpg"
```

### Get Patient Records
```bash
curl -X GET "http://localhost:3000/api/medical-records/patient/68f0e7ca8e911b88da31770f?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Action
```bash
curl -X POST http://localhost:3000/api/medical-records/68f1234567890abcdef12345/action \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "type=scanner" \
  -F "description=CT Scan performed" \
  -F "document=@/path/to/scan.pdf"
```

### Search Records
```bash
curl -X GET "http://localhost:3000/api/medical-records/search?q=blood&priority=Urgent" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
