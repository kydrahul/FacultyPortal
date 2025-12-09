import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    MapPin
} from 'lucide-react';

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
    sessions: Record<string, 'present' | 'absent'>;
}

interface SessionHistoryListProps {
    sessions: Session[];
    students: Student[];
    totalStudents: number;
}

export const SessionHistoryList = ({ sessions, students, totalStudents }: SessionHistoryListProps) => {
    // Sort sessions by date descending (newest first)
    const sortedSessions = [...sessions].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
    });

    return (
        <div className="space-y-4">
            {sortedSessions.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    <Calendar className="mx-auto mb-4" size={48} />
                    <p>No sessions recorded yet.</p>
                </Card>
            ) : (
                sortedSessions.map(session => (
                    <SessionCard
                        key={session.id}
                        session={session}
                        students={students}
                        totalStudents={totalStudents}
                    />
                ))
            )}
        </div>
    );
};

const SessionCard = ({ session, students, totalStudents }: { session: Session, students: Student[], totalStudents: number }) => {
    const [expanded, setExpanded] = useState(false);

    // Calculate stats for this session
    const presentStudents = students.filter(s => s.sessions[session.id] === 'present');
    const absentStudents = students.filter(s => s.sessions[session.id] !== 'present'); // treat undefined as absent/not marked

    const presentCount = presentStudents.length;
    const absentCount = totalStudents - presentCount;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    const dateStr = new Date(session.date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <div
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Session Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar size={16} className="text-primary" />
                        <h4 className="font-semibold text-lg">{dateStr}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> {session.startTime}
                        </span>
                        {session.roomNumber && (
                            <span className="flex items-center gap-1">
                                <MapPin size={14} /> {session.roomNumber}
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                        <div className="text-xs text-muted-foreground">Present</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                        <div className="text-xs text-muted-foreground">Absent</div>
                    </div>
                    <div className="w-16 h-16 relative flex items-center justify-center">
                        {/* Simple circular progress visualization */}
                        <div className="text-sm font-bold">{attendancePercentage}%</div>
                    </div>
                </div>

                <Button variant="ghost" size="icon" className="shrink-0">
                    {expanded ? <ChevronUp /> : <ChevronDown />}
                </Button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t bg-muted/20 p-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Present List */}
                        <div>
                            <h5 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                                <CheckCircle size={16} /> Present ({presentCount})
                            </h5>
                            <div className="bg-background rounded-md border p-2 max-h-60 overflow-y-auto space-y-1">
                                {presentStudents.length > 0 ? presentStudents.map(s => (
                                    <div key={s.id} className="text-sm p-2 hover:bg-muted rounded flex justify-between">
                                        <span>{s.name}</span>
                                        <span className="text-muted-foreground text-xs">{s.rollNo}</span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground p-2">No students present</p>
                                )}
                            </div>
                        </div>

                        {/* Absent List */}
                        <div>
                            <h5 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
                                <XCircle size={16} /> Absent ({absentCount})
                            </h5>
                            <div className="bg-background rounded-md border p-2 max-h-60 overflow-y-auto space-y-1">
                                {absentStudents.length > 0 ? absentStudents.map(s => (
                                    <div key={s.id} className="text-sm p-2 hover:bg-muted rounded flex justify-between">
                                        <span>{s.name}</span>
                                        <span className="text-muted-foreground text-xs">{s.rollNo}</span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground p-2">No students absent</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
