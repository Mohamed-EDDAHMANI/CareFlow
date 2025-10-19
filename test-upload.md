# 🧪 Test File Upload for Appointments

## 1️⃣ Check Upload Directory

First, verify the directory exists:

```powershell
# Check if directory exists
Test-Path uploads\appointments

# If not exists, create it
New-Item -ItemType Directory -Force -Path uploads\appointments

# List files
Get-ChildItem uploads\appointments
```

---

## 2️⃣ Test with Postman

### Request Setup:

**Method:** `POST`  
**URL:** `http://localhost:3000/api/appointments/create/{PATIENT_ID}`  
**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:** `form-data` (NOT raw JSON)

| Key | Type | Value |
|-----|------|-------|
| `reason` | Text | `Consultation générale` |
| `type` | Text | `consultation générale` |
| `weekOffset` | Text | `0` |
| `documents` | File | Select a PDF/image file |
| `documents` | File | (Optional) Select another file |

### Important Notes:
- ✅ Use `form-data` not `x-www-form-urlencoded`
- ✅ Field name MUST be `documents` (plural)
- ✅ You can add multiple files with same key name
- ✅ Max 5 files, 10MB each

---

## 3️⃣ Test with cURL

### Single File:
```powershell
curl -X POST "http://localhost:3000/api/appointments/create/PATIENT_ID_HERE" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "reason=Test appointment" `
  -F "type=consultation générale" `
  -F "weekOffset=0" `
  -F "documents=@C:\path\to\test.pdf"
```

### Multiple Files:
```powershell
curl -X POST "http://localhost:3000/api/appointments/create/PATIENT_ID_HERE" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "reason=Test with multiple files" `
  -F "type=consultation générale" `
  -F "documents=@C:\path\to\file1.pdf" `
  -F "documents=@C:\path\to\file2.jpg" `
  -F "documents=@C:\path\to\file3.docx"
```

---

## 4️⃣ Expected Server Logs

When upload works correctly, you should see:

```
🌐 POST /api/appointments/create/68f0e7ca8e911b88da31770f
   📎 Files: 2
✅ File accepted: report.pdf
✅ File accepted: xray.jpg
✅ 2 file(s) uploaded successfully to uploads/appointments
   📄 appointment-1729340123456-123456789.pdf → uploads/appointments/appointment-1729340123456-123456789.pdf (245.67 KB)
   📄 appointment-1729340123456-987654321.jpg → uploads/appointments/appointment-1729340123456-987654321.jpg (1024.32 KB)
📋 Create appointment request:
   Patient ID: 68f0e7ca8e911b88da31770f
   Reason: Test appointment
   Type: consultation générale
   Files received: 2
   📎 Processing file: appointment-1729340123456-123456789.pdf → uploads/appointments/appointment-1729340123456-123456789.pdf
   📎 Processing file: appointment-1729340123456-987654321.jpg → uploads/appointments/appointment-1729340123456-987654321.jpg
   Total document paths: 2
✅ MongoDB replica set detected - using transactions
✅ Appointment created successfully: 68f123... for doctor 68f456... at Sat Oct 19 2025 09:00:00
```

---

## 5️⃣ Expected Response

```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "68f0e7ca8e911b88da31770f",
    "patientId": "68f0e7ca8e911b88da31770a",
    "doctorId": "68f0e7ca8e911b88da31770b",
    "start": "2025-10-20T09:00:00.000Z",
    "end": "2025-10-20T10:00:00.000Z",
    "reason": "Test appointment",
    "type": "consultation générale",
    "status": "scheduled",
    "document": [
      "uploads/appointments/appointment-1729340123456-123456789.pdf",
      "uploads/appointments/appointment-1729340123456-987654321.jpg"
    ],
    "createdBy": "68f0e7ca8e911b88da31770c",
    "createdAt": "2025-10-19T12:00:00.000Z",
    "updatedAt": "2025-10-19T12:00:00.000Z"
  },
  "slot": {
    "doctorId": "68f0e7ca8e911b88da31770b",
    "start": "2025-10-20T09:00:00.000Z"
  }
}
```

---

## 6️⃣ Verify Files Were Saved

```powershell
# List all uploaded files
Get-ChildItem uploads\appointments\ | Format-Table Name, Length, LastWriteTime

# Count files
(Get-ChildItem uploads\appointments\).Count

# View specific file
Get-Item "uploads\appointments\appointment-*.pdf"
```

---

## 7️⃣ Access Files via Browser

Once uploaded, files are accessible at:

```
http://localhost:3000/uploads/appointments/appointment-1729340123456-123456789.pdf
```

Test this in your browser to verify the static file serving works.

---

## 🔧 Troubleshooting

### Problem: No files received
**Logs show:** `Files received: 0`

**Solutions:**
1. ✅ Check field name is `documents` (plural)
2. ✅ Use `form-data` not `x-www-form-urlencoded`
3. ✅ Don't use `Content-Type: application/json` header

---

### Problem: "Field name must be 'documents'"
**Error:** `LIMIT_UNEXPECTED_FILE`

**Solution:**
- Change field name from `document` to `documents`

---

### Problem: File not found in uploads folder
**Logs show:** File uploaded but not in directory

**Solutions:**
```powershell
# Check current directory
Get-Location

# Navigate to project root
cd C:\Users\Mohamed\Desktop\CareFlow

# Check if directory exists
Test-Path uploads\appointments

# Check write permissions
icacls uploads\appointments
```

---

### Problem: "File too large"
**Error:** `FILE_TOO_LARGE`

**Solution:**
- Files must be under 10MB each
- Compress large files or reduce image quality

---

### Problem: "Only PDF, DOC, DOCX, and image files allowed"
**Error:** `UPLOAD_ERROR`

**Solution:**
- Allowed extensions: `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png`
- Rename file with correct extension

---

## 8️⃣ Database Verification

Check if file paths are saved in database:

```javascript
// In MongoDB Compass or CLI
db.appointments.findOne({ "document.0": { $exists: true } })

// Should show:
{
  "_id": ObjectId("..."),
  "document": [
    "uploads/appointments/appointment-1729340123456-123456789.pdf",
    "uploads/appointments/appointment-1729340123456-987654321.jpg"
  ],
  // ... other fields
}
```

---

## 9️⃣ Complete Test Checklist

- [ ] Upload directory exists (`uploads/appointments/`)
- [ ] Server is running (check `http://localhost:3000/health`)
- [ ] Using `form-data` in Postman/curl
- [ ] Field name is `documents` (plural)
- [ ] Authorization token is valid
- [ ] Patient ID exists in database
- [ ] File is under 10MB
- [ ] File extension is allowed
- [ ] Server logs show file processing
- [ ] File appears in `uploads/appointments/`
- [ ] File accessible via browser URL
- [ ] Database has correct file paths

---

## 🎯 Quick Test Command

```powershell
# Create a test file
"Test content" | Out-File -FilePath "test.txt"

# Rename to PDF (fake but works for testing)
Rename-Item "test.txt" "test.pdf"

# Upload it
curl -X POST "http://localhost:3000/api/appointments/create/YOUR_PATIENT_ID" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "reason=Test upload" `
  -F "type=consultation générale" `
  -F "documents=@test.pdf"

# Check if it was saved
Get-ChildItem uploads\appointments\appointment-*.pdf | Select-Object -Last 1
```

---

## ✅ Success Indicators

1. **Server logs show:**
   - ✅ File accepted
   - ✅ Files uploaded successfully
   - ✅ Processing file paths
   - ✅ Appointment created

2. **Files exist:**
   - ✅ Physical files in `uploads/appointments/`
   - ✅ Correct naming: `appointment-[timestamp]-[random].[ext]`

3. **Database contains:**
   - ✅ `document` array with file paths
   - ✅ Paths are relative: `uploads/appointments/...`

4. **HTTP response includes:**
   - ✅ `success: true`
   - ✅ `document` array with paths
   - ✅ Appointment ID

---

## 📝 Notes

- Files are **optional** - appointments work without uploads
- Maximum **5 files** per appointment
- Each file max **10MB**
- Files stored with unique names to prevent conflicts
- Original filenames are **not preserved** for security
- Static file serving allows direct browser access
