"use client";

import Link from "next/link";
import { Clock, CheckCircle2, Lock, Copy } from "lucide-react";
import { Checklist, formatDuration } from "@/lib/types";

interface ChecklistCardProps {
    checklist: Checklist;
    onClone?: (id: string) => void;
    showCloneButton?: boolean;
}

export default function ChecklistCard({
    checklist,
    onClone,
    showCloneButton = false,
}: ChecklistCardProps) {
    const stats = checklist.stats;

    const handleClone = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClone?.(checklist.id);
    };

    return (
        <Link
            href={`/checklist/${checklist.id}`}
            className="card checklist-card"
            style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
        >
            {/* Header with title and default badge */}
            <div className="checklist-card-header">
                <h3 className="checklist-card-title">
                    {checklist.title}
                    {checklist.isDefault && (
                        <span className="default-badge" title="Default template (read-only)">
                            <Lock size={12} />
                        </span>
                    )}
                </h3>
            </div>

            {/* Category tag under title */}
            {checklist.category && (
                <div style={{ marginBottom: 12 }}>
                    <span
                        className="category-tag"
                        style={{
                            backgroundColor: `${checklist.category.color}20`,
                            color: checklist.category.color,
                        }}
                    >
                        {checklist.category.name}
                    </span>
                </div>
            )}

            {/* Description */}
            {checklist.description && (
                <p className="checklist-card-description">{checklist.description}</p>
            )}

            {/* Stats section - flex grow to push footer down */}
            <div style={{ flex: 1 }} />

            {stats && (
                <>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${stats.completionPercentage}%` }}
                        />
                    </div>

                    <div className="checklist-card-footer">
                        <div className="checklist-card-meta">
                            <span>
                                <CheckCircle2 size={16} />
                                {stats.completedSteps}/{stats.totalSteps} steps
                            </span>
                            <span>
                                <Clock size={16} />
                                {formatDuration(stats.totalDurationMinutes)}
                            </span>
                        </div>
                        <span className="progress-text">{stats.completionPercentage}%</span>
                    </div>
                </>
            )}

            {/* Clone button at bottom right */}
            {showCloneButton && onClone && (
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid var(--color-border)"
                }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleClone}
                    >
                        <Copy size={14} />
                        Clone
                    </button>
                </div>
            )}
        </Link>
    );
}
