#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return null;
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 SynergySphere Environment Setup');
  console.log('==================================');
  console.log('');

  // Check if EAS CLI is installed
  const easInstalled = execCommand('eas --version');
  if (!easInstalled) {
    console.log('❌ EAS CLI is not installed. Installing now...');
    execSync('npm install -g @expo/eas-cli', { stdio: 'inherit' });
    console.log('✅ EAS CLI installed successfully');
  } else {
    console.log('✅ EAS CLI is already installed');
  }

  console.log('');

  // Check if user is logged in to EAS
  const whoami = execCommand('eas whoami');
  if (!whoami || whoami.includes('not authenticated')) {
    console.log('🔑 Please login to EAS:');
    execSync('eas login', { stdio: 'inherit' });
  } else {
    console.log(`✅ Already logged in to EAS as: ${whoami.trim()}`);
  }

  console.log('');
  console.log('📝 Setting up Firebase environment variables...');
  console.log('Please enter your Firebase configuration details:');
  console.log('');

  // Prompt for Firebase configuration
  const firebaseConfig = {
    apiKey: await question('Firebase API Key: '),
    authDomain: await question(
      'Firebase Auth Domain (e.g., yourproject.firebaseapp.com): '
    ),
    projectId: await question('Firebase Project ID: '),
    storageBucket: await question(
      'Firebase Storage Bucket (e.g., yourproject.appspot.com): '
    ),
    messagingSenderId: await question('Firebase Messaging Sender ID: '),
    appId: await question('Firebase App ID: '),
  };

  console.log('');
  console.log('🔒 Creating EAS secrets...');

  // Create secrets
  const secrets = [
    ['EXPO_PUBLIC_FIREBASE_API_KEY', firebaseConfig.apiKey],
    ['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
    ['EXPO_PUBLIC_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
    ['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket],
    [
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      firebaseConfig.messagingSenderId,
    ],
    ['EXPO_PUBLIC_FIREBASE_APP_ID', firebaseConfig.appId],
  ];

  for (const [name, value] of secrets) {
    try {
      execSync(
        `eas secret:create --scope project --name "${name}" --value "${value}" --force`,
        {
          stdio: 'pipe',
        }
      );
      console.log(`✅ Created secret: ${name}`);
    } catch (error) {
      console.log(`❌ Failed to create secret: ${name}`);
      console.error(error.message);
    }
  }

  console.log('');
  console.log('✅ All secrets created successfully!');
  console.log('');
  console.log('📋 Verifying secrets...');

  try {
    execSync('eas secret:list --scope project', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Failed to list secrets');
  }

  console.log('');
  console.log('🎉 Environment setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run "yarn build:dev" to test your development build');
  console.log('2. Run "yarn build:prod" for production builds');
  console.log('3. Update your Firebase Firestore rules (see README.md)');
  console.log('4. Test the app with your Firebase configuration');
  console.log('');
  console.log('For more information, see ENVIRONMENT_SETUP.md');

  rl.close();
}

main().catch(console.error);
