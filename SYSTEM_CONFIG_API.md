# System Configuration API Documentation

Manage system configuration including holidays and working hours for the medical appointment system.

## Base URL
```
/api/system
```

---

## 🔐 Permissions Required

All modification endpoints (POST, PUT, PATCH, DELETE) require the **`manage_system`** permission.

| Permission | Description | Required For |
|------------|-------------|--------------|
| `manage_system` | Manage system configuration | Create, Update, Delete holidays and working hours |
| None (authenticated) | View system configuration | Get holidays and working hours |

---

# 🎉 Holiday Management

## 1. Get All Holidays

**GET** `/api/system/holidays`

Get all holidays with optional filters.

**Authorization**: Bearer Token (any authenticated user)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| active | boolean | Filter by active status (true/false) |
| year | number | Filter by year (e.g., 2025) |
| month | number | Filter by month (1-12, requires year) |

**Example Requests**:
```bash
# Get all holidays
GET /api/system/holidays

# Get active holidays only
GET /api/system/holidays?active=true

# Get holidays for 2025
GET /api/system/holidays?year=2025

# Get holidays for January 2025
GET /api/system/holidays?year=2025&month=1
```

**Success Response (200)**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "68f123...",
      "name": "New Year's Day",
      "date": "2025-01-01T00:00:00.000Z",
      "description": "Start of the year",
      "active": true,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    },
    {
      "_id": "68f456...",
      "name": "Labor Day",
      "date": "2025-05-01T00:00:00.000Z",
      "description": "International Workers' Day",
      "active": true,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

---

## 2. Get Holiday by ID

**GET** `/api/system/holidays/:id`

Get a single holiday by ID.

**Authorization**: Bearer Token

**Example Request**:
```bash
GET /api/system/holidays/68f123...
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "68f123...",
    "name": "New Year's Day",
    "date": "2025-01-01T00:00:00.000Z",
    "description": "Start of the year",
    "active": true,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

## 3. Create Holiday

**POST** `/api/system/holidays`

Create a new holiday.

**Authorization**: Bearer Token (requires: `manage_system` permission)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Holiday name (min 3, max 100 chars) |
| date | date | Yes | Holiday date (ISO format) |
| description | string | No | Holiday description |
| active | boolean | No | Active status (default: true) |

**Example Request**:
```bash
POST /api/system/holidays
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Independence Day",
  "date": "2025-07-04",
  "description": "National Independence Day",
  "active": true
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Holiday created successfully",
  "data": {
    "_id": "68f789...",
    "name": "Independence Day",
    "date": "2025-07-04T00:00:00.000Z",
    "description": "National Independence Day",
    "active": true,
    "createdAt": "2024-10-19T12:00:00.000Z",
    "updatedAt": "2024-10-19T12:00:00.000Z"
  }
}
```

**Error Response (400)** - Duplicate Holiday:
```json
{
  "success": false,
  "error": "DUPLICATE_HOLIDAY",
  "message": "A holiday already exists on Thu Jul 04 2025: Independence Day"
}
```

---

## 4. Update Holiday

**PUT** `/api/system/holidays/:id`

Update an existing holiday.

**Authorization**: Bearer Token (requires: `manage_system` permission)

**Request Body**:
All fields are optional. Only include fields you want to update.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Holiday name |
| date | date | Holiday date |
| description | string | Holiday description |
| active | boolean | Active status |

**Example Request**:
```bash
PUT /api/system/holidays/68f789...
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Independence Day (Updated)",
  "description": "Updated description",
  "active": true
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Holiday updated successfully",
  "data": {
    "_id": "68f789...",
    "name": "Independence Day (Updated)",
    "date": "2025-07-04T00:00:00.000Z",
    "description": "Updated description",
    "active": true,
    "updatedAt": "2024-10-19T13:00:00.000Z"
  }
}
```

---

## 5. Toggle Holiday Status

**PATCH** `/api/system/holidays/:id/toggle`

Toggle holiday active/inactive status.

**Authorization**: Bearer Token (requires: `manage_system` permission)

**Example Request**:
```bash
PATCH /api/system/holidays/68f789.../toggle
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Holiday deactivated successfully",
  "data": {
    "_id": "68f789...",
    "name": "Independence Day",
    "date": "2025-07-04T00:00:00.000Z",
    "active": false,
    "updatedAt": "2024-10-19T14:00:00.000Z"
  }
}
```

---

## 6. Delete Holiday

**DELETE** `/api/system/holidays/:id`

Delete a holiday permanently.

**Authorization**: Bearer Token (requires: `manage_system` permission)

**Example Request**:
```bash
DELETE /api/system/holidays/68f789...
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Holiday deleted successfully",
  "data": null
}
```

---

# ⏰ Working Hours Management

## 1. Get All Working Hours

**GET** `/api/system/working-hours`

Get all working hours with optional filters.

**Authorization**: Bearer Token (any authenticated user)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| active | boolean | Filter by active status |
| day | string | Filter by day (lundi, mardi, etc.) |

**Example Requests**:
```bash
# Get all working hours
GET /api/system/working-hours

# Get active working hours only
GET /api/system/working-hours?active=true

# Get working hours for Monday
GET /api/system/working-hours?day=lundi
```

**Success Response (200)**:
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "68f111...",
      "day": "lundi",
      "start": "08:00",
      "end": "18:00",
      "active": true,
      "createdAt": "2024-10-01T10:00:00.000Z",
      "updatedAt": "2024-10-01T10:00:00.000Z"
    },
    {
      "_id": "68f222...",
      "day": "mardi",
      "start": "08:00",
      "end": "18:00",
      "active": true
    }
  ]
}
```

---

## 2. Get Working Hour by ID

**GET** `/api/system/working-hours/:id`

Get a single working hour entry by ID.

**Authorization**: Bearer Token

**Example Request**:
```bash
GET /api/system/working-hours/68f111...
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "68f111...",
    "day": "lundi",
    "start": "08:00",
    "end": "18:00",
    "active": true,
    "createdAt": "2024-10-01T10:00:00.000Z",
    "updatedAt": "2024-10-01T10:00:00.000Z"
  }
}
```

---

## 3. Create Working Hours

**POST** `/api/system/working-hours`

Create working hours for a specific day.

**Authorization**: Bearer Token (requires: `manage_system` permission)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| day | string | Yes | Day of week (lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche) |
| start | string | Yes | Start time in HH:MM format (24-hour) |
| end | string | Yes | End time in HH:MM format (24-hour) |
| active | boolean | No | Active status (default: true) |

**Example Request**:
```bash
POST /api/system/working-hours
Authorization: Bearer <token>
Content-Type: application/json

{
  "day": "lundi",
  "start": "08:00",
  "end": "18:00",
  "active": true
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Working hours created successfully",
  "data": {
    "_id": "68f111...",
    "day": "lundi",
    "start": "08:00",
    "end": "18:00",
    "active": true,
    "createdAt": "2024-10-19T12:00:00.000Z",
    "updatedAt": "2024-10-19T12:00:00.000Z"
  }
}
```

**Error Responses**:

**400** - Invalid Day:
```json
{
  "success": false,
  "error": "INVALID_DAY",
  "message": "Invalid day. Must be one of: lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche"
}
```

**400** - Invalid Time Format:
```json
{
  "success": false,
  "error": "INVALID_TIME_FORMAT",
  "message": "Invalid time format. Use HH:MM (24-hour format)"
}
```

**400** - Duplicate:
```json
{
  "success": false,
  "error": "DUPLICATE_WORKING_HOUR",
  "message": "Working hours already exist for lundi. Use update instead."
}
```

---

## 4. Update Working Hours

**PUT** `/api/system/working-hours/:id`

Update existing working hours.

**Authorization**: Bearer Token (requires: `manage_system` permission)

**Request Body**:
All fields are optional. Only include fields you want to update.

| Field | Type | Description |
|-------|------|-------------|
| day | string | Day of week |
| start | string | Start time (HH:MM) |
| end | string | End time (HH:MM) |
| active | boolean | Active status |

**Example Request**:
```bash
PUT /api/system/working-hours/68f111...
Authorization: Bearer <token>
Content-Type: application/json

{
  "start": "09:00",
  "end": "17:00"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Working hours updated successfully",
  "data": {
    "_id": "68f111...",
    "day": "lundi",
    "start": "09:00",
    "end": "17:00",
    "active": true,
    "updatedAt": "2024-10-19T13:00:00.000Z"
  }
}
```

---

## 5. Toggle Working Hour Status

**PATCH** `/api/system/working-hours/:id/toggle`

Toggle working hour active/inactive status.

**Authorization**: Bearer Token (requires: `manage_system` permission)

**Example Request**:
```bash
PATCH /api/system/working-hours/68f111.../toggle
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Working hours deactivated successfully",
  "data": {
    "_id": "68f111...",
    "day": "lundi",
    "start": "09:00",
    "end": "17:00",
    "active": false,
    "updatedAt": "2024-10-19T14:00:00.000Z"
  }
}
```

---

## 6. Delete Working Hours

**DELETE** `/api/system/working-hours/:id`

Delete working hours permanently.

**Authorization**: Bearer Token (requires: `manage_system` permission)

**Example Request**:
```bash
DELETE /api/system/working-hours/68f111...
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Working hours deleted successfully",
  "data": null
}
```

---

## 📋 Common Error Responses

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Please authenticate"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "You don't have permission to perform this action"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Holiday not found"
}
```

---

## 🧪 Testing Examples

### Setup Working Hours for Full Week
```bash
# Monday to Friday: 8:00 - 18:00
for day in lundi mardi mercredi jeudi vendredi; do
  curl -X POST http://localhost:3000/api/system/working-hours \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"day\":\"$day\",\"start\":\"08:00\",\"end\":\"18:00\"}"
done

# Saturday: 8:00 - 14:00
curl -X POST http://localhost:3000/api/system/working-hours \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"day":"samedi","start":"08:00","end":"14:00"}'
```

### Add National Holidays
```bash
# New Year
curl -X POST http://localhost:3000/api/system/holidays \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Year","date":"2025-01-01","description":"Start of the year"}'

# Labor Day
curl -X POST http://localhost:3000/api/system/holidays \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Labor Day","date":"2025-05-01","description":"International Workers Day"}'
```

---

## 🎯 Use Cases

### 1. **Setup New Clinic Schedule**
- Create working hours for each operational day
- Set appropriate start/end times
- Mark weekends as inactive if needed

### 2. **Manage Public Holidays**
- Add all national holidays at start of year
- System automatically prevents appointment booking on these days
- Update or deactivate holidays as needed

### 3. **Adjust Operating Hours**
- Update start/end times for specific days
- Temporarily close a day by toggling active status
- Useful for special circumstances or seasonal changes

### 4. **Holiday Calendar Maintenance**
- View upcoming holidays filtered by year/month
- Toggle holiday status without deleting
- Keep historical holiday data for records

---

## 💡 Best Practices

### For Working Hours:
1. ✅ **Create hours for all operational days** - Ensures proper scheduling
2. ✅ **Use 24-hour format** - Prevents AM/PM confusion
3. ✅ **Set realistic time slots** - Consider lunch breaks, doctor availability
4. ✅ **Toggle instead of delete** - Preserve data, can reactivate later

### For Holidays:
1. ✅ **Plan ahead** - Add holidays at start of year
2. ✅ **Include descriptions** - Helps staff understand the holiday
3. ✅ **Review annually** - Update holiday calendar each year
4. ✅ **Use toggle for temporary changes** - Don't delete, just deactivate

### Permission Management:
1. ✅ **Restrict `manage_system` permission** - Only give to admins
2. ✅ **Audit changes** - Monitor who makes system configuration changes
3. ✅ **Test in staging** - Verify changes before applying to production

---

## 🔍 Integration Notes

### Impact on Appointments:
- Working hours define when appointments can be scheduled
- Holidays automatically block appointment booking
- Inactive working hours/holidays are ignored by scheduling system
- Changes take effect immediately for new appointments

### Console Logging:
All system configuration changes are logged:
```
✅ Holiday created: Independence Day on Thu Jul 04 2025
✅ Working hours created for lundi: 08:00 - 18:00
✅ Holiday deactivated: New Year
```

---

## 📊 Response Structure

All endpoints follow consistent response structure:

**Success**:
```json
{
  "success": true,
  "message": "...",
  "data": {...} or [...],
  "count": 10  // For list endpoints
}
```

**Error**:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```
