# Dashboard.tsx Refactoring Guide

## Overview
This guide provides step-by-step instructions to refactor `Dashboard.tsx` by integrating the `useAttendance` hook and removing mock data.

## Step 1: Add Import for useAttendance Hook

**Location:** Top of `Dashboard.tsx`, after existing imports (around line 42)

**Add this line:**
```typescript
import { useAttendance } from '@/hooks/useAttendance';
```

## Step 2: Update API Imports

**Location:** Line 42 in `Dashboard.tsx`

**Change from:**
```typescript
import { listCourses, deleteCourse, generateQr } from '@/services/api';
```

**Change to:**
```typescript
import { listCourses, deleteCourse, generateQr, getSessionAttendance, listCourseStudents } from '@/services/api';
```

## Step 3: Add State for Current Session ID

**Location:** After line 95 (after `attendanceList` state declaration)

**Add:**
```typescript
const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
```

## Step 4: Replace Mock studentList with useAttendance Hook

**Location:** Lines 203-209 (the mock student list initialization)

**Remove these lines:**
```typescript
const [studentList, setStudentList] = useState<Student[]>([
  { id: 1, name: 'Aarav Sharma', roll: 'CSE2021001', status: null },
  { id: 2, name: 'Ananya Patel', roll: 'CSE2021002', status: null },
  { id: 3, name: 'Arjun Singh', roll: 'CSE2021003', status: null },
  { id: 4, name: 'Diya Gupta', roll: 'CSE2021004', status: null },
  { id: 5, name: 'Ishaan Kumar', roll: 'CSE2021005', status: null },
]);
```

**Replace with:**
```typescript
// Use custom hook for attendance management
const { studentList, setStudentList, liveAttendanceList, setLiveAttendanceList } = useAttendance(
  selectedCourse?.id || null,
  qrActive,
  currentSessionId
);
```

## Step 5: Update generateQR Function

**Location:** Around line 226

**Find the `generateQR` function and add sessionId storage**

**After the line `setCourseQRValue(response.qrData);` add:**
```typescript
setCurrentSessionId(response.sessionId); // Store session ID for live attendance
setLiveAttendanceList([]); // Reset live attendance list
```

## Step 6: Update regenerateQR Function  

**Location:** Around line 252

**After the line `setCourseQRValue(response.qrData);` add:**
```typescript
setCurrentSessionId(response.sessionId); // Update session ID
```

## Step 7: Update Live Attendance Display

**Location:** Around lines 1186-1200 (the Live Attendance List section)

**Find this code:**
```typescript
{attendanceList.length === 0 ? (
  <div className="text-center py-12 text-muted-foreground">
    <Users size={48} className="mx-auto mb-4" />
    <p>No students marked present yet</p>
  </div>
) : (
  attendanceList.map(student => (
    // ... student display code
  ))
)}
```

**Change `attendanceList` to `liveAttendanceList`:**
```typescript
{liveAttendanceList.length === 0 ? (
  <div className="text-center py-12 text-muted-foreground">
    <Users size={48} className="mx-auto mb-4" />
    <p>No students marked present yet</p>
  </div>
) : (
  liveAttendanceList.map(student => (
    // ... student display code
  ))
)}
```

## Step 8: Update Session Statistics

**Location:** Around line 1166 (Present/Absent count display)

**Update to use live attendance:**
```typescript
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">Present</span>
    <span className="font-semibold text-green-600">{liveAttendanceList.length}</span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">Absent</span>
    <span className="font-semibold text-red-600">{studentList.length - liveAttendanceList.length}</span>
  </div>
</div>
```

## Summary of Changes

1. ✅ Created `useAttendance` hook in `src/hooks/useAttendance.ts`
2. Import the hook into `Dashboard.tsx`
3. Add API function imports (`getSessionAttendance`, `listCourseStudents`)
4. Add `currentSessionId` state variable
5. Replace mock `studentList` with hook
6. Store session ID in `generateQR` and `regenerateQR`
7. Use `liveAttendanceList` instead of `attendanceList` for display
8. Update statistics to use live data

## Testing

After making these changes:
1. Select a course
2. Generate QR code
3. Have a student scan the QR
4. Verify the student's name appears in Live Attendance within 3 seconds
5. Check that the enrolled students list shows real data

## Notes

- The hook automatically polls every 3 seconds when QR is active
- Enrolled students are fetched whenever a course is selected
- All mock data has been removed
- Real-time updates happen automatically
