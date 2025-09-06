# SynergySphere Environment Setup Script (PowerShell)
# This script helps set up environment variables for EAS builds

Write-Host "🚀 SynergySphere Environment Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
try {
    $null = Get-Command eas -ErrorAction Stop
    Write-Host "✅ EAS CLI is already installed" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI is not installed. Installing now..." -ForegroundColor Red
    npm install -g @expo/eas-cli
    Write-Host "✅ EAS CLI installed successfully" -ForegroundColor Green
}

Write-Host ""

# Check if user is logged in to EAS
try {
    $user = eas whoami 2>$null
    Write-Host "✅ Already logged in to EAS as: $user" -ForegroundColor Green
} catch {
    Write-Host "🔑 Please login to EAS:" -ForegroundColor Yellow
    eas login
}

Write-Host ""
Write-Host "📝 Setting up Firebase environment variables..." -ForegroundColor Yellow
Write-Host "Please enter your Firebase configuration details:" -ForegroundColor Yellow
Write-Host ""

# Prompt for Firebase configuration
$FIREBASE_API_KEY = Read-Host "Firebase API Key"
$FIREBASE_AUTH_DOMAIN = Read-Host "Firebase Auth Domain (e.g., yourproject.firebaseapp.com)"
$FIREBASE_PROJECT_ID = Read-Host "Firebase Project ID"
$FIREBASE_STORAGE_BUCKET = Read-Host "Firebase Storage Bucket (e.g., yourproject.appspot.com)"
$FIREBASE_MESSAGING_SENDER_ID = Read-Host "Firebase Messaging Sender ID"
$FIREBASE_APP_ID = Read-Host "Firebase App ID"

Write-Host ""
Write-Host "🔒 Creating EAS secrets..." -ForegroundColor Yellow

# Create secrets
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value $FIREBASE_API_KEY --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value $FIREBASE_AUTH_DOMAIN --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value $FIREBASE_PROJECT_ID --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value $FIREBASE_STORAGE_BUCKET --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value $FIREBASE_MESSAGING_SENDER_ID --force
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value $FIREBASE_APP_ID --force

Write-Host ""
Write-Host "✅ All secrets created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verifying secrets..." -ForegroundColor Yellow
eas secret:list --scope project

Write-Host ""
Write-Host "🎉 Environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'eas build --platform all --profile development' to test your build" -ForegroundColor White
Write-Host "2. Update your Firebase Firestore rules (see README.md)" -ForegroundColor White
Write-Host "3. Test the app with your Firebase configuration" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see ENVIRONMENT_SETUP.md" -ForegroundColor Cyan
