# 📋 CareFlow - Models Documentation

## 🏥 Overview
System dyal gestion clinic m3a 4 roles: **Admin**, **Practitioner**, **Receptionist**, **Patient**.

---

## 👤 User Model

### Fields
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  birthDate: Date,
  roleId: ObjectId (ref: "Role", required),
  status: "active" | "suspended" (default: "active"),
  refreshToken: String,
  permissions: {
    create_user: Boolean (default: false),
    delete_user: Boolean (default: false),
    update_user: Boolean (default: false),
    create_appointment: Boolean (default: false),
    update_appointment: Boolean (default: false),
    cancel_appointment: Boolean (default: false),
    view_appointment: Boolean (default: false),
    create_medical_record: Boolean (default: false),
    view_medical_record: Boolean (default: false),
    update_medical_record: Boolean (default: false),
    send_notification: Boolean (default: false),
    manage_system: Boolean (default: false)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Methods
- `matchPassword(enteredPassword)` - Compare password with hash
- `generateAccessToken()` - Create JWT access token (1h)
- `generateRefreshToken()` - Create JWT refresh token (7d)
- `updateField(field, value)` - Update single field (name, birthDate, password only)
- `updateFields(fieldsObj)` - Update multiple fields
- `isActive()` - Check if user status is active
- `suspend()` - Set status to suspended
- `activate()` - Set status to active

---

## 🛡️ Role Model

### Fields
```javascript
{
  _id: ObjectId,
  name: "admin" | "doctore" | "infermeri" | "accueil" | "patient" (required),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Methods
- `updateField(field, value)` - Update single field (name, description only)
- `updateFields(fieldsObj)` - Update multiple fields

### Note
⚠️ **Issue**: Role enum f roleModel.js ma-kaymatchi m3a system_roles_structure.md
- Current: `["admin", "doctore", "infermeri", "accueil", "patient"]`
- Should be: `["admin", "practitioner", "receptionist", "patient"]`

---

## 📅 Appointment Model

### Fields
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: "User", required),
  createdBy: ObjectId (ref: "User"),
  practitionerId: ObjectId (ref: "User", required),
  type: "consultation générale" | "suivi" (default: "consultation générale"),
  start: Date (required),
  end: Date (required),
  reason: String,
  document: [String], // Array of document paths
  status: "scheduled" | "completed" | "cancelled" (default: "scheduled"),
  createdAt: Date,
  updatedAt: Date
}
```

### Methods
- `markCompleted()` - Change status to "completed"
- `cancel()` - Change status to "cancelled"
- `isPast()` - Check if appointment end time is in the past
- `isToday()` - Check if appointment is today
- `getDuration()` - Get duration in minutes

### Missing Methods (Recommended)
```javascript
// Static methods for controllers
appointmentSchema.statics.hasConflict(practitionerId, start, end, excludeId)
appointmentSchema.statics.getPractitionerAvailability(practitionerId, date)
appointmentSchema.statics.getTodayAppointments(userId, userRole)
```

---

## 🏥 Medical Record Model

### Fields
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: "User", required),
  appointmentId: ObjectId (ref: "Appointment", required),
  priority: "Normal" | "À suivre" | "Traitement nécessaire" | "Urgent" (default: "Normal"),
  typeMedical: String (required),
  description: String,
  document: String, // Main document path
  actions: [{
    type: "treatment" | "scanner" | "analysis" (required),
    description: String,
    document: String,
    createdAt: Date (default: now)
  }],
  resultDate: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

### Methods
- `addAction(type, description, document)` - Add new action to actions array
- `getLatestAction()` - Get most recent action

### Missing Methods (Recommended)
```javascript
// Static methods for controllers
medicalRecordSchema.statics.getPatientSummary(patientId)
medicalRecordSchema.statics.getByPriority(priority)
```

---

## 🔔 Notification Model

### Fields
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required),
  title: String (required),
  type: "email" | "whatsapp" (required),
  message: String (required),
  status: "pending" | "sent" | "failed" (default: "pending"),
  isRead: Boolean (default: false),
  relatedAppointmentId: ObjectId (ref: "Appointment"),
  createdAt: Date,
  updatedAt: Date
}
```

### Methods
- `markAsRead()` - Set isRead to true
- `markAsSent()` - Set status to "sent" and add sentAt timestamp
- `markAsFailed()` - Set status to "failed"

### Missing Methods (Recommended)
```javascript
// Static methods for controllers
notificationSchema.statics.getUnreadForUser(userId)
notificationSchema.statics.markAllAsReadForUser(userId)
```

---

## 📅 Working Hours Model

### Fields
```javascript
{
  _id: ObjectId,
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche" (required),
  start: String (required), // format "08:00"
  end: String (required),   // format "17:00"
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Methods
None defined yet.

---

## 🏖️ Holiday Model

### Fields
```javascript
{
  _id: ObjectId,
  date: Date (required), // ex: 2025-11-05
  name: String,          // ex: "Fête Nationale"
  active: Boolean (default: true), // true = clinic closed
  createdAt: Date,
  updatedAt: Date
}
```

### Methods
None defined yet.

---

## ⚠️ Issues Found

### 1. Role Enum Mismatch
**Problem**: [`roleModel.js`](src/models/roleModel.js) uses different role names than [`system_roles_structure.md`](system_roles_structure.md)

**Fix needed**:
```javascript
// Current (wrong)
enum: ["admin", "doctore", "infermeri", "accueil", "patient"]

// Should be (to match system design)
enum: ["admin", "practitioner", "receptionist", "patient"]
```

### 2. Missing User Role Methods
**Problem**: No methods to check user roles or get role information

**Recommended additions**:
```javascript
// Add to userSchema
userSchema.methods.getRoleName = async function() {
  const Role = mongoose.model('Role');
  return await Role.findById(this.roleId);
};

userSchema.methods.getRoleType = async function() {
  const role = await this.getRoleName();
  return role?.name;
};

userSchema.methods.isAdmin = async function() {
  return (await this.getRoleType()) === "admin";
};

userSchema.methods.isPractitioner = async function() {
  return (await this.getRoleType()) === "practitioner";
};

userSchema.methods.isReceptionist = async function() {
  return (await this.getRoleType()) === "receptionist";
};

userSchema.methods.isPatient = async function() {
  return (await this.getRoleType()) === "patient";
};
```

### 3. Missing Permission Management
**Problem**: No easy way to set default permissions by role

**Recommended addition**:
```javascript
// Add to userSchema
userSchema.methods.setDefaultPermissions = function() {
  switch (this.roleType) {
    case 'admin':
      Object.keys(this.permissions).forEach(key => {
        this.permissions[key] = true;
      });
      break;
    case 'practitioner':
      this.permissions.view_appointment = true;
      this.permissions.update_appointment = true;
      this.permissions.create_medical_record = true;
      this.permissions.view_medical_record = true;
      this.permissions.update_medical_record = true;
      break;
    case 'receptionist':
      this.permissions.create_appointment = true;
      this.permissions.view_appointment = true;
      this.permissions.update_appointment = true;
      this.permissions.cancel_appointment = true;
      this.permissions.create_user = true;
      break;
    case 'patient':
      this.permissions.view_appointment = true;
      this.permissions.view_medical_record = true;
      break;
  }
};
```

---

## 🚀 Usage Examples

### Create User with Role
```javascript
const admin = new User({
  name: "Admin User",
  email: "admin@clinic.com",
  password: "securepass",
  roleId: adminRoleId
});
await admin.save();
await admin.setDefaultPermissions();
```

### Schedule Appointment
```javascript
const appointment = new Appointment({
  patientId: patientId,
  practitionerId: doctorId,
  createdBy: receptionistId,
  type: "consultation générale",
  start: new Date("2025-01-15T09:00:00"),
  end: new Date("2025-01-15T09:30:00"),
  reason: "Checkup routinier"
});
await appointment.save();
```

### Create Medical Record
```javascript
const record = new MedicalRecord({
  patientId: patientId,
  appointmentId: appointmentId,
  priority: "Normal",
  typeMedical: "consultation",
  description: "Patient en bonne santé"
});
await record.addAction("treatment", "Prescription vitamine D");
```

---

## 📚 Relations Summary
```
User (1) → (1) Role
User (1) → (n) Appointment (as patient)
User (1) → (n) Appointment (as practitioner)  
User (1) → (n) MedicalRecord (as patient)
User (1) → (n) Notification

Appointment (1) → (1) User (patient)
Appointment (1) → (1) User (practitioner)
Appointment (1) → (n) MedicalRecord

MedicalRecord (1) → (1) User (patient)
MedicalRecord (1) → (1) Appointment

Notification (1) → (1) User
Notification (1) → (1) Appointment (optional)
```