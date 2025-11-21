# Flutter Student App Integration Guide

This document provides comprehensive guidance for integrating the Flutter student app with the faculty portal backend.

## Overview

The student app enables students to:
- ✅ Scan QR codes for attendance marking
- ✅ View their attendance records
- ✅ View class schedule/timetable
- ✅ Join courses via join code
- ✅ Auto-sync timetable when enrolled in a course

## Authentication Flow

### Student Login

Students use the **same Firebase project** as the faculty app for authentication.

**Implementation**:
```dart
// In Flutter app
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

Future<UserCredential?> signInWithGoogle() async {
  final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
  final GoogleSignInAuthentication? googleAuth = await googleUser?.authentication;
  
  final credential = GoogleAuthProvider.credential(
    accessToken: googleAuth?.accessToken,
    idToken: googleAuth?.idToken,
  );
  
  final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
  
  // Validate institutional email
  if (!userCredential.user?.email?.endsWith('@iiitnr.edu.in') ?? true) {
    await FirebaseAuth.instance.signOut();
    throw Exception('Please use your institutional email (@iiitnr.edu.in)');
  }
  
  return userCredential;
}
```

### JWT Token Handling

After successful authentication, get the Firebase ID token for API requests:

```dart
Future<String?> getIdToken() async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) return null;
  return await user.getIdToken();
}

// Use in API requests
Future<http.Response> makeAuthenticatedRequest(String endpoint) async {
  final token = await getIdToken();
  return http.get(
    Uri.parse('$API_BASE$endpoint'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
  );
}
```

---

## Required API Endpoints

### Backend Setup

The backend needs to implement these endpoints for student functionality:

#### 1. Join Course via Join Code

**Endpoint**: `POST /api/student/join-course`

**Request Body**:
```json
{
  "joinCode": "ABC123"
}
```

**Response**:
```json
{
  "success": true,
  "course": {
    "id": "course_id",
    "code": "CS101",
    "name": "Data Structures",
    "section": "A",
    "credits": 3,
    "department": "CSE",
    "academicYear": "2024",
    "className": "CSE2024",
    "semester": "5",
    "session": "Spring",
    "timetable": [
      {
        "day": "Monday",
        "time": "09:00 AM - 10:00 AM",
        "type": "theory",
        "room": "LH-101"
      }
    ]
  }
}
```

**Backend Logic**:
- Verify join code exists and is valid
- Check if student is already enrolled
- Add student to course enrollment
- Return course details including timetable

#### 2. Scan QR Code for Attendance

**Endpoint**: `POST /api/student/scan-qr`

**Request Body**:
```json
{
  "qrData": "{\"type\":\"course-attendance\",\"courseId\":\"...\",\"timestamp\":1234567890,\"expiresIn\":300}",
  "location": {
    "latitude": 21.1234,
    "longitude": 79.5678,
    "accuracy": 10.5
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "attendanceRecord": {
    "courseId": "course_id",
    "courseName": "Data Structures",
    "timestamp": "2025-11-20T12:30:00Z",
    "status": "present"
  }
}
```

**Response (Error - Outside Geofence)**:
```json
{
  "success": false,
  "error": "You are outside the allowed location radius",
  "distance": 150.5
}
```

**Backend Logic**:
- Parse and validate QR data
- Check if QR code is expired
- Verify student is enrolled in the course
- Validate geofence (if location data provided)
- Mark attendance
- Prevent duplicate attendance for same session

#### 3. Get Enrolled Courses

**Endpoint**: `GET /api/student/courses`

**Response**:
```json
{
  "courses": [
    {
      "id": "course_id",
      "code": "CS101",
      "name": "Data Structures",
      "section": "A",
      "credits": 3,
      "facultyName": "Dr. Faculty Name",
      "enrolledDate": "2025-01-15T10:00:00Z",
      "timetable": [...]
    }
  ]
}
```

#### 4. Get Attendance Records

**Endpoint**: `GET /api/student/attendance?courseId={courseId}`

**Query Parameters**:
- `courseId` (optional): Filter by specific course

**Response**:
```json
{
  "attendance": [
    {
      "courseId": "course_id",
      "courseCode": "CS101",
      "courseName": "Data Structures",
      "date": "2025-11-20",
      "timestamp": "2025-11-20T09:15:00Z",
      "status": "present",
      "markedBy": "qr-scan"
    }
  ],
  "summary": {
    "totalClasses": 30,
    "attended": 27,
    "percentage": 90.0
  }
}
```

#### 5. Get Student Timetable

**Endpoint**: `GET /api/student/timetable`

**Response**:
```json
{
  "timetable": {
    "Monday": [
      {
        "time": "09:00 AM - 10:00 AM",
        "courseCode": "CS101",
        "courseName": "Data Structures",
        "type": "theory",
        "room": "LH-101",
        "facultyName": "Dr. Faculty Name"
      }
    ],
    "Tuesday": [...],
    "Wednesday": [...],
    "Thursday": [...],
    "Friday": [...],
    "Saturday": [...]
  }
}
```

**Backend Logic**:
- Aggregate timetables from all enrolled courses
- Sort by time for each day
- Include faculty information

---

## QR Code Data Format

The faculty app generates QR codes with this JSON structure:

```typescript
{
  "type": "course-attendance",
  "courseId": "string",           // Unique course identifier
  "timestamp": 1700000000000,     // Unix timestamp (milliseconds)
  "expiresIn": 300,               // Validity duration in seconds
  "location": {                   // Optional geofence data
    "latitude": 21.1234,
    "longitude": 79.5678,
    "radius": 25                  // Radius in meters
  }
}
```

### Flutter QR Scanning Implementation

```dart
import 'package:mobile_scanner/mobile_scanner.dart';
import 'dart:convert';

Future<void> scanQRCode() async {
  // Use mobile_scanner package
  final controller = MobileScannerController();
  
  // When QR is detected
  void onDetect(BarcodeCapture capture) async {
    final String? code = capture.barcodes.first.rawValue;
    if (code == null) return;
    
    try {
      final qrData = jsonDecode(code);
      
      // Validate QR type
      if (qrData['type'] != 'course-attendance') {
        throw Exception('Invalid QR code');
      }
      
      // Check expiration
      final timestamp = qrData['timestamp'];
      final expiresIn = qrData['expiresIn'];
      final expiryTime = timestamp + (expiresIn * 1000);
      
      if (DateTime.now().millisecondsSinceEpoch > expiryTime) {
        throw Exception('QR code has expired');
      }
      
      // Get current location
      final position = await Geolocator.getCurrentPosition();
      
      // Submit to backend
      await submitAttendance(code, position);
      
    } catch (e) {
      // Handle error
    }
  }
}
```

---

## Geofencing Validation

### Client-Side (Flutter)

```dart
import 'package:geolocator/geolocator.dart';

Future<Position> getCurrentLocation() async {
  // Request permission
  LocationPermission permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
  }
  
  // Get high-accuracy location
  return await Geolocator.getCurrentPosition(
    desiredAccuracy: LocationAccuracy.high,
  );
}
```

### Server-Side (Backend)

Implement Haversine formula to calculate distance:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Validate geofence
function validateGeofence(studentLat, studentLon, qrLocation) {
  if (!qrLocation) return true; // No geofence required
  
  const distance = calculateDistance(
    studentLat, 
    studentLon, 
    qrLocation.latitude, 
    qrLocation.longitude
  );
  
  return distance <= qrLocation.radius;
}
```

---

## Data Models

### Shared Data Structures

These models should be consistent between faculty and student apps:

#### Course Model

```dart
class Course {
  final String id;
  final String code;
  final String name;
  final String section;
  final int credits;
  final String department;
  final String academicYear;
  final String className;
  final String semester;
  final String session; // 'Spring' or 'Autumn'
  final String joinCode;
  final List<TimetableSlot> timetable;
  final String? facultyName; // For student view
  final int? enrolledCount; // For faculty view
  
  Course({...});
  
  factory Course.fromJson(Map<String, dynamic> json) {...}
  Map<String, dynamic> toJson() {...}
}
```

#### Timetable Slot Model

```dart
class TimetableSlot {
  final String day; // 'Monday', 'Tuesday', etc.
  final String time; // '09:00 AM - 10:00 AM'
  final String type; // 'theory' or 'lab'
  final String? room;
  
  TimetableSlot({...});
  
  factory TimetableSlot.fromJson(Map<String, dynamic> json) {...}
  Map<String, dynamic> toJson() {...}
}
```

#### Student Profile Model

```dart
class StudentProfile {
  final String id;
  final String name;
  final String email;
  final String rollNumber;
  final String department;
  final String academicYear;
  final String className; // e.g., 'CSE2024'
  
  StudentProfile({...});
  
  factory StudentProfile.fromJson(Map<String, dynamic> json) {...}
  Map<String, dynamic> toJson() {...}
}
```

#### Attendance Record Model

```dart
class AttendanceRecord {
  final String id;
  final String courseId;
  final String studentId;
  final DateTime timestamp;
  final String status; // 'present', 'absent'
  final String markedBy; // 'qr-scan', 'manual'
  final Location? location;
  
  AttendanceRecord({...});
  
  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {...}
  Map<String, dynamic> toJson() {...}
}
```

---

## Backend Setup Instructions

### 1. Database Schema Updates

Add these collections/tables to your backend database:

**Student Enrollments**:
```javascript
{
  studentId: String,
  courseId: String,
  enrolledAt: Timestamp,
  status: String // 'active', 'dropped'
}
```

**Attendance Records**:
```javascript
{
  id: String,
  courseId: String,
  studentId: String,
  sessionId: String, // Links to QR session
  timestamp: Timestamp,
  status: String, // 'present', 'absent'
  markedBy: String, // 'qr-scan', 'manual'
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  }
}
```

### 2. Authentication Middleware

```javascript
// middleware/auth.js
const admin = require('firebase-admin');

async function authenticateStudent(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Verify institutional email
    if (!decodedToken.email?.endsWith('@iiitnr.edu.in')) {
      return res.status(403).json({ error: 'Invalid email domain' });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 3. Example Endpoint Implementation

```javascript
// routes/student.js
const express = require('express');
const router = express.Router();

// Join course via join code
router.post('/join-course', authenticateStudent, async (req, res) => {
  const { joinCode } = req.body;
  const studentEmail = req.user.email;
  
  try {
    // Find course by join code
    const course = await db.collection('courses').findOne({ joinCode });
    
    if (!course) {
      return res.status(404).json({ error: 'Invalid join code' });
    }
    
    // Check if already enrolled
    const existing = await db.collection('enrollments').findOne({
      studentEmail,
      courseId: course.id
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    // Create enrollment
    await db.collection('enrollments').insertOne({
      studentEmail,
      courseId: course.id,
      enrolledAt: new Date(),
      status: 'active'
    });
    
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join course' });
  }
});

module.exports = router;
```

---

## Testing Checklist

- [ ] Student can login with @iiitnr.edu.in email
- [ ] Student can join course using join code
- [ ] Course timetable syncs to student's timetable
- [ ] Student can scan QR code and mark attendance
- [ ] Geofence validation works correctly
- [ ] Expired QR codes are rejected
- [ ] Student can view attendance records
- [ ] Student can view all enrolled courses
- [ ] Duplicate attendance for same session is prevented
- [ ] Location permission handling works on both Android and iOS

---

## Security Considerations

1. **Token Expiration**: Firebase ID tokens expire after 1 hour. Implement token refresh logic.
2. **Rate Limiting**: Prevent abuse of QR scanning endpoint
3. **Geofence Spoofing**: Consider additional validation (e.g., device fingerprinting)
4. **Join Code Security**: Generate random, unique join codes; consider expiration
5. **Data Privacy**: Ensure students can only access their own attendance data

---

## Flutter Packages Required

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  google_sign_in: ^6.1.6
  mobile_scanner: ^3.5.5
  geolocator: ^10.1.0
  http: ^1.1.2
  provider: ^6.1.1 # For state management
```

---

## Next Steps

1. **Backend**: Implement the student API endpoints listed above
2. **Flutter App**: Set up Firebase configuration and authentication
3. **Testing**: Test join code flow, QR scanning, and geofencing
4. **Deployment**: Deploy backend updates and test with real devices
