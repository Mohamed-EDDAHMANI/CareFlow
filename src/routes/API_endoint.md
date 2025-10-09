# 🔗 CareFlow API Endpoints Documentation

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Authentication Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "birthDate": "1990-01-01",
  "roleId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "cin": "AB123456"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

---

## 👥 User Management Endpoints

### Get All Users (with pagination, search, sort)
```http
GET /api/users?page=1&limit=10&search=john&sort=createdAt&order=desc
```

### Get User Profile (own profile)
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

### Get User by ID
```http
GET /api/users/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Create New User (Admin/Receptionist only)
```http
POST /api/users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Patient Name",
  "email": "patient@example.com",
  "password": "password123",
  "birthDate": "1985-05-15",
  "roleId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "cin": "CD789012"
}
```

### Update User
```http
PUT /api/users/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "birthDate": "1985-05-20"
}
```

### Suspend User (Admin only)
```http
PUT /api/users/64f1a2b3c4d5e6f7g8h9i0j1/suspend
Authorization: Bearer <access_token>
```

### Activate User (Admin only)
```http
PUT /api/users/64f1a2b3c4d5e6f7g8h9i0j1/activate
Authorization: Bearer <access_token>
```

### Delete User (Admin only)
```http
DELETE /api/users/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Search Users
```http
GET /api/users/search?q=doctor&role=practitioner&status=active
Authorization: Bearer <access_token>
```

---

## 🛡️ Role & Permissions Endpoints

### Get All Roles
```http
GET /api/roles
Authorization: Bearer <access_token>
```

### Get Role by ID
```http
GET /api/roles/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Create New Role (Admin only)
```http
POST /api/roles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "practitioner",
  "description": "Medical practitioner with patient care permissions"
}
```

### Update Role (Admin only)
```http
PUT /api/roles/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "description": "Updated role description"
}
```

### Delete Role (Admin only)
```http
DELETE /api/roles/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Get Role Permissions
```http
GET /api/roles/permissions
Authorization: Bearer <access_token>
```

### Update Role Permissions (Admin only)
```http
PUT /api/roles/64f1a2b3c4d5e6f7g8h9i0j1/permissions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "permissions": {
    "view_appointment": true,
    "create_medical_record": true,
    "update_medical_record": true
  }
}
```

---

## 📅 Appointment Management Endpoints

### Get All Appointments (with pagination, search, sort)
```http
GET /api/appointments?page=1&limit=10&search=patient_name&practitioner=64f1a2b3c4d5e6f7g8h9i0j1&status=scheduled&date_from=2025-01-01&date_to=2025-01-31&sort=start&order=asc
Authorization: Bearer <access_token>
```

### Get Appointment by ID
```http
GET /api/appointments/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Create New Appointment
```http
POST /api/appointments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "patientId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "practitionerId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "type": "consultation générale",
  "start": "2025-01-15T09:00:00.000Z",
  "end": "2025-01-15T09:30:00.000Z",
  "reason": "Routine checkup"
}
```

### Update Appointment
```http
PUT /api/appointments/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "start": "2025-01-15T10:00:00.000Z",
  "end": "2025-01-15T10:30:00.000Z",
  "reason": "Updated reason"
}
```

### Mark Appointment as Completed (Practitioner only)
```http
PUT /api/appointments/64f1a2b3c4d5e6f7g8h9i0j1/complete
Authorization: Bearer <access_token>
```

### Cancel Appointment
```http
PUT /api/appointments/64f1a2b3c4d5e6f7g8h9i0j1/cancel
Authorization: Bearer <access_token>
```

### Delete Appointment (Admin only)
```http
DELETE /api/appointments/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Get Today's Appointments
```http
GET /api/appointments/today
Authorization: Bearer <access_token>
```

### Get Practitioner Availability
```http
GET /api/appointments/practitioner/64f1a2b3c4d5e6f7g8h9i0j1/availability?date=2025-01-15
Authorization: Bearer <access_token>
```

---

## 🏥 Medical Records Endpoints

### Get All Medical Records (with pagination, search, sort)
```http
GET /api/medical-records?page=1&limit=10&patient=64f1a2b3c4d5e6f7g8h9i0j1&priority=Urgent&sort=resultDate&order=desc
Authorization: Bearer <access_token>
```

### Get Medical Record by ID
```http
GET /api/medical-records/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Create New Medical Record (Practitioner only)
```http
POST /api/medical-records
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "patientId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "appointmentId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "priority": "Normal",
  "typeMedical": "consultation",
  "description": "Patient shows good health indicators",
  "document": "/uploads/medical-report-123.pdf"
}
```

### Update Medical Record (Practitioner only)
```http
PUT /api/medical-records/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "priority": "À suivre",
  "description": "Updated medical assessment"
}
```

### Add Action to Medical Record (Practitioner only)
```http
POST /api/medical-records/64f1a2b3c4d5e6f7g8h9i0j1/actions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "treatment",
  "description": "Prescribed medication for hypertension",
  "document": "/uploads/prescription-456.pdf"
}
```

### Get Patient's Medical Records Summary
```http
GET /api/medical-records/patient/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Get Medical Records by Priority
```http
GET /api/medical-records/priority/Urgent
Authorization: Bearer <access_token>
```

### Delete Medical Record (Admin only)
```http
DELETE /api/medical-records/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

---

## 🔔 Notification Management Endpoints

### Get All Notifications (with pagination, sort)
```http
GET /api/notifications?page=1&limit=10&sort=createdAt&order=desc&status=unread
Authorization: Bearer <access_token>
```

### Get Notification by ID
```http
GET /api/notifications/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Create New Notification (Admin/System only)
```http
POST /api/notifications
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "title": "Appointment Reminder",
  "type": "email",
  "message": "You have an appointment tomorrow at 9:00 AM",
  "relatedAppointmentId": "64f1a2b3c4d5e6f7g8h9i0j2"
}
```

### Update Notification
```http
PUT /api/notifications/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Updated notification message"
}
```

### Mark Notification as Read
```http
PUT /api/notifications/64f1a2b3c4d5e6f7g8h9i0j1/read
Authorization: Bearer <access_token>
```

### Mark All Notifications as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <access_token>
```

### Get Unread Notifications
```http
GET /api/notifications/unread
Authorization: Bearer <access_token>
```

### Delete Notification
```http
DELETE /api/notifications/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

---

## ⚙️ System Configuration Endpoints

### Working Hours Management

#### Get All Working Hours
```http
GET /api/system/working-hours
Authorization: Bearer <access_token>
```

#### Create Working Hours (Admin only)
```http
POST /api/system/working-hours
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "day": "Lundi",
  "start": "08:00",
  "end": "17:00",
  "active": true
}
```

#### Update Working Hours (Admin only)
```http
PUT /api/system/working-hours/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "start": "09:00",
  "end": "18:00"
}
```

#### Delete Working Hours (Admin only)
```http
DELETE /api/system/working-hours/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Holiday Management

#### Get All Holidays
```http
GET /api/system/holidays
Authorization: Bearer <access_token>
```

#### Create Holiday (Admin only)
```http
POST /api/system/holidays
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "date": "2025-07-04",
  "name": "Independence Day",
  "active": true
}
```

#### Update Holiday (Admin only)
```http
PUT /api/system/holidays/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Holiday Name",
  "active": false
}
```

#### Delete Holiday (Admin only)
```http
DELETE /api/system/holidays/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

---

## 🔍 Search & Utility Endpoints

### Global Search
```http
GET /api/search?q=john&models=users,appointments&page=1&limit=10
Authorization: Bearer <access_token>
```

### Advanced Filtering
```http
GET /api/filter?model=appointments&date_from=2025-01-01&date_to=2025-01-31&status=scheduled&practitioner=64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <access_token>
```

### Dashboard Statistics
```http
GET /api/stats
Authorization: Bearer <access_token>
```

---

## 🏥 Health Check Endpoints

### Server Health Check
```http
GET /health
```

### Root Endpoint
```http
GET /
```

---

## 📊 Query Parameters Reference

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Sorting
- `sort`: Field to sort by (createdAt, name, start, etc.)
- `order`: Sort order (asc, desc)

### Filtering
- `search`: Search term for text fields
- `status`: Filter by status (active, suspended, scheduled, completed, etc.)
- `date_from`: Start date for date range filtering
- `date_to`: End date for date range filtering
- `priority`: Filter by priority (Normal, À suivre, Traitement nécessaire, Urgent)
- `type`: Filter by type (consultation générale, suivi, email, whatsapp)

---

## 🔐 Role-Based Access Control

### Admin
- Full access to all endpoints
- Can create, read, update, delete any resource
- Can manage system settings and user permissions

### Practitioner
- Can view and update appointments assigned to them
- Can create and manage medical records
- Can view patient information related to their appointments

### Receptionist
- Can create and manage appointments
- Can create patient accounts
- Cannot access medical records

### Patient
- Can view own profile and appointments
- Can view own medical records
- Cannot access other users' data

---

## 📝 Error Response Format

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## ✅ Success Response Format

All endpoints return success responses in this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

---

## 🚀 Usage Examples

### Complete User Registration Flow
1. Admin creates role: `POST /api/roles`
2. Admin creates user: `POST /api/users`
3. User logs in: `POST /api/auth/login`
4. User accesses protected resources with Bearer token

### Complete Appointment Flow
1. Receptionist checks practitioner availability: `GET /api/appointments/practitioner/{id}/availability`
2. Receptionist creates appointment: `POST /api/appointments`
3. System sends notification: `POST /api/notifications`
4. Practitioner completes appointment: `PUT /api/appointments/{id}/complete`
5. Practitioner creates medical record: `POST /api/medical-records`

### Complete Medical Record Flow
1. Practitioner creates medical record: `POST /api/medical-records`
2. Practitioner adds treatment action: `POST /api/medical-records/{id}/actions`
3. Patient views their medical records: `GET /api/medical-records/patient/{id}`