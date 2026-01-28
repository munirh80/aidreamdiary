# AI Dream Diary

AI Dream Diary - Mobile App built with Expo and React Native

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo account (for building)
- EAS CLI installed globally: `npm install -g eas-cli`

### Installation
```bash
npm install
```

### Development
```bash
npm start              # Start Expo development server
npm run android        # Open in Android emulator
npm run ios            # Open in iOS simulator
npm run web            # Open in web browser
```

## Building the App

### Easiest Way to Trigger a Build

The simplest way to build the app is to run:
```bash
npm run build
```
This will build for both Android and iOS using the preview profile.

### Build Options

Choose the build command based on your needs:

#### Quick Preview Builds (Default - APK for Android)
```bash
npm run build                    # Build both platforms (preview)
npm run build:android            # Build Android only (preview)
npm run build:ios                # Build iOS only (preview)
```

#### Development Builds (Internal testing)
```bash
npm run build:dev                # Build both platforms (development)
```

#### Production Builds (Store submission)
```bash
npm run build:prod               # Build both platforms (production)
```

### First Time Building?

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure the build**:
   ```bash
   eas build:configure
   ```

4. **Run your first build**:
   ```bash
   npm run build
   ```

### Build Profiles

The project uses three build profiles defined in `eas.json`:

- **development**: Internal testing, includes dev tools
- **preview**: Internal distribution, APK for Android
- **production**: Store submission, app bundle for Android

### Monitoring Builds

After triggering a build, you can:
- View build status at: https://expo.dev/accounts/[your-account]/projects/aidreamdiary/builds
- Or check status with: `eas build:list`

## Testing
```bash
npm test
```

## Project Structure
- `/assets` - Images and static assets
- `/backend` - Backend API code
- `/frontend` - Frontend React Native code
- `/tests` - Test files

## Additional Resources
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Documentation](https://reactnative.dev/)

