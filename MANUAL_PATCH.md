# Manual Patch Instructions for Dashboard.tsx

Due to the file's complexity, please manually apply these precise changes:

## Change 1: Add Imports (Line 42-43)
After line 42, add these two lines:
```typescript
import { listCourses, deleteCourse, generateQr, getSessionAttendance, listCourseStudents } from '@/services/api';
import { useAttendance } from '@/hooks/useAttendance';
```

## Change 2: Update Student Interface (Line 67)
Change line 67 from:
```typescript
  id: number;
```
To:
```typescript
  id: number | string;
```

## Change 3: Add currentSessionId State (After line 95)
After `const [attendanceList, setAttendanceList] = useState<AttendedStudent[]>([]);`
Add:
```typescript
const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
```

## Change 4: Replace Mock Student List (Lines 204-210)
Replace the entire mock student list initialization with:
```typescript
// Use custom hook for attendance management
const { studentList, setStudentList, liveAttendanceList, setLiveAttendanceList } = useAttendance(
  selectedCourse?.id || null,
  qrActive,
  currentSessionId
);
```

## Change 5: Update generateQR Function (After line 245)
After `setCourseQRValue(response.qrData);` add these two lines:
```typescript
setCurrentSessionId(response.sessionId); // Store session ID for live attendance
setLiveAttendanceList([]); // Reset live attendance list
```

## Change 6: Update regenerateQR Function (After line 267)
After `setCourseQRValue(response.qrData);` add:
```typescript
setCurrentSessionId(response.sessionId); // Update session ID
```

## Change 7: Update Live Attendance Display (Line 1194 and 1200)
Change line 1194 from `attendanceList.length` to `liveAttendanceList.length`
Change line 1200 from `attendanceList.map` to `liveAttendanceList.map`

## Summary
These changes will:
- Remove all mock data
- Integrate the useAttendance hook 
- Enable real-time attendance polling every 3 seconds
- Display actual student names from the database

The hook automatically:
- Fetches enrolled students when you select a course
- Polls for live attendance when QR is active
- Updates the UI with real data

---

**Note:** If you prefer, I can create a completely new Dashboard.tsx file with all changes applied, which you can then replace the existing one with.
