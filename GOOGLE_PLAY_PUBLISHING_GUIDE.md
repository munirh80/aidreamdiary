# 📱 Dream Vault - Google Play Store Publishing Guide

> **Easy-to-follow guide for publishing your app to Google Play Store**
> 
> No technical experience needed! Just follow along step by step.

---

## 📋 Table of Contents

1. [What You'll Need](#what-youll-need)
2. [Part 1: Setting Up Your Computer](#part-1-setting-up-your-computer)
3. [Part 2: Creating an Expo Account](#part-2-creating-an-expo-account)
4. [Part 3: Building Your App](#part-3-building-your-app)
5. [Part 4: Google Play Console Setup](#part-4-google-play-console-setup)
6. [Part 5: Uploading Your App](#part-5-uploading-your-app)
7. [Part 6: Publishing Your App](#part-6-publishing-your-app)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [Quick Reference Commands](#quick-reference-commands)

---

## 🎯 What You'll Need

Before starting, make sure you have:

| Item | Why You Need It | Cost |
|------|-----------------|------|
| ✅ Computer | To run the build commands | Free |
| ✅ Expo Account | To build your app in the cloud | Free |
| ✅ Google Play Developer Account | To publish on Play Store | $25 one-time fee |
| ✅ App Icon (512x512 pixels) | Required by Play Store | Free |
| ✅ Screenshots of your app | To show users what your app looks like | Free |
| ✅ Privacy Policy URL | Required by Google | Free (can use free generators) |

---

## 🖥️ Part 1: Setting Up Your Computer

### Step 1.1: Install Node.js

**What is it?** Node.js is a program that lets you run the tools needed to build your app.

1. Go to: https://nodejs.org
2. Click the big green button that says **"LTS"** (this means Long Term Support - the stable version)
3. Run the downloaded file and click "Next" through all the steps
4. Restart your computer after installation

**How to check if it worked:**
- Open **Terminal** (Mac) or **Command Prompt** (Windows)
- Type: `node --version`
- You should see something like: `v20.10.0`

### Step 1.2: Install EAS CLI

**What is it?** EAS (Expo Application Services) is the tool that builds your app for you in the cloud.

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
2. Type this command and press Enter:

```bash
npm install -g eas-cli
```

3. Wait for it to finish (might take 1-2 minutes)

**How to check if it worked:**
- Type: `eas --version`
- You should see something like: `eas-cli/5.9.1`

---

## 👤 Part 2: Creating an Expo Account

### Step 2.1: Sign Up for Expo

1. Go to: https://expo.dev/signup
2. Fill in your details:
   - Username (this will be public)
   - Email address
   - Password
3. Click "Create Account"
4. Check your email and click the verification link

### Step 2.2: Log In via Terminal

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
2. Navigate to your project folder:

```bash
cd path/to/your/frontend
```

> 💡 **Tip:** If you don't know the path, you can drag the folder into the Terminal window!

3. Type this command and press Enter:

```bash
eas login
```

4. Enter your Expo username and password when asked

**How to check if it worked:**
- Type: `eas whoami`
- You should see your username

---

## 🔨 Part 3: Building Your App

### Understanding Build Types

| Build Type | File Format | What It's For |
|------------|-------------|---------------|
| **Preview** | APK | Testing on your phone directly |
| **Production** | AAB | Uploading to Google Play Store |

### Step 3.1: Configure Your Project (First Time Only)

1. Open Terminal in your `frontend` folder
2. Run:

```bash
eas build:configure
```

3. When asked "Which platforms?", select **Android** (use arrow keys and space bar)
4. Press Enter

### Step 3.2: Build for Testing (APK)

**Use this when:** You want to test the app on your phone before publishing.

```bash
eas build --platform android --profile preview
```

**What happens:**
1. EAS uploads your code to Expo's servers
2. The build starts (takes 10-20 minutes)
3. You'll get a link to download the APK
4. Transfer the APK to your Android phone and install it

> ⚠️ **Note:** Your phone might warn you about installing from "unknown sources". This is normal for test builds.

### Step 3.3: Build for Google Play Store (AAB)

**Use this when:** You're ready to publish to the Play Store.

```bash
eas build --platform android --profile production
```

**What happens:**
1. EAS builds your app as an AAB file
2. Build takes 10-20 minutes
3. You'll get a link to download the AAB
4. Download this file - you'll upload it to Google Play

> 💡 **Tip:** You can check build status anytime at: https://expo.dev (click on your project → Builds)

---

## 🏪 Part 4: Google Play Console Setup

### Step 4.1: Create a Developer Account

1. Go to: https://play.google.com/console
2. Click "Create Account" or "Sign In" with your Google account
3. Pay the one-time $25 registration fee
4. Fill in your developer details:
   - Developer name (shown publicly on Play Store)
   - Email address
   - Phone number
5. Accept the agreement and complete registration

> ⏰ **Note:** Account verification can take 24-48 hours

### Step 4.2: Create Your App in Play Console

1. Click **"Create app"** button
2. Fill in the details:

| Field | What to Enter |
|-------|---------------|
| **App name** | Dream Vault |
| **Default language** | English (US) - or your preferred language |
| **App or game** | App |
| **Free or paid** | Free (or Paid if you want to charge) |

3. Check the boxes to accept the policies
4. Click **"Create app"**

### Step 4.3: Complete Store Listing

You'll see a checklist on the left side. Let's go through each:

#### 📝 Main Store Listing

**Path:** Grow → Store presence → Main store listing

| Field | What to Enter | Example |
|-------|---------------|----------|
| **App name** | Your app's name | Dream Vault |
| **Short description** | 80 characters max | Record and understand your dreams with AI-powered insights |
| **Full description** | Up to 4000 characters | Describe all features, benefits, how it works |

#### 📸 Graphics

You'll need:

| Graphic | Size | Notes |
|---------|------|-------|
| **App icon** | 512 x 512 px | PNG, 32-bit, no transparency |
| **Feature graphic** | 1024 x 500 px | Banner shown at top of listing |
| **Phone screenshots** | Min 2 required | Recommended: 5-8 screenshots |
| **Tablet screenshots** | Optional but recommended | 7-inch and 10-inch tablets |

> 💡 **Tip:** Use Canva.com (free) to create these graphics!

#### 🔒 Privacy Policy

**Path:** Policy → App content → Privacy policy

1. You need a URL to your privacy policy
2. Free option: Use a privacy policy generator like:
   - https://www.freeprivacypolicy.com
   - https://www.termsfeed.com/privacy-policy-generator
3. Host it free on Google Docs (publish to web) or your website
4. Paste the URL in Play Console

#### 📊 Content Rating

**Path:** Policy → App content → Content rating

1. Click "Start questionnaire"
2. Answer questions about your app's content:
   - Violence? No
   - Sexual content? No
   - Profanity? No
   - etc.
3. Submit and get your rating (likely "Everyone" for Dream Vault)

#### 🎯 Target Audience

**Path:** Policy → App content → Target audience

1. Select age groups your app is for
2. For Dream Vault, select: **18 and over** (safest option)
3. Answer questions about appeal to children

#### 📱 App Category

**Path:** Grow → Store presence → Store settings

| Field | Recommendation |
|-------|----------------|
| **App category** | Health & Fitness OR Lifestyle |
| **Tags** | Dream journal, Sleep tracker, AI |

---

## ⬆️ Part 5: Uploading Your App

### Step 5.1: Create a Release

1. In Play Console, go to: **Release → Testing → Internal testing**
   
   > 💡 **Why internal testing first?** It lets you test the Play Store version before going public.

2. Click **"Create new release"**

### Step 5.2: Upload Your AAB File

1. Click **"Upload"** in the App bundles section
2. Select the `.aab` file you downloaded from Expo
3. Wait for upload to complete (might take a few minutes)
4. You'll see it appear with version info

### Step 5.3: Add Release Notes

In the "Release notes" section, write what's new:

```
Initial release of Dream Vault!

✨ Features:
• Record your dreams with rich details
• AI-powered dream interpretation
• Track dream patterns over time
• Beautiful dark theme designed for bedtime use
• Secure and private - your dreams stay yours
```

### Step 5.4: Save and Review

1. Click **"Save"**
2. Click **"Review release"**
3. Fix any errors shown (usually missing info)
4. Click **"Start rollout to Internal testing"**

---

## 🚀 Part 6: Publishing Your App

### Testing Track Progression

Google recommends this order:

```
Internal Testing → Closed Testing → Open Testing → Production
        ↓               ↓               ↓              ↓
    You + team    Invited users   Anyone can    Everyone on
    (up to 100)   (up to 1000)    join & test   Play Store
```

### Step 6.1: Internal Testing

1. Add testers: **Release → Testing → Internal testing → Testers**
2. Create an email list with tester emails
3. Testers receive a link to install the app
4. Test for 1-2 days minimum

### Step 6.2: Moving to Production

**When you're ready to go public:**

1. Go to: **Release → Production**
2. Click **"Create new release"**
3. Click **"Add from library"** (use your tested build)
4. Add release notes
5. Click **"Review release"**
6. Click **"Start rollout to Production"**

> ⏰ **Review Time:** Google reviews all new apps. This takes 3-7 days (sometimes longer).

### Step 6.3: After Approval

Once approved, your app will be live! You can:
- Share the Play Store link
- See download statistics
- Read user reviews
- Push updates

---

## 🔧 Troubleshooting Common Issues

### Build Failures

| Error | Solution |
|-------|----------|
| "Authentication failed" | Run `eas login` again |
| "Build failed" | Check build logs on expo.dev |
| "Out of memory" | Free builds have limits; upgrade or retry |

### Play Console Rejections

| Rejection Reason | How to Fix |
|------------------|------------|
| "Privacy policy not found" | Make sure URL is publicly accessible |
| "Screenshots missing" | Add at least 2 phone screenshots |
| "Description too short" | Minimum 80 characters for short, more for full |
| "Metadata issues" | Check for special characters or all caps |

### Common Questions

**Q: How long does a build take?**
A: Usually 10-20 minutes. You can close the terminal - it builds in the cloud!

**Q: Can I update my app after publishing?**
A: Yes! Just build a new version and upload it. Increment the version number in `app.json` first.

**Q: How do I update the version number?**
A: Edit `frontend/app.json`:
```json
"version": "1.0.1",  // Increment this
```

**Q: Do I need to pay for Expo?**
A: Basic builds are free! There are limits on free accounts, but enough for most indie developers.

---

## ⚡ Quick Reference Commands

### First Time Setup
```bash
# Install EAS CLI (do once)
npm install -g eas-cli

# Login to Expo (do once)
eas login

# Configure project (do once)
eas build:configure
```

### Building Your App
```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production

# Build for iOS (App Store)
eas build --platform ios --profile production
```

### Useful Commands
```bash
# Check who's logged in
eas whoami

# See all your builds
eas build:list

# Check build status
eas build:view

# Submit directly to stores (advanced)
eas submit --platform android
```

---

## 📞 Getting Help

- **Expo Documentation:** https://docs.expo.dev
- **Expo Forums:** https://forums.expo.dev
- **Google Play Help:** https://support.google.com/googleplay/android-developer
- **EAS Build Docs:** https://docs.expo.dev/build/introduction

---

## ✅ Pre-Publishing Checklist

Before submitting to the Play Store, make sure:

- [ ] App tested on real Android device
- [ ] All features working correctly
- [ ] No crashes or major bugs
- [ ] Privacy policy URL is live and accessible
- [ ] App icon (512x512) looks good
- [ ] At least 2 phone screenshots ready
- [ ] Feature graphic (1024x500) created
- [ ] Short description written (80 chars)
- [ ] Full description written (4000 chars max)
- [ ] Content rating questionnaire completed
- [ ] Target audience selected
- [ ] App category chosen

---

## 🎉 Congratulations!

You've learned how to publish an app to the Google Play Store! This same process can be repeated whenever you want to update your app.

**Version History:**
- v1.0.0 - Initial release guide

**Last Updated:** January 2025
