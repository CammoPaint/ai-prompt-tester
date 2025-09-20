# Deploy Firestore Security Rules

To fix the "Missing or insufficient permissions" error, you need to deploy the updated Firestore security rules to your Firebase project.

## Option 1: Using Firebase CLI

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done):
   ```bash
   firebase init firestore
   ```

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste the rules into the editor
6. Click **Publish**

## Option 3: Manual Copy-Paste

If you prefer to manually update the rules:

1. Open `firestore.rules` in your project
2. Copy the entire contents
3. Go to Firebase Console → Firestore Database → Rules
4. Replace the existing rules with the new ones
5. Click **Publish**

## What Changed

The updated rules now allow:
- **List operations** for unauthenticated users (returns empty results)
- **Better error handling** for permission-denied scenarios
- **Graceful fallbacks** when users are not authenticated

This ensures your app works smoothly even when users haven't logged in yet, while maintaining security for authenticated operations.

## Verification

After deploying the rules:
1. Restart your development server: `npm run dev`
2. Check the browser console - the permission errors should be gone
3. The app should load without Firebase-related errors
