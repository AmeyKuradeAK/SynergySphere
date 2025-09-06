# Environment Variables Setup for EAS Builds

This guide explains how to properly configure environment variables for EAS builds in SynergySphere.

## 🔑 Required Environment Variables

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🚀 Method 1: Using EAS Secrets (Recommended)

### Step 1: Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to EAS

```bash
eas login
```

### Step 3: Create Project Secrets

```bash
# Set Firebase API Key
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your_actual_api_key"

# Set Firebase Auth Domain
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "your_project.firebaseapp.com"

# Set Firebase Project ID
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "your_project_id"

# Set Firebase Storage Bucket
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "your_project.appspot.com"

# Set Firebase Messaging Sender ID
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "123456789"

# Set Firebase App ID
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "1:123456789:web:abcdef123456"
```

### Step 4: Verify Secrets

```bash
# List all project secrets
eas secret:list --scope project

# View a specific secret (shows name only, not value)
eas secret:get --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY
```

### Step 5: Build with Secrets

```bash
# Development build
eas build --platform all --profile development

# Production build
eas build --platform all --profile production
```

## 🔧 Method 2: Using .env File (Development Only)

### Step 1: Create .env file

```bash
cp .env.example .env
```

### Step 2: Add your Firebase credentials to .env

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

> **⚠️ Warning:** Never commit .env files to version control. They're already included in .gitignore.

## 📝 Method 3: Direct Environment Variables in eas.json

You can also set environment variables directly in `eas.json` (not recommended for sensitive data):

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_API_KEY": "hardcoded_value_here"
      }
    }
  }
}
```

## 🏗️ Build Profiles Explained

### Development Profile

- Uses development Firebase project
- Includes debugging tools
- Internal distribution only

### Preview Profile

- Uses staging/preview Firebase project
- For internal testing
- Can be distributed via TestFlight/Internal Testing

### Production Profile

- Uses production Firebase project
- Optimized builds
- Ready for App Store/Play Store

## 🔄 Managing Different Environments

### Option 1: Different Firebase Projects

```bash
# Development secrets
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "synergysphere-dev"

# Production secrets (update when ready)
eas secret:update --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "synergysphere-prod"
```

### Option 2: Environment-Specific Secrets

```bash
# Development environment
eas secret:create --scope project --name DEV_FIREBASE_PROJECT_ID --value "synergysphere-dev"

# Production environment
eas secret:create --scope project --name PROD_FIREBASE_PROJECT_ID --value "synergysphere-prod"
```

Then update `eas.json`:

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "$DEV_FIREBASE_PROJECT_ID"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "$PROD_FIREBASE_PROJECT_ID"
      }
    }
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Environment variables not found during build**

   ```bash
   # Verify secrets exist
   eas secret:list --scope project

   # Check eas.json syntax
   npx expo config --type public
   ```

2. **Firebase configuration errors**

   ```bash
   # Test Firebase config locally first
   yarn start
   ```

3. **Build fails with authentication errors**
   ```bash
   # Re-login to EAS
   eas logout
   eas login
   ```

### Debugging Environment Variables

Add this to your app to debug environment variables (remove in production):

```typescript
// In your App.tsx or main component
console.log('Environment Variables:', {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
    ? '✓ Set'
    : '✗ Missing',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
    ? '✓ Set'
    : '✗ Missing',
  // ... other variables
});
```

## 🔐 Security Best Practices

1. **Never commit secrets to version control**
2. **Use different Firebase projects for different environments**
3. **Regularly rotate API keys**
4. **Use EAS secrets for production builds**
5. **Limit Firebase project permissions**

## 📚 Additional Resources

- [EAS Build Environment Variables](https://docs.expo.dev/build-reference/variables/)
- [EAS Secrets Documentation](https://docs.expo.dev/eas/environment-variables/)
- [Firebase Project Setup](https://firebase.google.com/docs/projects/learn-more)

## 🚀 Quick Commands Reference

```bash
# Create all secrets at once (replace values)
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "YOUR_API_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "YOUR_PROJECT.firebaseapp.com"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "YOUR_PROJECT_ID"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "YOUR_PROJECT.appspot.com"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "YOUR_SENDER_ID"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "YOUR_APP_ID"

# Build commands
eas build --platform all --profile development
eas build --platform all --profile preview
eas build --platform all --profile production

# Manage secrets
eas secret:list --scope project
eas secret:update --scope project --name VARIABLE_NAME --value "new_value"
eas secret:delete --scope project --name VARIABLE_NAME
```

---

**Need Help?** Check the [main README](README.md) or create an issue in the repository.
