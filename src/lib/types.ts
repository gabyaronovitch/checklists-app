// TypeScript types for the application

export type StepStatus = "draft" | "started" | "paused" | "rejected" | "completed";

export interface Category {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        checklists: number;
    };
}

export interface Step {
    id: string;
    checklistId: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    startDatetime: string | null;
    endDatetime: string | null;
    status: StepStatus;
    comments: string | null;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChecklistStats {
    totalSteps: number;
    completedSteps: number;
    completionPercentage: number;
    startDatetime: string | null;
    endDatetime: string | null;
    totalDurationMinutes: number;
}

export interface Checklist {
    id: string;
    title: string;
    description: string | null;
    categoryId: string | null;
    category: Category | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    steps: Step[];
    stats?: ChecklistStats;
}

// Helper constants
export const STEP_STATUS_CONFIG: Record<
    StepStatus,
    { label: string; color: string; bgColor: string }
> = {
    draft: { label: "Draft", color: "#6b7280", bgColor: "#f3f4f6" },
    started: { label: "In Progress", color: "#3b82f6", bgColor: "#dbeafe" },
    paused: { label: "Paused", color: "#f59e0b", bgColor: "#fef3c7" },
    rejected: { label: "Rejected", color: "#ef4444", bgColor: "#fee2e2" },
    completed: { label: "Completed", color: "#10b981", bgColor: "#d1fae5" },
};

export const DURATION_OPTIONS = [
    { value: 30, label: "0H30" },
    { value: 60, label: "1H00" },
    { value: 90, label: "1H30" },
    { value: 120, label: "2H00" },
    { value: 150, label: "2H30" },
    { value: 180, label: "3H00" },
    { value: 210, label: "3H30" },
    { value: 240, label: "4H00" },
    { value: 270, label: "4H30" },
    { value: 300, label: "5H00" },
    { value: 330, label: "5H30" },
    { value: 360, label: "6H00" },
    { value: 390, label: "6H30" },
    { value: 420, label: "7H00" },
    { value: 450, label: "7H30" },
    { value: 480, label: "8H00" },
];

export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}H${mins.toString().padStart(2, "0")}`;
}

export function formatDate(dateString: string | null): string {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateTime(dateString: string | null): string {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
