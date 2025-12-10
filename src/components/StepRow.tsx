"use client";

import { useState, useRef, useEffect } from "react";
import {
    GripVertical,
    MoreHorizontal,
    Plus,
    Copy,
    Pencil,
    Trash2,
    Clock,
    Calendar,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Step, formatDuration, formatDate, StepStatus, STEP_STATUS_CONFIG } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface StepRowProps {
    step: Step;
    isDefault: boolean;
    onUpdate: (id: string, data: Partial<Step>) => void;
    onDelete: (id: string) => void;
    onClone: (id: string) => void;
    onAddBefore: (id: string) => void;
    onAddAfter: (id: string) => void;
    onEdit: (step: Step) => void;
}

export default function StepRow({
    step,
    isDefault,
    onUpdate,
    onDelete,
    onClone,
    onAddBefore,
    onAddAfter,
    onEdit,
}: StepRowProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: step.id,
        disabled: isDefault,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate(step.id, { status: e.target.value as StepStatus });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`step-row ${isDragging ? "dragging" : ""}`}
        >
            {!isDefault && (
                <div
                    className="step-drag-handle"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={20} />
                </div>
            )}

            <div className="step-content" onClick={() => onEdit(step)}>
                <h4 className="step-title">{step.title}</h4>
                <div className="step-meta">
                    <span>
                        <Clock size={14} />
                        {formatDuration(step.durationMinutes)}
                    </span>
                    {step.startDatetime && (
                        <span>
                            <Calendar size={14} />
                            {formatDate(step.startDatetime)}
                        </span>
                    )}
                </div>
            </div>

            {!isDefault && (
                <select
                    value={step.status}
                    onChange={handleStatusChange}
                    className="form-select"
                    style={{
                        width: "auto",
                        padding: "4px 24px 4px 8px",
                        fontSize: "12px",
                        backgroundColor: STEP_STATUS_CONFIG[step.status].bgColor,
                        color: STEP_STATUS_CONFIG[step.status].color,
                        border: "none",
                        fontWeight: 500,
                    }}
                >
                    <option value="draft">Draft</option>
                    <option value="started">In Progress</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                </select>
            )}

            {isDefault && <StatusBadge status={step.status} />}

            {!isDefault && (
                <div className="step-actions" ref={menuRef}>
                    <button
                        className="btn btn-ghost btn-icon tooltip"
                        data-tooltip="Add above"
                        onClick={() => onAddBefore(step.id)}
                    >
                        <Plus size={18} />
                    </button>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <MoreHorizontal size={18} />
                    </button>

                    {showMenu && (
                        <div className="actions-menu">
                            <button
                                className="actions-menu-item"
                                onClick={() => {
                                    onAddBefore(step.id);
                                    setShowMenu(false);
                                }}
                            >
                                <Plus size={16} />
                                Add step above
                            </button>
                            <button
                                className="actions-menu-item"
                                onClick={() => {
                                    onAddAfter(step.id);
                                    setShowMenu(false);
                                }}
                            >
                                <Plus size={16} />
                                Add step below
                            </button>
                            <button
                                className="actions-menu-item"
                                onClick={() => {
                                    onClone(step.id);
                                    setShowMenu(false);
                                }}
                            >
                                <Copy size={16} />
                                Clone step
                            </button>
                            <button
                                className="actions-menu-item"
                                onClick={() => {
                                    onEdit(step);
                                    setShowMenu(false);
                                }}
                            >
                                <Pencil size={16} />
                                Edit details
                            </button>
                            <button
                                className="actions-menu-item danger"
                                onClick={() => {
                                    onDelete(step.id);
                                    setShowMenu(false);
                                }}
                            >
                                <Trash2 size={16} />
                                Delete step
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
