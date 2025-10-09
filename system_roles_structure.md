# CareFlow - System Roles & Models Structure

---

# Admin ---------------------------------------------------------------------

L'admin 3ando control kamil 3la system.

## Dourou
- Ydir users jdod w y3tihom roles
- Ysuspend / yactivate comptes 
- Ymodifier permissions w roles
- Yconfiguré system settings (horaires, holidays)

## Model: User
```
name, email, password, birthDate, roleId, status, refreshToken, cin
permissions: {create_user, delete_user, update_user, ...kolla permissions = true}
```

## Functions
- `suspend()` / `activate()` - control user accounts
- `generateAccessToken()` / `generateRefreshToken()` - JWT tokens
- `updateField()` / `updateFields()` - modify user data
- `matchPassword()` - password validation

---

# Practitioner -------------------------------------------------------------
# ([ "doctore", "infermeri" ])

Doctor/infirmier .. li kaydir consultations.

## Dourou  
- Kaydir RDV w consultations
- Ykhdem 3la medical records dyal patients
- Ymodifier status dyal appointments (scheduled → completed)
- Y9ra w ymodifier dossiers médicaux

## Model: Appointment
```
patientId, practitionerId, createdBy, type, start, end, reason, document, status
```

## Functions
- `markCompleted()` - mark appointment finished
- `cancel()` - cancel appointment
- `isPast()` / `isToday()` - check timing
- `getDuration()` - get appointment length

## Model: MedicalRecord  
```
patientId, appointmentId, priority, typeMedical, description, document, actions, resultDate
```

## Functions
- `addAction(type, description, document)` - add treatment/scanner/analysis
- `getLatestAction()` - get recent action

---

# Receptionist ---------------------------------------------------------------

F l'accueil, kaytsel b patients.

## Dourou
- Ykhli9 patients jdod 
- Ykhli9 / ymodifier / yannuler RDV
- Ychouf availability dyal doctors

## Permissions
```
create_user: true (patients only)
create_appointment, view_appointment, update_appointment, cancel_appointment: true
medical records: false (ma-y9derch ychouf)
```

---

# Patient ---------------------------------------------------------------------

Mari7 li 3ando compte f system.

## Dourou
- Ychouf profile dyalou
- Ychouf appointments dyalou
- Yrecevoir notifications

## Permissions  
```
view_appointment: true (dyalou only)
view_medical_record: true (dyalou only)  
kolla l-b9i: false
```

---

## System Models

### Role
```
name: "admin" | "practitioner" | "receptionist" | "patient"
description
```

### Notification
```
userId, title, type (email/whatsapp), message, status, isRead, relatedAppointmentId
```

**Functions:**
- `markAsRead()` / `markAsSent()` / `markAsFailed()`

### WorkingHour
```
day, start, end, active
```

### Holiday  
```
date, name, active
```

---

## Relations Summary
```
User → Role (roleId)
User → Appointments (patient/practitioner) 
User → MedicalRecords (patient)
User → Notifications
Appointment → MedicalRecord
```