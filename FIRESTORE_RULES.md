# Firestore Security Rules Setup

## Quick Setup for Development

To fix the "Missing or insufficient permissions" error, you need to update your Firestore security rules in the Firebase Console.

### Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**
3. **Go to Firestore Database** → **Rules** tab
4. **Replace the existing rules with:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for authenticated users (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if true; // TEMPORARY - allows all access
    }
  }
}
```

5. **Click "Publish"**

## Production-Ready Rules (Use Later)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Projects - users can read/write projects they're members of
    match /projects/{projectId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.members;
    }

    // Tasks - users can read/write tasks in projects they're members of
    match /tasks/{taskId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/projects/$(resource.data.projectId)) &&
        request.auth.uid in get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.members;
    }

    // Discussions - same as tasks
    match /discussions/{discussionId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/projects/$(resource.data.projectId)) &&
        request.auth.uid in get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.members;
    }
  }
}
```

## Current Issue Fix

**IMMEDIATE ACTION NEEDED:**

1. Set the temporary open rules above
2. This will allow the app to work while we develop
3. Later, implement proper authentication and use the production rules

**Note**: The temporary rules allow all access - only use for development!
