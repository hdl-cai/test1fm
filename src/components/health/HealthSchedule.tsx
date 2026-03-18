import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';
import { useCyclesStore } from '@/stores/useCyclesStore';
import { useHealthStore } from '@/stores/useHealthStore';
import type { HealthRecord } from '@/types';

interface HealthScheduleProps {
    selectedCycleId: string;
    onCycleChange: (id: string) => void;
    onAddRecord?: (date?: Date) => void;
}

/**
 * BAI Vaccination Calendar Component (V2)
 * 
 * Implements the Hybrid Schedule View:
 * - Left: Logistical Monthly Calendar with DOL markers
 * - Right: Vertical BAI 5-Step Health Timeline
 */
export function HealthSchedule({ selectedCycleId, onCycleChange, onAddRecord }: HealthScheduleProps) {
    const [viewDate, setViewDate] = React.useState(new Date());
    const { cycles } = useCyclesStore();
    const { records, getVaccinationSteps } = useHealthStore();

    const selectedCycle = React.useMemo(() =>
        cycles.find(c => c.id === selectedCycleId),
        [selectedCycleId, cycles]);

    const handleDrop = (e: React.DragEvent, targetDate: Date) => {
        e.preventDefault();
        const recordId = e.dataTransfer.getData('recordId');
        if (!recordId) return;

        // In a real app, this would call updateRecord action
        console.log(`Moving record ${recordId} to ${targetDate}`);
    };

    const handleDragStart = (e: React.DragEvent, recordId: string) => {
        e.dataTransfer.setData('recordId', recordId);
    };

    // Calendar logic
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const currentMonth = viewDate.toLocaleString('default', { month: 'long' });
    const currentYear = viewDate.getFullYear();

    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    // Get records for the current view month and selected cycle
    const monthRecords = React.useMemo(() => {
        return records.filter(record => {
            const recordDate = new Date(record.date);
            return record.cycleId === selectedCycleId &&
                recordDate.getMonth() === viewDate.getMonth() &&
                recordDate.getFullYear() === viewDate.getFullYear();
        });
    }, [viewDate, selectedCycleId, records]);

    // Group records by day
    const recordsByDay = React.useMemo(() => {
        const map: Record<number, HealthRecord[]> = {};
        monthRecords.forEach(record => {
            const day = new Date(record.date).getDate();
            if (!map[day]) map[day] = [];
            map[day].push(record);
        });
        return map;
    }, [monthRecords]);

    // DOL Calculation helper
    const getDOLForDate = (day: number) => {
        if (!selectedCycle) return null;
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const startTime = new Date(selectedCycle.startDate).getTime();
        const diffDays = Math.floor((date.getTime() - startTime) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : null;
    };

    // Dynamic Compliance Logic
    const stepsWithStatus = React.useMemo(() => {
        if (!selectedCycle) return [];
        return getVaccinationSteps(selectedCycle.id, selectedCycle.startDate);
    }, [getVaccinationSteps, selectedCycle]);

    const complianceRate = React.useMemo(() => {
        const completed = stepsWithStatus.filter(s => s.status === 'completed').length;
        return Math.round((completed / stepsWithStatus.length) * 100);
    }, [stepsWithStatus]);

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'vaccination':
                return 'text-info bg-info/10 border-info/20';
            case 'treatment':
                return 'text-danger bg-danger/10 border-danger/20';
            case 'inspection':
                return 'text-success bg-success/10 border-success/20';
            default:
                return 'text-muted-foreground bg-muted/10 border-border/40';
        }
    };

    const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <div className="space-y-6">
            {/* Header & Compliance Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Select Batch</h3>
                        <div className="flex items-center gap-3 mt-3">
                            <select
                                id="batch-selector"
                                value={selectedCycleId}
                                onChange={(e) => onCycleChange(e.target.value)}
                                className="bg-background border border-border rounded-lg px-4 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none min-w-[240px]"
                                aria-label="Select target production cycle"
                            >
                                {cycles.filter(c => c.status === 'active').map((cycle: any) => (
                                    <option key={cycle.id} value={cycle.id}>{cycle.batchName}</option>
                                ))}
                            </select>
                            <span className="text-micro font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-1 rounded">Active Cycle</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-border pl-0 md:pl-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-micro font-bold text-muted-foreground uppercase tracking-widest">Schedule Adherence</p>
                            <p className="text-xl font-bold text-foreground tabular-nums">{complianceRate}%</p>
                        </div>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center relative bg-muted/5">
                            <svg className="w-full h-full -rotate-90 absolute inset-0">
                                {/* Track circle */}
                                <circle
                                    cx="32" cy="32" r="28"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-muted/20"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="32" cy="32" r="28"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-primary transition-colors duration-1000 ease-out"
                                    strokeDasharray={`${28 * 2 * Math.PI}`}
                                    strokeDashoffset={`${28 * 2 * Math.PI * (1 - complianceRate / 100)}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="relative z-10 text-micro font-bold text-primary">BAI</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center">
                    <p className="text-micro font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Compliance Score</p>
                    <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-primary" style={{ width: `${complianceRate}%` }} />
                    </div>
                    <p className="text-micro font-medium text-muted-foreground leading-relaxed uppercase tracking-wider">
                        Guidelines strictly mirror official BAI avian health standards for Philippine biosecurity compliance.
                    </p>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Calendar Grid */}
                <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-bold text-foreground tracking-widest uppercase">{currentMonth} <span className="text-primary tabular-nums">{currentYear}</span></h3>
                            <div className="flex items-center rounded-lg bg-background border border-border p-1">
                                <button
                                    onClick={prevMonth}
                                    className="p-1.5 hover:bg-muted rounded text-muted-foreground active:scale-95 transition-colors"
                                    aria-label="Previous Month"
                                >
                                    <Icon name="ArrowLeft01Icon" size={14} />
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="p-1.5 hover:bg-muted rounded text-muted-foreground active:scale-95 transition-colors ml-1"
                                    aria-label="Next Month"
                                >
                                    <Icon name="ArrowRight01Icon" size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-micro font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-1.5 font-data">
                                <span className="w-2 h-2 rounded-full bg-info shadow-[0_0_8px_rgba(var(--info-rgb),0.5)]" /> ND Schedule
                            </span>
                            <span className="text-micro font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-1.5 ml-2 font-data">
                                <span className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgba(var(--warning-rgb),0.5)]" /> IBD Guard
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 border-b border-border bg-muted/5">
                        {dayHeaders.map(day => (
                            <div key={day} className="py-2.5 text-center text-micro font-bold text-muted-foreground tracking-widest uppercase opacity-60">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 flex-1">
                        {Array.from({ length: firstDayOfMonth(viewDate) }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[110px] border-b border-r border-border/30 bg-muted/5" />
                        ))}
                        {Array.from({ length: daysInMonth(viewDate) }).map((_, i) => {
                            const d = i + 1;
                            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();
                            const dayRecords = recordsByDay[d] || [];
                            const dol = getDOLForDate(d);

                            return (
                                <div
                                    key={`day-${d}`}
                                    className={cn(
                                        "min-h-[110px] border-b border-r border-border/30 p-2.5 relative group hover:bg-primary/[0.02] transition-colors cursor-pointer",
                                        isToday && "bg-primary/[0.03]"
                                    )}
                                    onClick={() => onAddRecord?.(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, new Date(viewDate.getFullYear(), viewDate.getMonth(), d))}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-xs font-bold tabular-nums",
                                            isToday ? "text-primary" : "text-foreground"
                                        )}>{d}</span>
                                        {dol !== null && (
                                            <span className="text-micro font-bold text-muted-foreground/40 tabular-nums uppercase">D-{dol}</span>
                                        )}
                                    </div>

                                    <div className="mt-3 space-y-1.5">
                                        {dayRecords.map(record => (
                                            <div
                                                key={record.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, record.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={cn(
                                                    "p-1.5 rounded-lg border text-micro font-bold uppercase truncate tracking-wide flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-300 cursor-move active:scale-95",
                                                    getTypeStyle(record.type)
                                                )}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                                {record.medication || record.description}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Vertical Health Timeline */}
                <div className="xl:w-96 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border bg-muted/10">
                        <h3 className="text-sm font-bold text-foreground tracking-widest uppercase">BAI Health Guidelines</h3>
                        <p className="text-micro font-bold text-muted-foreground mt-1 uppercase tracking-widest">Daily Sequence</p>
                    </div>

                    <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                        {stepsWithStatus.map((step, idx) => {
                            const isLast = idx === stepsWithStatus.length - 1;
                            const isCompleted = step.status === 'completed';
                            const isOverdue = step.status === 'overdue';

                            return (
                                <div key={step.id} className="relative flex gap-5 group">
                                    {!isLast && (
                                        <div className={cn(
                                            "absolute left-[15px] top-8 bottom-[-32px] w-[2px]",
                                            isCompleted ? "bg-primary" : "bg-border border-dashed border-l"
                                        )} />
                                    )}

                                    <div className={cn(
                                        "w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 z-10 transition-colors shadow-sm",
                                        isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                            isOverdue ? "bg-background border-danger text-danger animate-pulse" :
                                                "bg-background border-border text-muted-foreground/40"
                                    )}>
                                        {isCompleted ? <Icon name="CheckCircleIcon" size={16} /> : <span className="text-micro font-bold tabular-nums">{step.dol}</span>}
                                    </div>

                                    <div className="space-y-2 pb-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn(
                                                "text-xs font-bold uppercase tracking-wide",
                                                isCompleted ? "text-foreground" : "text-muted-foreground"
                                            )}>{step.name}</h4>
                                            <span className={cn(
                                                "text-micro font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest",
                                                isCompleted ? "bg-success/10 text-success border border-success/20" :
                                                    isOverdue ? "bg-danger/10 text-danger border border-danger/20 shadow-[0_0_10px_rgba(var(--danger-rgb),0.2)] animate-pulse" :
                                                        "bg-muted/30 text-muted-foreground border border-border/50"
                                            )}>
                                                {step.status}
                                            </span>
                                        </div>
                                        <div className="bg-muted/5 border border-border/50 rounded-xl p-3 space-y-1.5 min-w-[200px] group-hover:bg-muted/10 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <span className="text-micro font-bold text-muted-foreground uppercase opacity-60">Medication</span>
                                                <span className="text-micro font-bold text-foreground">{step.medication}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-micro font-bold text-muted-foreground uppercase opacity-60">Target Age</span>
                                                <span className="text-micro font-bold text-primary tabular-nums">Day {step.dol}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-border bg-muted/5">
                        <button className="w-full py-3 bg-primary text-primary-foreground text-micro font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-primary/10">
                            Download Compliance Report
                            <Icon name="Download01Icon" size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
