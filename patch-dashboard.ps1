# PowerShell script to patch Dashboard.tsx - Line-by-line approach
# This is safer and more reliable than regex replacement

$sourcePath = "src/pages/Dashboard.tsx"
$backupPath = "src/pages/Dashboard.tsx.backup"
$outputPath = "src/pages/Dashboard_refactored.tsx"

Write-Host "=== Dashboard.tsx Refactoring Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if source file exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "ERROR: Source file not found: $sourcePath" -ForegroundColor Red
    exit 1
}

# Create backup
Write-Host "1. Creating backup..." -ForegroundColor Yellow
Copy-Item $sourcePath $backupPath -Force
Write-Host "   ✓ Backup created: $backupPath" -ForegroundColor Green

# Read all lines
Write-Host "2. Reading source file..." -ForegroundColor Yellow
$lines = Get-Content $sourcePath

Write-Host "3. Applying changes..." -ForegroundColor Yellow
$output = @()
$lineNum = 0
$skipNext = 0

foreach ($line in $lines) {
    $lineNum++
    
    if ($skipNext -gt 0) {
        $skipNext--
        continue
    }
    
    # Change 1: Add import after line 42
    if ($lineNum -eq 42 -and $line -match "import.*from '@/services/api'") {
        Write-Host "   - Line $lineNum : Adding imports" -ForegroundColor Gray
        $output += "import { listCourses, deleteCourse, generateQr, getSessionAttendance, listCourseStudents } from '@/services/api';"
        $output += "import { useAttendance } from '@/hooks/useAttendance';"
        continue
    }
    
    # Change 2: Update Student interface id type (line 67)
    if ($lineNum -eq 67 -and $line -match "^\s*id: number;") {
        Write-Host "   - Line $lineNum : Updating Student interface" -ForegroundColor Gray
        $output += "  id: number | string;"
        continue
    }
    
    # Change 3: Add currentSessionId after line 95
    if ($lineNum -eq 95 -and $line -match "attendanceList.*useState") {
        Write-Host "   - Line $lineNum : Adding currentSessionId state" -ForegroundColor Gray
        $output += $line
        $output += "  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);"
        continue
    }
    
    # Change 4: Skip mock studentList (lines 203-209)
    if ($lineNum -eq 203 -and $line -match "const \[studentList") {
        Write-Host "   - Lines 203-209: Replacing with useAttendance hook" -ForegroundColor Gray
        $output += "  // Use custom hook for attendance management"
        $output += "  const { studentList, setStudentList, liveAttendanceList, setLiveAttendanceList } = useAttendance("
        $output += "    selectedCourse?.id || null,"
        $output += "    qrActive,"
        $output += "    currentSessionId"
        $output += "  );"
        $skipNext = 6  # Skip the next 6 lines (mock data)
        continue
    }
    
    # Change 5: Update generateQR function (after line 244)
    if ($lineNum -eq 244 -and $line -match "setCourseQRValue") {
        Write-Host "   - Line $lineNum : Updating generateQR" -ForegroundColor Gray
        $output += $line
        $output += "      setCurrentSessionId(response.sessionId); // Store session ID for live attendance"
        $output += "      setLiveAttendanceList([]); // Reset live attendance list"
        continue
    }
    
    # Change 6: Update regenerateQR function (after line 268)
    if ($lineNum -eq 268 -and $line -match "setCourseQRValue.*qrData") {
        Write-Host "   - Line $lineNum : Updating regenerateQR" -ForegroundColor Gray
        $output += $line
        $output += "      setCurrentSessionId(response.sessionId); // Update session ID"
        continue
    }
    
    # Change 7a: Update live attendance display - length check
    if ($line -match "attendanceList\.length === 0") {
        Write-Host "   - Line $lineNum : Updating attendance length check" -ForegroundColor Gray
        $output += $line -replace "attendanceList\.length", "liveAttendanceList.length"
        continue
    }
    
    # Change 7b: Update live attendance display - map
    if ($line -match "attendanceList\.map\(student") {
        Write-Host "   - Line $lineNum : Updating attendance map" -ForegroundColor Gray
        $output += $line -replace "attendanceList\.map", "liveAttendanceList.map"
        continue
    }
    
    # Default: keep the line as-is
    $output += $line
}

# Save the refactored file
Write-Host "4. Saving refactored file..." -ForegroundColor Yellow
$output | Set-Content $outputPath -Encoding UTF8
Write-Host "   ✓ Saved: $outputPath" -ForegroundColor Green

Write-Host ""
Write-Host "=== Refactoring Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review: code $outputPath"
Write-Host "  2. Replace original: Move-Item $outputPath $sourcePath -Force"
Write-Host "  3. Or restore backup: Move-Item $backupPath $sourcePath -Force"
Write-Host ""
