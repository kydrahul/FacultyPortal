import { Card } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Minus } from 'lucide-react';

interface Session {
    id: string;
    date: string | Date;
    startTime: string;
    roomNumber?: string;
}

interface Student {
    id: number | string;
    name: string;
    rollNo: string;
    attendancePercentage: number;
    sessions: Record<string, 'present' | 'absent'>;
}

interface EnrolledStudentsListProps {
    students: Student[];
    sessions: Session[];
    totalStudents: number;
}

export const EnrolledStudentsList = ({ students, sessions, totalStudents }: EnrolledStudentsListProps) => {
    return (
        <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Enrolled Students ({totalStudents})</h3>

            {students.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-4" />
                    <p>No students enrolled yet</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium mb-2">{totalStudents} students enrolled</p>
                    <p className="text-sm">No classes conducted yet. Generate a session to start marking attendance.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2">
                                <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                                    Student
                                </th>
                                <th className="border-l border-border w-px"></th>
                                {sessions.map((session) => {
                                    const sessionDate = new Date(session.date);
                                    return (
                                        <th key={session.id} className="text-center py-3 px-2 font-medium text-xs text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{sessionDate.getDate()}/{sessionDate.getMonth() + 1}</span>
                                                <span className="text-[10px] opacity-70">{session.startTime}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const attendancePercentage = student.attendancePercentage || 0;

                                return (
                                    <tr key={student.id} className="border-b hover:bg-muted/30 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.rollNo}</p>
                                                </div>
                                                <span className={`text-sm font-bold whitespace-nowrap ${attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {attendancePercentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="border-l border-border"></td>
                                        {sessions.map((session) => {
                                            const status = student.sessions[session.id] || 'absent';
                                            return (
                                                <td key={session.id} className="text-center py-4 px-2">
                                                    <div className="flex justify-center">
                                                        <div
                                                            className={`w-7 h-7 rounded flex items-center justify-center ${status === 'present' ? 'bg-green-500' :
                                                                    status === 'absent' ? 'bg-red-500' : 'bg-gray-300'
                                                                }`}
                                                            title={`${status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Not Marked'}`}
                                                        >
                                                            {status === 'present' ? (
                                                                <CheckCircle className="w-4 h-4 text-white" />
                                                            ) : status === 'absent' ? (
                                                                <XCircle className="w-4 h-4 text-white" />
                                                            ) : (
                                                                <Minus className="w-4 h-4 text-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};
