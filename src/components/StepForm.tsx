"use client";

import { Step, DURATION_OPTIONS, StepStatus } from "@/lib/types";

interface StepFormProps {
    step?: Partial<Step>;
    onChange: (data: Partial<Step>) => void;
}

export default function StepForm({ step, onChange }: StepFormProps) {
    const handleChange = (
        field: keyof Step,
        value: string | number | null
    ) => {
        onChange({ [field]: value });
    };

    const formatDatetimeLocal = (datetime: string | null | undefined) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        return date.toISOString().slice(0, 16);
    };

    return (
        <>
            <div className="form-group">
                <label className="form-label">Title</label>
                <input
                    type="text"
                    className="form-input"
                    value={step?.title || ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter step title"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    className="form-textarea"
                    value={step?.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Enter step description"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Estimated Duration</label>
                <select
                    className="form-select"
                    value={step?.durationMinutes || 60}
                    onChange={(e) =>
                        handleChange("durationMinutes", parseInt(e.target.value))
                    }
                >
                    {DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Status</label>
                <select
                    className="form-select"
                    value={step?.status || "draft"}
                    onChange={(e) => handleChange("status", e.target.value as StepStatus)}
                >
                    <option value="draft">Draft</option>
                    <option value="started">In Progress</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Start Date/Time</label>
                <input
                    type="datetime-local"
                    className="form-input"
                    value={formatDatetimeLocal(step?.startDatetime)}
                    onChange={(e) =>
                        handleChange(
                            "startDatetime",
                            e.target.value ? new Date(e.target.value).toISOString() : null
                        )
                    }
                />
            </div>

            <div className="form-group">
                <label className="form-label">End Date/Time</label>
                <input
                    type="datetime-local"
                    className="form-input"
                    value={formatDatetimeLocal(step?.endDatetime)}
                    onChange={(e) =>
                        handleChange(
                            "endDatetime",
                            e.target.value ? new Date(e.target.value).toISOString() : null
                        )
                    }
                />
            </div>

            <div className="form-group">
                <label className="form-label">Comments</label>
                <textarea
                    className="form-textarea"
                    value={step?.comments || ""}
                    onChange={(e) => handleChange("comments", e.target.value)}
                    placeholder="Add any comments or notes"
                />
            </div>
        </>
    );
}
