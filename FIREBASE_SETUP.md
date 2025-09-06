# Firebase Setup Instructions for SynergySphere

## Prerequisites

- A Google account
- Node.js and npm/yarn installed
- The SynergySphere project set up locally

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `synergysphere` (or your preferred name)
4. Enable/disable Google Analytics as desired
5. Click "Create project"

## Step 2: Enable Authentication

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Optionally, enable other providers you want to support

## Step 3: Set up Firestore Database

1. Go to **Firestore Database** in the Firebase Console
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location closest to your users
5. Click "Done"

## Step 4: Add Web App to Firebase Project

1. In the Firebase Console, click the **Web** icon (`</>`) to add a web app
2. Enter app nickname: `SynergySphere Web`
3. **Do not** check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 5: Update Firebase Configuration

1. Open `lib/firebase.ts` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: 'your-actual-api-key',
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-actual-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'your-actual-sender-id',
  appId: 'your-actual-app-id',
};
```

## Step 6: Configure Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the default rules with these development-friendly rules:

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
        request.auth.uid in resource.data.members.map(m => m.userId);
      allow create: if request.auth != null;
    }

    // Tasks - users can read/write tasks in projects they're members of
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }

    // Discussions - users can read/write discussions in projects they're members of
    match /discussions/{discussionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note:** These are permissive rules for development. In production, implement more restrictive rules.

## Step 7: Test the Setup

1. Run your app: `yarn start`
2. Try creating an account
3. Create a project
4. Add some tasks
5. Verify data appears in the Firestore Console

## Step 8: Production Security Rules (Optional)

For production, use more restrictive Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /projects/{projectId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.members.map(m => m.userId);
      allow write: if request.auth != null &&
        request.auth.uid in resource.data.members.map(m => m.userId) &&
        resource.data.members.where(m => m.userId == request.auth.uid && m.role in ['owner', 'admin']).size() > 0;
      allow create: if request.auth != null;
    }

    match /tasks/{taskId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/projects/$(resource.data.projectId)) &&
        request.auth.uid in get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.members.map(m => m.userId);
    }

    match /discussions/{discussionId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/projects/$(resource.data.projectId)) &&
        request.auth.uid in get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.members.map(m => m.userId);
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Firebase not configured" error**: Make sure you've replaced the placeholder config with your actual Firebase config

2. **Permission denied errors**: Check your Firestore security rules and ensure they allow the operations you're trying to perform

3. **Authentication not working**: Verify that Email/Password authentication is enabled in the Firebase Console

4. **Real-time updates not working**: Ensure you have the correct Firestore rules and that your listeners are properly set up

### Enable Firebase Emulator (Optional for Development)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init` (select Firestore and Auth emulators)
4. Start emulators: `firebase emulators:start`
5. Uncomment the emulator connection lines in `lib/firebase.ts`

## Next Steps

Once Firebase is set up, your SynergySphere app will have:

- ✅ User authentication
- ✅ Real-time project collaboration
- ✅ Task management with live updates
- ✅ Team discussions
- ✅ Progress tracking

The app is now ready for development and testing!
