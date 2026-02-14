# Share Now - Android App Specification

## 1. Overview

This specification outlines the requirements and design for an Android application that provides similar functionality to the Share Now web application. The app will enable users to share passwords, URLs, and short text locally without requiring a server, using QR codes, Bluetooth, and ultrasonic sound.

### 1.1 Purpose

To create a native Android application that allows secure, offline, local sharing of text data between devices using multiple communication methods:
- QR Code generation and scanning
- Bluetooth Low Energy (BLE) communication
- Ultrasonic sound transmission

### 1.2 Target Devices

- Android 8.0 (API Level 26) and above
- Devices with camera support (for QR code scanning)
- Devices with Bluetooth Low Energy support
- Devices with microphone and speaker (for sound transmission)

## 2. Functional Requirements

### 2.1 QR Code Features

#### 2.1.1 QR Code Sender
**Description:** Allow users to generate QR codes from text input.

**Requirements:**
- User can enter text via EditText/TextView (multi-line support)
- Real-time QR code generation as user types
- Display QR code in high resolution (minimum 256x256dp)
- Support error correction level H (high - 30% recovery)
- Include margin/quiet zone around QR code
- Support text up to 2,953 characters (QR code capacity limit)
- Clear button to reset input

**Android Implementation Details:**
- Use ZXing Android library for QR code generation
- Dependency: `com.google.zxing:core:3.5.1` and `com.journeyapps:zxing-android-embedded:4.3.0`
- Display QR code using ImageView with proper scaling
- Keep screen on while QR code is displayed using `FLAG_KEEP_SCREEN_ON`

#### 2.1.2 QR Code Receiver
**Description:** Allow users to scan QR codes using device camera.

**Requirements:**
- Request camera permission at runtime
- Open camera with live preview
- Automatic QR code detection and decoding
- Display decoded text in scrollable TextView
- Copy to clipboard functionality
- Share decoded text via Android share sheet
- Option to scan another QR code
- Handle camera errors gracefully

**Android Implementation Details:**
- Use CameraX API or ZXing BarcodeScanner
- Dependency: `androidx.camera:camera-*` or `com.journeyapps:zxing-android-embedded:4.3.0`
- Request `android.permission.CAMERA` permission
- Handle permission denial gracefully with rationale
- Use Material Design bottom sheet for displaying results

### 2.2 Bluetooth Features

#### 2.2.1 Bluetooth Sender
**Description:** Send text to another device via Bluetooth Low Energy.

**Requirements:**
- Scan for nearby BLE devices advertising the Share Now service
- Display list of discovered devices with name and signal strength
- Connect to selected device
- Show connection status (connecting, connected, disconnected)
- Text input field for message
- Send button (enabled only when connected)
- Display send status (sending, success, error)
- Disconnect functionality
- Handle connection errors and timeouts

**Android Implementation Details:**
- Use Android Bluetooth Low Energy API (`android.bluetooth.le`)
- Request `android.permission.BLUETOOTH_SCAN` (Android 12+) or `android.permission.BLUETOOTH` (earlier)
- Request `android.permission.BLUETOOTH_CONNECT` (Android 12+)
- Request `android.permission.ACCESS_FINE_LOCATION` (required for BLE scanning)
- Service UUID: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- Characteristic UUID: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
- Implement scanning using `BluetoothLeScanner`
- Implement GATT client connection
- Support up to 512 bytes per BLE write (MTU negotiation)
- Chunk larger messages if needed

#### 2.2.2 Bluetooth Receiver
**Description:** Receive text from another device via Bluetooth Low Energy.

**Requirements:**
- Advertise BLE service with Share Now UUID
- Display "Waiting for connection" status
- Show connected device name when connected
- Automatically receive and display incoming text
- Copy received text to clipboard
- Share received text via Android share sheet
- Clear functionality
- Stop advertising when done

**Android Implementation Details:**
- Use Android Bluetooth Low Energy API (GATT Server)
- Request same Bluetooth permissions as sender
- Use `BluetoothLeAdvertiser` to advertise service
- Implement GATT server with custom service and characteristic
- Handle characteristic write requests
- Use notification to alert user of received data
- Run BLE server as foreground service with notification

### 2.3 Sound Features

#### 2.3.1 Sound Sender
**Description:** Transmit text using ultrasonic sound waves.

**Requirements:**
- Text input field with 500 character limit
- Character counter display
- Send button to start transmission
- Progress indicator during transmission
- Keep device awake during transmission
- Cancel button to stop transmission
- Volume check (warn if volume too low)
- Display estimated transmission time

**Technical Specifications:**
- Sample rate: 44100 Hz
- Base frequency: 18000 Hz (18 kHz)
- Frequency shift: 1000 Hz (for FSK modulation)
- Bit duration: 50ms per bit
- Preamble duration: 200ms
- Encoding: Text → UTF-8 → Base64 → Binary
- Modulation: Frequency Shift Keying (FSK)
  - Binary 0: 18000 Hz
  - Binary 1: 19000 Hz

**Android Implementation Details:**
- Use `android.media.AudioTrack` for audio generation
- Generate sine wave samples programmatically
- Apply smooth envelope (ADSR) to avoid clicks
- Request `android.permission.MODIFY_AUDIO_SETTINGS` (optional)
- Run transmission in background thread or coroutine
- Use WakeLock to keep device awake: `android.permission.WAKE_LOCK`

#### 2.3.2 Sound Receiver
**Description:** Receive text transmitted via ultrasonic sound.

**Requirements:**
- Request microphone permission
- "Start Receiving" button to begin listening
- Visual indicator when listening (animated icon)
- Progress display during reception
- Automatic preamble detection
- Display received text when complete
- Copy and share functionality
- Stop receiving button
- Handle microphone errors

**Technical Specifications:**
- Sample rate: 44100 Hz
- FFT size: 2048 or 4096 samples
- Frequency range: 17500-20000 Hz
- Real-time frequency detection
- Decode using FFT (Fast Fourier Transform)
- Noise filtering and threshold detection

**Android Implementation Details:**
- Use `android.media.AudioRecord` for audio capture
- Request `android.permission.RECORD_AUDIO` permission
- Use `AudioRecord` with buffer size from `AudioRecord.getMinBufferSize()`
- Implement FFT using Apache Commons Math or custom implementation
- Run audio processing in background thread
- Use sliding window for continuous monitoring
- Decode: Binary → Base64 → UTF-8 → Text

## 3. User Interface Requirements

### 3.1 Home Screen
- Material Design 3 (Material You) styling
- Welcome title: "Share Now"
- Subtitle: "Share passwords, URLs, or any text locally with no server"
- Six cards/buttons for navigation:
  1. QR Code Sender (📤 icon)
  2. QR Code Receiver (📥 icon)
  3. Bluetooth Sender (📡 icon)
  4. Bluetooth Receiver (📲 icon)
  5. Sound Sender (🔊 icon)
  6. Sound Receiver (🎤 icon)
- Info section explaining how each method works
- Dark theme support (follow system theme)

### 3.2 Screen Structure
Each feature should have its own Activity or Fragment with:
- Top app bar with back navigation
- Clear title indicating current mode
- Descriptive subtitle
- Main content area
- Status/error message area
- Action buttons (Material Design)
- Info section with "How it works" (collapsible)

### 3.3 Design Guidelines
- Follow Material Design 3 guidelines
- Use Material Components library
- Color scheme:
  - Primary: Teal/Blue-green (#00897B or similar)
  - Error: Red (#D32F2F)
  - Success: Green (#388E3C)
- Typography: Roboto font family
- Proper spacing and padding (16dp, 8dp guidelines)
- Elevation for cards and buttons
- Ripple effects on clickable items
- Smooth transitions between screens

## 4. Technical Architecture

### 4.1 Technology Stack
- **Language:** Kotlin (preferred) or Java
- **Minimum SDK:** API 26 (Android 8.0)
- **Target SDK:** API 34 (Android 14) or latest
- **Architecture:** MVVM (Model-View-ViewModel)
- **UI Framework:** Jetpack Compose or XML layouts with ViewBinding
- **Navigation:** Navigation Component
- **Dependency Injection:** Hilt or Koin
- **Coroutines:** For asynchronous operations
- **Lifecycle:** Android Jetpack Lifecycle components

### 4.2 Key Dependencies
```gradle
// Core Android
implementation 'androidx.core:core-ktx:1.12.0'
implementation 'androidx.appcompat:appcompat:1.6.1'
implementation 'com.google.android.material:material:1.11.0'
implementation 'androidx.constraintlayout:constraintlayout:2.1.4'

// Navigation
implementation 'androidx.navigation:navigation-fragment-ktx:2.7.6'
implementation 'androidx.navigation:navigation-ui-ktx:2.7.6'

// QR Code
implementation 'com.google.zxing:core:3.5.1'
implementation 'com.journeyapps:zxing-android-embedded:4.3.0'

// CameraX (alternative for QR scanning)
implementation 'androidx.camera:camera-camera2:1.3.1'
implementation 'androidx.camera:camera-lifecycle:1.3.1'
implementation 'androidx.camera:camera-view:1.3.1'

// Lifecycle
implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'

// Coroutines
implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
```

### 4.3 Project Structure
```
app/
├── src/main/
│   ├── java/com/pomali/sharenow/
│   │   ├── ui/
│   │   │   ├── home/
│   │   │   │   ├── HomeActivity.kt
│   │   │   │   └── HomeViewModel.kt
│   │   │   ├── qr/
│   │   │   │   ├── QRSenderActivity.kt
│   │   │   │   ├── QRReceiverActivity.kt
│   │   │   │   └── QRViewModel.kt
│   │   │   ├── bluetooth/
│   │   │   │   ├── BluetoothSenderActivity.kt
│   │   │   │   ├── BluetoothReceiverActivity.kt
│   │   │   │   └── BluetoothViewModel.kt
│   │   │   └── sound/
│   │   │       ├── SoundSenderActivity.kt
│   │   │       ├── SoundReceiverActivity.kt
│   │   │       └── SoundViewModel.kt
│   │   ├── data/
│   │   │   ├── bluetooth/
│   │   │   │   ├── BluetoothManager.kt
│   │   │   │   ├── BLEGattClient.kt
│   │   │   │   └── BLEGattServer.kt
│   │   │   ├── sound/
│   │   │   │   ├── SoundTransmitter.kt
│   │   │   │   ├── SoundReceiver.kt
│   │   │   │   └── AudioProcessor.kt
│   │   │   └── qr/
│   │   │       ├── QRCodeGenerator.kt
│   │   │       └── QRCodeScanner.kt
│   │   ├── util/
│   │   │   ├── PermissionHelper.kt
│   │   │   └── Constants.kt
│   │   └── ShareNowApplication.kt
│   ├── res/
│   │   ├── layout/
│   │   ├── values/
│   │   ├── drawable/
│   │   └── navigation/
│   └── AndroidManifest.xml
```

## 5. Permissions

### 5.1 Required Permissions

#### AndroidManifest.xml
```xml
<!-- Camera for QR code scanning -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Bluetooth for BLE communication -->
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />
<uses-feature android:name="android.hardware.bluetooth_le" android:required="false" />

<!-- Audio for ultrasonic sound -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />

<!-- Keep screen/device awake during operations -->
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Foreground service for Bluetooth receiver -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />
```

### 5.2 Runtime Permission Handling
- Request permissions using `ActivityCompat.requestPermissions()`
- Show rationale before requesting if previously denied
- Handle "Don't ask again" scenario gracefully
- Direct user to app settings if permission permanently denied
- Degrade gracefully if optional features unavailable

## 6. Security and Privacy

### 6.1 Data Security
- All data transmission is local - no internet required
- No data stored on device after transmission
- No analytics or tracking
- No third-party data sharing
- Clear text from memory after sharing

### 6.2 Bluetooth Security
- Display device name for user confirmation before connecting
- Use encrypted BLE connection (security level)
- Implement connection timeout (30 seconds)
- Auto-disconnect on app background (configurable)

### 6.3 Sound Transmission Security
- Limited to 500 characters to prevent abuse
- Ultrasonic frequencies minimize eavesdropping
- Short-range transmission (1-2 meters)
- No storage of transmitted audio

### 6.4 QR Code Security
- No logging of QR code contents
- Clear QR code from screen when app minimized
- Warn user about sensitive data sharing

## 7. Error Handling

### 7.1 Common Errors
- Camera unavailable
- Bluetooth disabled
- Bluetooth not supported
- Location permission required for BLE (Android 9-11)
- Microphone unavailable
- Speaker volume too low
- Connection timeout
- Transmission interrupted
- Invalid QR code format

### 7.2 Error Messages
All error messages should:
- Be user-friendly and actionable
- Explain what went wrong
- Suggest how to fix the issue
- Provide relevant documentation link if complex

## 8. Testing Requirements

### 8.1 Unit Tests
- QR code generation/decoding logic
- Bluetooth connection state management
- Sound encoding/decoding algorithms
- Data validation and sanitization

### 8.2 Integration Tests
- Permission flow testing
- Activity navigation
- ViewModel and data layer integration

### 8.3 UI Tests
- User flow from home to each feature
- Permission dialogs
- Error state handling
- Success state handling

### 8.4 Device Testing
- Test on devices with Android 8-14
- Test on devices with different screen sizes
- Test Bluetooth on multiple device pairs
- Test sound transmission in various environments
- Test camera scanning in different lighting

## 9. Accessibility

### 9.1 Requirements
- All interactive elements must have content descriptions
- Support TalkBack screen reader
- Minimum touch target size: 48dp x 48dp
- High contrast mode support
- Font scaling support (up to 200%)
- Color blindness considerations (not color-only indicators)

### 9.2 Specific Features
- Announce QR code generation/scan results via TalkBack
- Announce Bluetooth connection status
- Announce sound transmission progress
- Provide haptic feedback for successful operations

## 10. Performance Requirements

### 10.1 Benchmarks
- QR code generation: < 500ms for 1000 characters
- QR code scanning: < 2 seconds for detection
- Bluetooth connection: < 5 seconds
- Sound transmission: ~20 bits/second
- App launch time: < 2 seconds on mid-range device

### 10.2 Resource Usage
- Memory: < 100MB typical usage
- Battery: Optimize BLE scanning interval
- CPU: Use hardware acceleration where available
- Storage: < 20MB app size

## 11. Localization

### 11.1 Supported Languages (Phase 1)
- English (default)
- Additional languages can be added later

### 11.2 Internationalization
- Use string resources for all text
- Support RTL layouts
- Format numbers/dates according to locale
- Prepare for future multi-language support

## 12. Distribution

### 12.1 Google Play Store
- App name: "Share Now"
- Package name: `com.pomali.sharenow`
- Category: Tools
- Content rating: Everyone
- Privacy policy required (data handling disclosure)
- Icon design following Material Design guidelines

### 12.2 Alternative Distribution
- F-Droid (open source)
- Direct APK download (GitHub Releases)
- Amazon Appstore

## 13. Future Enhancements

### 13.1 Potential Features
- NFC data sharing
- Wi-Fi Direct communication
- History of shared items (optional, with user consent)
- Encryption option for sensitive data
- Batch QR code sharing
- URL preview before opening
- Wear OS companion app
- Widget for quick access

### 13.2 Platform Expansion
- iOS app with similar functionality
- Desktop applications (Windows, macOS, Linux)
- Cross-platform framework consideration (Flutter/React Native)

## 14. Development Timeline (Estimated)

### Phase 1: Foundation (2-3 weeks)
- Project setup and architecture
- Home screen and navigation
- QR Code sender and receiver

### Phase 2: Bluetooth (2-3 weeks)
- Bluetooth sender implementation
- Bluetooth receiver implementation
- Permission handling and error states

### Phase 3: Sound (2-3 weeks)
- Sound transmission implementation
- Sound reception implementation
- Audio processing and FFT

### Phase 4: Polish (1-2 weeks)
- UI/UX refinement
- Testing and bug fixes
- Accessibility improvements
- Documentation

### Phase 5: Release (1 week)
- Play Store listing
- Screenshots and promotional materials
- Beta testing
- Production release

**Total estimated time:** 8-12 weeks for a single developer

## 15. References

### 15.1 Web App Repository
- Repository: https://github.com/pomali/share-now
- Web App URL: https://pomali.github.io/share-now/

### 15.2 Android Documentation
- Bluetooth Low Energy: https://developer.android.com/guide/topics/connectivity/bluetooth-le
- CameraX: https://developer.android.com/training/camerax
- AudioRecord/AudioTrack: https://developer.android.com/reference/android/media/AudioRecord
- Permissions: https://developer.android.com/guide/topics/permissions/overview

### 15.3 Libraries
- ZXing: https://github.com/zxing/zxing
- ZXing Android Embedded: https://github.com/journeyapps/zxing-android-embedded
- Material Design: https://m3.material.io/

## 16. Glossary

- **BLE:** Bluetooth Low Energy
- **QR:** Quick Response (code)
- **GATT:** Generic Attribute Profile (Bluetooth)
- **FFT:** Fast Fourier Transform
- **FSK:** Frequency Shift Keying
- **MTU:** Maximum Transmission Unit
- **UUID:** Universally Unique Identifier
- **MVVM:** Model-View-ViewModel

---

## Document Control

- **Version:** 1.0
- **Date:** 2026-02-14
- **Author:** Share Now Development Team
- **Status:** Draft for Review

This specification serves as a comprehensive guide for developing an Android application with functionality equivalent to the Share Now web application. Implementation details may be adjusted based on technical constraints and user feedback during development.
