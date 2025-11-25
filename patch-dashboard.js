// Node.js script to patch Dashboard.tsx
const fs = require('fs');
const path = require('path');

const sourcePath = 'src/pages/Dashboard.tsx';
const backupPath = 'src/pages/Dashboard.tsx.backup';
const outputPath = 'src/pages/Dashboard_refactored.tsx';

console.log('=== Dashboard.tsx Refactoring Script ===\n');

// Check if source exists
if (!fs.existsSync(sourcePath)) {
    console.error('ERROR: Source file not found:', sourcePath);
    process.exit(1);
}

// Create backup
console.log('1. Creating backup...');
fs.copyFileSync(sourcePath, backupPath);
console.log('   ✓ Backup created:', backupPath);

// Read file
console.log('2. Reading source file...');
const content = fs.readFileSync(sourcePath, 'utf8');
const lines = content.split('\n');

console.log('3. Applying changes...');
const output = [];
let skipLines = 0;

for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    if (skipLines > 0) {
        skipLines--;
        continue;
    }

    // Change 1: Update imports on line 42
    if (lineNum === 42 && line.includes("from '@/services/api'")) {
        console.log('   - Line', lineNum, ': Adding imports');
        output.push("import { listCourses, deleteCourse, generateQr, getSessionAttendance, listCourseStudents } from '@/services/api';");
        output.push("import { useAttendance } from '@/hooks/useAttendance';");
        continue;
    }

    // Change 2: Update Student interface id type (line 67)
    if (lineNum === 67 && line.match(/^\s*id: number;/)) {
        console.log('   - Line', lineNum, ': Updating Student interface');
        output.push("  id: number | string;");
        continue;
    }

    // Change 3: Add currentSessionId after line 95
    if (lineNum === 95 && line.includes('attendanceList') && line.includes('useState')) {
        console.log('   - Line', lineNum, ': Adding currentSessionId state');
        output.push(line);
        output.push("  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);");
        continue;
    }

    // Change 4: Replace mock studentList (lines 203-209)
    if (lineNum === 203 && line.includes('const [studentList')) {
        console.log('   - Lines 203-209: Replacing with useAttendance hook');
        output.push("  // Use custom hook for attendance management");
        output.push("  const { studentList, setStudentList, liveAttendanceList, setLiveAttendanceList } = useAttendance(");
        output.push("    selectedCourse?.id || null,");
        output.push("    qrActive,");
        output.push("    currentSessionId");
        output.push("  );");
        skipLines = 6;  // Skip next 6 lines
        continue;
    }

    // Change 5: Update generateQR (after line 244)
    if (lineNum === 244 && line.includes('setCourseQRValue')) {
        console.log('   - Line', lineNum, ': Updating generateQR');
        output.push(line);
        output.push("      setCurrentSessionId(response.sessionId); // Store session ID for live attendance");
        output.push("      setLiveAttendanceList([]); // Reset live attendance list");
        continue;
    }

    // Change 6: Update regenerateQR (after line 268)
    if (lineNum === 268 && line.includes('setCourseQRValue') && line.includes('qrData')) {
        console.log('   - Line', lineNum, ': Updating regenerateQR');
        output.push(line);
        output.push("      setCurrentSessionId(response.sessionId); // Update session ID");
        continue;
    }

    // Change 7: Update live attendance display
    if (line.includes('attendanceList.length')) {
        console.log('   - Line', lineNum, ': Updating attendance length check');
        output.push(line.replace(/attendanceList\.length/g, 'liveAttendanceList.length'));
        continue;
    }

    if (line.includes('attendanceList.map')) {
        console.log('   - Line', lineNum, ': Updating attendance map');
        output.push(line.replace(/attendanceList\.map/g, 'liveAttendanceList.map'));
        continue;
    }

    // Keep line as-is
    output.push(line);
}

// Save refactored file
console.log('4. Saving refactored file...');
fs.writeFileSync(outputPath, output.join('\n'), 'utf8');
console.log('   ✓ Saved:', outputPath);

console.log('\n=== Refactoring Complete! ===\n');
console.log('Next steps:');
console.log('  1. Review:', outputPath);
console.log('  2. If good, replace: mv', outputPath, sourcePath);
console.log('  3. Or restore: mv', backupPath, sourcePath);
console.log('');
