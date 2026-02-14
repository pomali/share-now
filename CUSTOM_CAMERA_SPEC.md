# Custom Camera Specification for Android App

## Document Information
- **Version:** 1.0.0
- **Last Updated:** 2026-02-14
- **Status:** Draft
- **Target Platform:** Android (API Level 21+)

## 1. Overview

### 1.1 Purpose
This document specifies the requirements and design for a custom camera component for the Share Now Android application. The custom camera will replace or augment the existing web-based camera implementation to provide native Android functionality with enhanced performance, control, and user experience.

### 1.2 Scope
The custom camera component will:
- Capture live camera feed for QR code scanning
- Support both front and rear cameras
- Provide camera preview with overlay capabilities
- Handle camera permissions and lifecycle management
- Optimize for QR code detection with configurable scanning regions
- Support multiple Android API levels with graceful degradation

### 1.3 Goals
- **Performance:** Achieve sub-100ms frame processing for QR code detection
- **Reliability:** Handle camera lifecycle events without crashes
- **User Experience:** Provide smooth, responsive camera preview with minimal latency
- **Compatibility:** Support Android API 21 (Lollipop) and above
- **Accessibility:** Include accessibility features for users with disabilities

## 2. Functional Requirements

### 2.1 Camera Access and Control

#### 2.1.1 Camera Selection
- **FR-CAM-001:** The component MUST support selection between front and rear cameras
- **FR-CAM-002:** The component MUST default to the rear camera for QR code scanning
- **FR-CAM-003:** The component MUST provide an API to switch between cameras at runtime
- **FR-CAM-004:** The component MUST detect available cameras on device initialization

#### 2.1.2 Camera Preview
- **FR-PREV-001:** The component MUST display a real-time camera preview
- **FR-PREV-002:** The preview MUST maintain proper aspect ratio to prevent distortion
- **FR-PREV-003:** The preview MUST support multiple aspect ratios (16:9, 4:3, 1:1)
- **FR-PREV-004:** The preview MUST auto-rotate based on device orientation
- **FR-PREV-005:** The component MUST support custom overlay views on top of the preview

#### 2.1.3 Camera Settings
- **FR-SET-001:** The component MUST support autofocus functionality
- **FR-SET-002:** The component MUST support tap-to-focus with visual feedback
- **FR-SET-003:** The component SHOULD support zoom control (pinch-to-zoom)
- **FR-SET-004:** The component SHOULD support torch/flashlight toggle
- **FR-SET-005:** The component MAY support exposure compensation adjustment

### 2.2 QR Code Scanning Integration

#### 2.2.1 Scanning Region
- **FR-SCAN-001:** The component MUST support configurable scanning region (QR box overlay)
- **FR-SCAN-002:** The scanning region MUST be visually indicated to users
- **FR-SCAN-003:** The component MUST allow frame analysis to be restricted to the scanning region
- **FR-SCAN-004:** The scanning region size MUST be configurable (e.g., 250x250dp, 300x300dp)

#### 2.2.2 Frame Processing
- **FR-PROC-001:** The component MUST provide frame callback interface for image analysis
- **FR-PROC-002:** Frame callbacks MUST include image data in a processable format (YUV/NV21 or Bitmap)
- **FR-PROC-003:** The component MUST support configurable frame rate for analysis (5-30 fps)
- **FR-PROC-004:** The component MUST handle frame processing on a background thread
- **FR-PROC-005:** The component MUST prevent frame processing backlog with frame dropping

### 2.3 Lifecycle Management

#### 2.3.1 Permission Handling
- **FR-PERM-001:** The component MUST check for camera permissions before access
- **FR-PERM-002:** The component MUST provide callbacks for permission grant/denial
- **FR-PERM-003:** The component MUST display appropriate UI when permissions are denied
- **FR-PERM-004:** The component MUST handle runtime permission changes

#### 2.3.2 Lifecycle Events
- **FR-LIFE-001:** The component MUST properly release camera resources on Activity pause
- **FR-LIFE-002:** The component MUST properly reinitialize camera on Activity resume
- **FR-LIFE-003:** The component MUST handle camera disconnection gracefully
- **FR-LIFE-004:** The component MUST handle other apps taking camera priority
- **FR-LIFE-005:** The component MUST clean up all resources on component destruction

### 2.4 Error Handling

#### 2.4.1 Error States
- **FR-ERR-001:** The component MUST handle and report camera initialization failures
- **FR-ERR-002:** The component MUST handle and report camera access errors
- **FR-ERR-003:** The component MUST provide user-friendly error messages
- **FR-ERR-004:** The component MUST attempt recovery from transient errors
- **FR-ERR-005:** The component MUST log detailed error information for debugging

## 3. Non-Functional Requirements

### 3.1 Performance

#### 3.1.1 Frame Rate
- **NFR-PERF-001:** Camera preview MUST maintain minimum 24 fps under normal conditions
- **NFR-PERF-002:** Frame analysis for QR detection MUST process frames within 100ms
- **NFR-PERF-003:** Camera initialization MUST complete within 2 seconds
- **NFR-PERF-004:** Camera switch MUST complete within 1 second

#### 3.1.2 Resource Usage
- **NFR-RES-001:** Camera preview MUST consume less than 10% CPU on mid-range devices
- **NFR-RES-002:** Memory usage MUST not exceed 50MB for camera operations
- **NFR-RES-003:** Battery drain from camera usage MUST be optimized (< 5% per minute)

### 3.2 Compatibility

#### 3.2.1 API Level Support
- **NFR-COMPAT-001:** MUST support Android API 21 (Lollipop) and above
- **NFR-COMPAT-002:** SHOULD use Camera2 API for API 21+ with fallback to Camera API
- **NFR-COMPAT-003:** SHOULD use CameraX library for simplified implementation (API 21+)

#### 3.2.2 Device Support
- **NFR-DEV-001:** MUST support devices with single rear camera
- **NFR-DEV-002:** MUST support devices with multiple cameras (wide, telephoto, etc.)
- **NFR-DEV-003:** SHOULD handle devices without autofocus gracefully
- **NFR-DEV-004:** MUST support various screen sizes and resolutions

### 3.3 Security and Privacy

#### 3.3.1 Privacy
- **NFR-SEC-001:** Camera data MUST only be processed locally on device
- **NFR-SEC-002:** Camera frames MUST NOT be saved to disk without explicit user consent
- **NFR-SEC-003:** Camera access indicator MUST be visible when camera is active
- **NFR-SEC-004:** The component MUST comply with Android privacy best practices

#### 3.3.2 Security
- **NFR-SEC-005:** Camera permissions MUST follow principle of least privilege
- **NFR-SEC-006:** The component MUST validate all external inputs
- **NFR-SEC-007:** The component MUST prevent camera hijacking by malicious code

### 3.4 Accessibility

#### 3.4.1 Visual Accessibility
- **NFR-ACC-001:** Camera controls MUST have minimum touch target size of 48dp
- **NFR-ACC-002:** Visual indicators MUST have sufficient contrast ratios (WCAG AA)
- **NFR-ACC-003:** Important UI elements MUST be visible in both light and dark environments

#### 3.4.2 Screen Reader Support
- **NFR-ACC-004:** All interactive elements MUST have content descriptions
- **NFR-ACC-005:** Camera state changes MUST be announced to screen readers
- **NFR-ACC-006:** Error messages MUST be accessible to screen readers

## 4. Technical Architecture

### 4.1 Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CustomCameraView                      │
│  (Main UI Component - extends View/ViewGroup)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │        CameraController                        │    │
│  │  - Camera lifecycle management                 │    │
│  │  - Camera configuration                        │    │
│  │  - Frame capture coordination                  │    │
│  └───────────────┬───────────────────────────────┘    │
│                  │                                      │
│  ┌───────────────▼───────────────┐  ┌──────────────┐  │
│  │   CameraPreviewSurface        │  │  OverlayView │  │
│  │   - TextureView/SurfaceView   │  │  - QR box    │  │
│  │   - Preview rendering          │  │  - Guides    │  │
│  └───────────────┬───────────────┘  └──────────────┘  │
│                  │                                      │
│  ┌───────────────▼───────────────────────────────┐    │
│  │        FrameProcessorManager                   │    │
│  │  - Frame analysis queue                        │    │
│  │  - Threading coordination                      │    │
│  │  - Callback dispatch                           │    │
│  └───────────────┬───────────────────────────────┘    │
│                  │                                      │
│  ┌───────────────▼───────────────────────────────┐    │
│  │        QRCodeAnalyzer (External)              │    │
│  │  - QR code detection                           │    │
│  │  - Barcode processing                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 API Design

#### 4.2.1 Main Component Interface

```kotlin
class CustomCameraView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {
    
    /**
     * Initialize the camera with configuration
     */
    fun initialize(config: CameraConfig)
    
    /**
     * Start camera preview
     */
    fun startPreview()
    
    /**
     * Stop camera preview
     */
    fun stopPreview()
    
    /**
     * Release all camera resources
     */
    fun release()
    
    /**
     * Switch between front and rear cameras
     */
    fun switchCamera(facing: CameraFacing)
    
    /**
     * Enable/disable torch
     */
    fun setTorchEnabled(enabled: Boolean)
    
    /**
     * Set frame processor callback
     */
    fun setFrameProcessor(processor: FrameProcessor)
    
    /**
     * Set camera event listener
     */
    fun setCameraListener(listener: CameraListener)
    
    /**
     * Configure scanning region
     */
    fun setScanningRegion(region: ScanningRegion)
}
```

#### 4.2.2 Configuration Classes

```kotlin
data class CameraConfig(
    val facing: CameraFacing = CameraFacing.BACK,
    val aspectRatio: AspectRatio = AspectRatio.RATIO_16_9,
    val autoFocusEnabled: Boolean = true,
    val frameRate: Int = 10, // fps for analysis
    val previewSize: PreviewSize = PreviewSize.OPTIMAL,
    val enableTorch: Boolean = false,
    val scanningRegion: ScanningRegion? = null
)

enum class CameraFacing {
    FRONT, BACK
}

enum class AspectRatio {
    RATIO_16_9, RATIO_4_3, RATIO_1_1
}

enum class PreviewSize {
    LOW,      // 640x480
    MEDIUM,   // 1280x720
    HIGH,     // 1920x1080
    OPTIMAL   // Best for device
}

data class ScanningRegion(
    val widthDp: Int = 250,
    val heightDp: Int = 250,
    val centerX: Float = 0.5f, // 0.0-1.0 (percentage)
    val centerY: Float = 0.5f  // 0.0-1.0 (percentage)
)
```

#### 4.2.3 Callback Interfaces

```kotlin
interface FrameProcessor {
    /**
     * Process camera frame for analysis
     * Called on background thread
     * 
     * @param frame The camera frame data
     * @return true to continue processing, false to stop
     */
    fun processFrame(frame: CameraFrame): Boolean
}

data class CameraFrame(
    val data: ByteArray,
    val width: Int,
    val height: Int,
    val format: Int, // ImageFormat constant
    val rotation: Int, // 0, 90, 180, 270
    val timestamp: Long,
    val scanningRegion: Rect? = null
)

interface CameraListener {
    fun onCameraOpened()
    fun onCameraError(error: CameraError)
    fun onCameraClosed()
    fun onFocusStateChanged(focused: Boolean)
}

sealed class CameraError(val message: String, val cause: Throwable? = null) {
    class PermissionDenied : CameraError("Camera permission denied")
    class InitializationFailed(cause: Throwable?) : CameraError("Failed to initialize camera", cause)
    class CameraInUse : CameraError("Camera is being used by another app")
    class CameraDisconnected : CameraError("Camera was disconnected")
    class Unknown(cause: Throwable?) : CameraError("Unknown camera error", cause)
}
```

### 4.3 Implementation Approach

#### 4.3.1 Camera API Selection
The implementation will use **CameraX** library as the primary choice because:
- Provides consistent API across all Android versions (API 21+)
- Handles lifecycle management automatically
- Simplifies common use cases (preview, analysis, capture)
- Battle-tested by Google and widely adopted
- Active development and support

**Fallback Strategy:**
- If CameraX is not available or fails, fall back to Camera2 API (API 21+)
- For legacy support, consider Camera API (deprecated but stable)

#### 4.3.2 Threading Model
- **Main Thread:** UI updates, user interactions, lifecycle events
- **Camera Thread:** Camera operations, preview rendering (managed by CameraX)
- **Analysis Thread:** Frame processing, QR code detection (Executors.newSingleThreadExecutor)
- **Callback Thread:** Configurable - callbacks can be dispatched to main or background thread

#### 4.3.3 Memory Management
- Use object pooling for frequently allocated objects (ByteArray, Bitmap)
- Implement frame buffer reuse to minimize garbage collection
- Release resources immediately when not needed
- Monitor memory usage with Android Profiler during development

### 4.4 Dependencies

#### 4.4.1 Required Dependencies
```gradle
dependencies {
    // CameraX core library
    implementation "androidx.camera:camera-core:1.3.0"
    implementation "androidx.camera:camera-camera2:1.3.0"
    implementation "androidx.camera:camera-lifecycle:1.3.0"
    implementation "androidx.camera:camera-view:1.3.0"
    
    // AndroidX and Kotlin
    implementation "androidx.core:core-ktx:1.12.0"
    implementation "androidx.appcompat:appcompat:1.6.1"
    
    // Optional: ML Kit for QR code detection (Google Play Services)
    implementation "com.google.android.gms:play-services-mlkit-barcode-scanning:18.3.0"
    
    // Alternative: ZXing for QR code detection (no Play Services required)
    implementation "com.google.zxing:core:3.5.2"
}
```

#### 4.4.2 Permissions Required
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```

## 5. UI/UX Specifications

### 5.1 Visual Design

#### 5.1.1 Camera Preview Screen
```
┌─────────────────────────────────────┐
│  [←]              [⚡] [↻]          │  <- Header: Back, Torch, Switch Camera
├─────────────────────────────────────┤
│                                     │
│                                     │
│         ┌─────────────┐             │
│         │             │             │  <- Camera Preview with
│         │   QR Box    │             │     scanning region overlay
│         │             │             │
│         └─────────────┘             │
│                                     │
│   "Position QR code in frame"       │  <- Instruction text
│                                     │
├─────────────────────────────────────┤
│         [Stop Scanning]             │  <- Action button
└─────────────────────────────────────┘
```

#### 5.1.2 Scanning Region Overlay
- Semi-transparent dark overlay outside scanning region (50% opacity)
- Bright border around scanning region (white or app theme color)
- Animated corner brackets to indicate active scanning area
- Optional: Scanning line animation moving vertically

#### 5.1.3 Visual Feedback
- **Successful Scan:** Green flash or checkmark animation
- **Focus Lock:** Brief highlight of focus point
- **Error State:** Red border with error message below camera view
- **Loading State:** Spinner overlay during initialization

### 5.2 User Interactions

#### 5.2.1 Gestures
- **Tap:** Focus at tapped point (tap-to-focus)
- **Pinch:** Zoom in/out (if supported)
- **Double Tap:** Reset zoom to 1x
- **Long Press:** Lock focus and exposure (advanced feature)

#### 5.2.2 Controls
- **Torch Button:** Toggle flashlight on/off (icon changes state)
- **Switch Camera Button:** Toggle between front/rear cameras
- **Start/Stop Button:** Control scanning state
- **Settings Button (optional):** Access camera settings

### 5.3 Accessibility Features

#### 5.3.1 Content Descriptions
```kotlin
// Example content descriptions
torchButton.contentDescription = if (torchEnabled) {
    "Torch is on. Tap to turn off."
} else {
    "Torch is off. Tap to turn on."
}

switchCameraButton.contentDescription = "Switch camera. Currently using $currentCamera camera."
scanButton.contentDescription = if (isScanning) "Stop scanning" else "Start scanning"
```

#### 5.3.2 Haptic Feedback
- Provide haptic feedback on successful QR code detection
- Vibrate on focus lock
- Use different vibration patterns for different events

#### 5.3.3 Audio Feedback
- Optional: Play sound on successful scan
- Provide audio cues for camera state changes
- Support disabling audio feedback in settings

## 6. Testing Requirements

### 6.1 Unit Tests

#### 6.1.1 Component Tests
- **UT-001:** Test camera configuration object creation and validation
- **UT-002:** Test scanning region calculation and bounds checking
- **UT-003:** Test frame processor callback invocation
- **UT-004:** Test error handling and error state transitions
- **UT-005:** Test lifecycle state management

#### 6.1.2 Mock Testing
- **UT-006:** Test camera controller with mock camera implementation
- **UT-007:** Test frame processor manager with mock frames
- **UT-008:** Test permission handling with mock permission results

### 6.2 Integration Tests

#### 6.2.1 Camera API Integration
- **IT-001:** Test camera initialization with real Camera2/CameraX APIs
- **IT-002:** Test preview start/stop cycles
- **IT-003:** Test camera switching
- **IT-004:** Test frame capture and processing pipeline
- **IT-005:** Test torch control

#### 6.2.2 Lifecycle Integration
- **IT-006:** Test camera behavior during Activity lifecycle (pause/resume)
- **IT-007:** Test camera behavior during configuration changes (rotation)
- **IT-008:** Test camera behavior when interrupted by other apps

### 6.3 UI Tests

#### 6.3.1 User Interaction Tests
- **UI-001:** Test camera preview renders correctly
- **UI-002:** Test tap-to-focus interaction
- **UI-003:** Test pinch-to-zoom gesture
- **UI-004:** Test torch button toggle
- **UI-005:** Test camera switch button
- **UI-006:** Test scanning region overlay display

#### 6.3.2 Accessibility Tests
- **UI-007:** Test content descriptions are present
- **UI-008:** Test minimum touch target sizes
- **UI-009:** Test color contrast ratios
- **UI-010:** Test screen reader navigation

### 6.4 Performance Tests

#### 6.4.1 Performance Benchmarks
- **PT-001:** Measure camera initialization time (target: < 2s)
- **PT-002:** Measure frame processing time (target: < 100ms)
- **PT-003:** Measure CPU usage during preview (target: < 10%)
- **PT-004:** Measure memory allocation and GC frequency
- **PT-005:** Measure battery drain (target: < 5% per minute)

### 6.5 Device Compatibility Tests

#### 6.5.1 Device Matrix
Test on devices representing:
- Low-end devices (2GB RAM, older processors)
- Mid-range devices (4GB RAM, mid-tier processors)
- High-end devices (8GB+ RAM, flagship processors)
- Various Android versions (API 21, 24, 28, 30, 33, 34)
- Different manufacturers (Samsung, Google, Xiaomi, etc.)
- Various screen sizes (small, normal, large, xlarge)

#### 6.5.2 Compatibility Scenarios
- **DC-001:** Test on devices without autofocus
- **DC-002:** Test on devices with single camera
- **DC-003:** Test on devices with multiple cameras
- **DC-004:** Test on devices with physical camera button
- **DC-005:** Test on foldable devices

## 7. Implementation Guidelines

### 7.1 Development Phases

#### Phase 1: Core Camera Implementation (Week 1-2)
- [ ] Set up CameraX integration
- [ ] Implement basic camera preview
- [ ] Implement camera lifecycle management
- [ ] Implement permission handling
- [ ] Basic error handling

#### Phase 2: Advanced Features (Week 3)
- [ ] Implement scanning region overlay
- [ ] Implement frame processing pipeline
- [ ] Implement camera switching
- [ ] Implement torch control
- [ ] Implement tap-to-focus

#### Phase 3: UI/UX Polish (Week 4)
- [ ] Implement visual feedback animations
- [ ] Implement accessibility features
- [ ] Implement gesture support (zoom)
- [ ] UI/UX refinements

#### Phase 4: Testing and Optimization (Week 5)
- [ ] Write unit and integration tests
- [ ] Performance optimization
- [ ] Device compatibility testing
- [ ] Bug fixes and refinements

#### Phase 5: Documentation and Deployment (Week 6)
- [ ] API documentation
- [ ] Integration guide for app developers
- [ ] Sample app/demo
- [ ] Release preparation

### 7.2 Code Quality Standards

#### 7.2.1 Kotlin Style Guide
- Follow official Kotlin coding conventions
- Use meaningful variable and function names
- Maximum function length: 50 lines
- Maximum class length: 500 lines
- Use sealed classes for state management
- Prefer composition over inheritance

#### 7.2.2 Documentation
- All public APIs must have KDoc comments
- Include usage examples in documentation
- Document thread safety guarantees
- Document lifecycle requirements
- Include @throws annotations for exceptions

#### 7.2.3 Error Handling
- Use sealed classes for typed errors
- Never swallow exceptions silently
- Log detailed error information
- Provide recovery suggestions in error messages
- Use custom exceptions for domain-specific errors

### 7.3 Security Considerations

#### 7.3.1 Camera Access Security
- Request camera permission only when needed
- Clear explanation for permission request
- Handle permission denial gracefully
- Never force users to grant permissions
- Respect user privacy preferences

#### 7.3.2 Data Security
- Never transmit camera frames over network without encryption
- Don't cache sensitive data from camera
- Implement secure memory clearing for sensitive data
- Follow OWASP Mobile Security guidelines
- Regular security audits

### 7.4 Performance Optimization

#### 7.4.1 Memory Optimization
- Reuse buffers for frame processing
- Implement object pooling for frequently allocated objects
- Monitor and prevent memory leaks
- Use appropriate image formats (YUV vs RGB)
- Downsample images when possible

#### 7.4.2 CPU Optimization
- Process frames on background thread
- Implement frame skipping to prevent backlog
- Use hardware acceleration when available
- Optimize image processing algorithms
- Profile and optimize hot paths

#### 7.4.3 Battery Optimization
- Release camera when not in use
- Use appropriate frame rate for analysis
- Disable preview when app is in background
- Optimize wake locks usage
- Monitor battery impact during testing

## 8. Maintenance and Support

### 8.1 Version Management

#### 8.1.1 Semantic Versioning
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking API changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes, backward compatible

#### 8.1.2 Deprecation Policy
- Announce deprecations at least 2 minor versions in advance
- Provide migration guides for deprecated APIs
- Support deprecated APIs for at least 6 months
- Clear documentation of deprecated features

### 8.2 Support Channels

#### 8.2.1 Issue Tracking
- Use GitHub Issues for bug reports and feature requests
- Issue templates for bugs, features, and questions
- Triage issues within 48 hours
- Regular milestone planning

#### 8.2.2 Documentation
- Maintain comprehensive API documentation
- Provide integration tutorials
- Share common troubleshooting guides
- Keep changelog up to date

### 8.3 Monitoring and Analytics

#### 8.3.1 Error Monitoring
- Integrate crash reporting (e.g., Firebase Crashlytics)
- Monitor camera initialization failures
- Track permission denial rates
- Monitor frame processing errors

#### 8.3.2 Performance Monitoring
- Track camera initialization time
- Monitor frame processing performance
- Track memory usage patterns
- Monitor battery impact

## 9. Future Enhancements

### 9.1 Potential Features
- **Advanced Focus Control:** Manual focus control, focus bracketing
- **HDR Preview:** High dynamic range preview for better QR detection in challenging lighting
- **Multi-code Detection:** Detect multiple QR codes simultaneously
- **Video Recording:** Add capability to record video
- **Image Capture:** Capture still images from preview
- **Beauty Filters:** Apply real-time filters to preview (for front camera)
- **AR Overlays:** Augmented reality overlays on camera preview

### 9.2 Integration Opportunities
- **ML Kit Integration:** Use ML Kit for enhanced barcode detection
- **Google Lens:** Deep link to Google Lens for advanced recognition
- **Cloud Vision API:** Optional cloud-based image analysis
- **Custom ML Models:** Support for custom TensorFlow Lite models

## 10. References

### 10.1 Android Documentation
- [CameraX Overview](https://developer.android.com/training/camerax)
- [Camera2 API Guide](https://developer.android.com/reference/android/hardware/camera2/package-summary)
- [Android Camera Best Practices](https://developer.android.com/training/camera)
- [Requesting Permissions](https://developer.android.com/training/permissions/requesting)

### 10.2 Libraries and Tools
- [CameraX GitHub Repository](https://github.com/androidx/androidx/tree/androidx-main/camera)
- [ML Kit Barcode Scanning](https://developers.google.com/ml-kit/vision/barcode-scanning/android)
- [ZXing Library](https://github.com/zxing/zxing)
- [Android Profiler](https://developer.android.com/studio/profile/android-profiler)

### 10.3 Design Guidelines
- [Material Design - Camera](https://material.io/components)
- [Android Accessibility Guide](https://developer.android.com/guide/topics/ui/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 11. Appendix

### 11.1 Glossary
- **CameraX:** Jetpack library that simplifies camera app development
- **Camera2:** Low-level camera API for Android (API 21+)
- **YUV:** Color encoding system used for camera frames
- **Autofocus:** Automatic camera focusing system
- **QR Box:** Visual overlay indicating scanning region
- **Frame Rate:** Number of frames processed per second (fps)

### 11.2 Change Log
- **v1.0.0 (2026-02-14):** Initial specification document

### 11.3 Contributors
- Project Team: Share Now Development Team
- Technical Review: [To be assigned]
- Security Review: [To be assigned]

---

**Document Status:** This is a living document and will be updated as requirements evolve and implementation progresses.
