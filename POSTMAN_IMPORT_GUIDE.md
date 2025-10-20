# 📮 CareFlow API - Postman Collection Import Guide

## 📋 Overview

This guide will help you import and use the CareFlow API collection in Postman to test all API endpoints.

## 🚀 Quick Start

### Step 1: Import the Collection

1. **Open Postman** (download from https://www.postman.com/downloads/ if you don't have it)

2. **Import the Collection File**
   - Click on **Import** button (top left corner)
   - Click **Upload Files**
   - Select `CareFlow_API_Collection.postman_collection.json`
   - Click **Import**

### Step 2: Configure Environment Variables

The collection uses the following variables that auto-update during requests:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:3000/api` |
| `accessToken` | JWT access token | Auto-set after login |
| `refreshToken` | JWT refresh token | Auto-set after login |
| `userId` | Current user ID | Auto-set after login/register |
| `patientId` | Patient ID for testing | Auto-set |
| `doctorId` | Doctor ID for testing | Manual/Auto-set |
| `appointmentId` | Appointment ID | Auto-set after creation |
| `medicalRecordId` | Medical record ID | Auto-set after creation |
| `roleId` | Role ID for permissions | Manual set |

### Step 3: Update Base URL (if needed)

1. Click on the **CareFlow API Collection**
2. Go to the **Variables** tab
3. Update `baseUrl` if your server runs on a different port or host
   - Example: `http://localhost:5000/api`
   - Example: `https://your-domain.com/api`

## 🔐 Authentication Flow

### 1️⃣ Test Database Connection (Optional)
```
GET /api/auth/test-db
```
Verifies your database connection before starting.

### 2️⃣ Login or Register

**Option A: Login with Existing User**
```
POST /api/auth/login
Body:
{
  "email": "admin@careflow.com",
  "password": "admin123"
}
```

**Option B: Register New Patient**
```
POST /api/auth/register
Body:
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "birthDate": "1990-05-15",
  "cin": "AB123456"
}
```

✅ **After successful login/register**, the `accessToken` and `refreshToken` are automatically saved!

### 3️⃣ Use Protected Endpoints

All other endpoints automatically use the saved `accessToken` for authentication.

## 📁 Collection Structure

### 🔐 Authentication (5 requests)
- Test Database Connection
- Register New Patient
- Login
- Refresh Access Token
- Logout

### 👥 User Management (7 requests)
- Create User
- Get All Users
- Search Users
- Get Patient History
- Get User by ID
- Update User
- Delete User

### 🛡️ Permissions (1 request)
- Update Role Permissions

### 📅 Appointments (6 requests)
- Create Appointment (with file upload)
- Search Appointments
- Get All Appointments
- Get Doctor Appointments
- Get Appointment by ID
- Update Appointment Status

### 🏥 Medical Records (8 requests)
- Create Medical Record (with file upload)
- Search Medical Records
- Get All Medical Records
- Get Patient Medical Records
- Get Medical Record by ID
- Add Action to Medical Record (with file upload)
- Update Medical Record
- Delete Medical Record

### ⚙️ System Configuration (12 requests)
- **Holidays** (6 requests)
  - Get All Holidays
  - Get Holiday by ID
  - Create Holiday
  - Update Holiday
  - Toggle Holiday Status
  - Delete Holiday
  
- **Working Hours** (6 requests)
  - Get All Working Hours
  - Get Working Hour by ID
  - Create Working Hour
  - Update Working Hour
  - Toggle Working Hour Status
  - Delete Working Hour

## 🎯 Testing Workflow

### Recommended Order:

1. **Start Server**
   ```powershell
   npm run dev
   ```

2. **Test Connection**
   - Run: `Test Database Connection`

3. **Authenticate**
   - Run: `Login` (or `Register New Patient`)
   - ✅ Token is auto-saved

4. **Create Test Data**
   - Run: `Create User` (to create a doctor)
   - Run: `Create Appointment`
   - Run: `Create Medical Record`

5. **Test Search & Filters**
   - Run: `Search Users`
   - Run: `Search Appointments`
   - Run: `Search Medical Records`

6. **Test System Config**
   - Run: `Create Holiday`
   - Run: `Create Working Hour`

## 📝 Request Examples

### Example 1: Create Appointment with Documents

```
POST /api/appointments/create/{{patientId}}
Authorization: Bearer {{accessToken}}

Form Data:
- reason: "Regular checkup"
- type: "consultation générale"
- weekOffset: 0
- documents: [upload files]
```

### Example 2: Search Appointments

```
GET /api/appointments/search?q=checkup&page=1&limit=20&status=scheduled
Authorization: Bearer {{accessToken}}
```

### Example 3: Add Medical Record Action

```
POST /api/medical-records/{{medicalRecordId}}/action
Authorization: Bearer {{accessToken}}

Form Data:
- type: "treatment"
- description: "Prescribed medication for 7 days"
- document: [optional file]
```

## 🔄 Auto-Saved Variables

The collection includes **test scripts** that automatically save response data:

- ✅ Login/Register → saves `accessToken`, `refreshToken`, `userId`
- ✅ Create Appointment → saves `appointmentId`
- ✅ Create Medical Record → saves `medicalRecordId`
- ✅ Create User → saves `userId`

## 🛠️ Manual Variable Setup

Some variables need manual setup:

1. **Set Doctor ID**
   - Create a doctor user
   - Copy the `_id` from response
   - Set in collection variables: `doctorId`

2. **Set Role ID**
   - Get role from database or user response
   - Set in collection variables: `roleId`

## 📤 File Uploads

For endpoints that support file uploads:

1. Select the request (e.g., `Create Appointment`)
2. Go to **Body** tab → **form-data**
3. Enable the `documents` field
4. Click **Select Files** and choose your files
5. Supported formats:
   - **Appointments**: PDF, DOC, DOCX, images (max 5 files, 10MB each)
   - **Medical Records**: PDF, DOC, DOCX, images (max 10 files, 20MB each)

## 🔍 Query Parameters

Many endpoints support filtering and pagination:

**Common Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort field
- `order` - Sort order (asc/desc)
- `status` - Filter by status
- `from` - Start date filter
- `to` - End date filter
- `q` - Search query

**Enable/Disable Query Params:**
- In Postman, uncheck query params you don't need
- Or delete their values to use defaults

## 🎨 Postman Tips

### View Collection Variables
1. Click on **CareFlow API Collection**
2. Go to **Variables** tab
3. See current values in "Current Value" column

### Save Responses
1. Send a request
2. Click **Save Response**
3. Add example name
4. Useful for documentation

### Use Environments (Optional)
Create different environments for:
- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging.careflow.com/api`
- **Production**: `https://api.careflow.com/api`

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Your token expired or is missing
1. Run `Login` again
2. Or use `Refresh Access Token`

### Issue: 403 Forbidden
**Solution:** User lacks required permissions
- Check your role permissions
- Use admin account for testing

### Issue: 404 Not Found
**Solution:** 
- Check if server is running
- Verify `baseUrl` in variables
- Ensure endpoint path is correct

### Issue: 500 Internal Server Error
**Solution:**
- Check server console for errors
- Verify database connection
- Check request body format

## 📚 Additional Resources

- **API Documentation**: See route files in `src/routes/`
- **Request Types**: See `request_types.md`
- **Error Handling**: See `Express_custem_ErrorHandling.md`

## ✅ Checklist

Before using the collection:

- [ ] Server is running (`npm run dev`)
- [ ] Database is connected
- [ ] Collection is imported in Postman
- [ ] Base URL is correct
- [ ] You've logged in successfully
- [ ] Token is saved (check Variables tab)

## 🎉 You're Ready!

You now have a complete Postman collection with:
- ✅ 39 pre-configured requests
- ✅ Auto-saved authentication tokens
- ✅ Auto-saved entity IDs
- ✅ Organized folder structure
- ✅ Detailed descriptions for each endpoint

Happy testing! 🚀
