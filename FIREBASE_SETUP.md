# Firebase Setup Guide for MedXperience Passport

## Initial Setup Required

### 1. Create Admin Users
To set up admin access, you need to manually add admin users to Firestore:

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Create a new collection called `admins`
4. Add documents with the following structure:

```json
{
  "email": "admin@medxplore.com",
  "name": "Admin Name",
  "role": "admin",
  "permissions": ["full_access"]
}
```

### 2. Set up Firebase Authentication
1. Go to Firebase Console > Authentication
2. Enable Email/Password authentication
3. Create user accounts for your admin users with the same emails used in the `admins` collection

### 3. Firestore Security Rules
Add these security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to students with their passport number
    match /students/{passportNumber} {
      allow read: if request.auth == null;
    }
    
    // Allow applications to be created by anyone
    match /applications/{document} {
      allow create: if request.auth == null;
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Admin-only collections
    match /admins/{document} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    match /events/{document} {
      allow read: if request.auth == null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    match /participations/{document} {
      allow read: if request.auth == null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

## Database Collections Structure

### students
- Document ID: passport number (e.g., "MXP-2025-1234")
- Fields: fullName, email, university, program, yearOfStudy, tier, totalEvents, etc.

### applications
- Auto-generated document IDs
- Fields: All application form data, status, submittedAt, reviewedAt, etc.

### events
- Auto-generated document IDs
- Fields: name, description, date, location, category, createdBy, etc.

### participations
- Auto-generated document IDs
- Fields: studentId (passport number), eventId, participationType, addedAt, etc.

### admins
- Document ID: admin email or custom ID
- Fields: email, name, role, permissions

## Testing the System

1. **Test Student Flow:**
   - Visit `/passport/apply` to submit an application
   - Check Firestore for the new application document

2. **Test Admin Flow:**
   - Visit `/admin` and login with admin credentials
   - Review applications in `/admin/applications`
   - Approve an application to generate a passport number

3. **Test Student Dashboard:**
   - Visit `/passport` and enter the generated passport number
   - View the student dashboard with passport information

## Notes

- Passport numbers are generated in format: MXP-YYYY-XXXX
- Tier progression is automatic based on event count (Bronze: 0-4, Silver: 5-9, Gold: 10-19, Platinum: 20+)
- All dates are stored as Firebase Timestamps for proper sorting
- The system is designed to be read-only for students and full-access for admins