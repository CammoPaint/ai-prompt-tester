# Firebase Setup Guide

This guide will help you set up Firebase for your AI Prompt Testing Platform so you can:
- ✅ Persist API keys across sessions
- ✅ Save and load custom OpenRouter models
- ✅ Store chat workspaces and threads
- ✅ Enable user authentication

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Click "Create a project" or "Add project"

2. **Project Setup**
   - Enter project name: `ai-prompt-tester` (or your preferred name)
   - Disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In your Firebase project, click "Authentication" in the left sidebar
   - Click "Get started"

2. **Enable Email/Password Authentication**
   - Go to "Sign-in method" tab
   - Click "Email/Password"
   - Enable "Email/Password" provider
   - Click "Save"

## Step 3: Create Firestore Database

1. **Navigate to Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" (we'll update rules later)
   - Choose a location (closest to your users)
   - Click "Done"

## Step 4: Get Firebase Configuration

1. **Go to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Add Web App**
   - Scroll down to "Your apps" section
   - Click the web icon `</>`
   - Enter app nickname: `ai-prompt-tester-web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**
   - Copy the Firebase configuration object
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef..."
   };
   ```

## Step 5: Configure Environment Variables

1. **Create .env file**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Firebase credentials**
   Open `.env` and replace the placeholder values:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
   ```

## Step 6: Deploy Firestore Security Rules

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use existing `firestore.rules` file
   - Use existing `firestore.indexes.json` file

4. **Deploy the security rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 7: Test Your Setup

1. **Restart your development server**
   ```bash
   npm run dev
   ```

2. **Check the app**
   - The Firebase configuration notice should disappear
   - You should be able to register/login
   - API keys should persist across browser sessions
   - Custom models should be available

## Troubleshooting

### "Firebase is not configured" Error
- Check that your `.env` file exists and has correct values
- Restart the development server after creating `.env`
- Verify all environment variables start with `VITE_`

### "Missing or insufficient permissions" Error
- Make sure you've deployed the Firestore security rules
- Run: `firebase deploy --only firestore:rules`

### Authentication Issues
- Ensure Email/Password authentication is enabled in Firebase Console
- Check that your Firebase project ID is correct in `.env`

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Your API keys are stored securely in Firestore
- Users can only access their own data

## Next Steps

Once Firebase is configured:
1. Register a new account in the app
2. Add your API keys in Settings
3. Create custom OpenRouter models
4. Start testing prompts!

---

**Need help?** Check the main README.md for additional troubleshooting information.

