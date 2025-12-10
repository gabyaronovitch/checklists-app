"use client";

import { STEP_STATUS_CONFIG, StepStatus } from "@/lib/types";

interface StatusBadgeProps {
    status: StepStatus;
    size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
    const config = STEP_STATUS_CONFIG[status];

    return (
        <span
            className="status-badge"
            style={{
                backgroundColor: config.bgColor,
                color: config.color,
                fontSize: size === "sm" ? "11px" : "12px",
                padding: size === "sm" ? "2px 6px" : "4px 10px",
            }}
        >
            {config.label}
        </span>
    );
}
