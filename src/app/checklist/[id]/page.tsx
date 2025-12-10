"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Plus,
    Pencil,
    Copy,
    Trash2,
    Lock,
    CheckCircle2,
    Clock,
    Calendar,
    Download,
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Checklist, Step, Category, formatDuration, formatDate } from "@/lib/types";
import StepRow from "@/components/StepRow";
import StepForm from "@/components/StepForm";
import Modal from "@/components/Modal";
import ConfirmModal from "@/components/ConfirmModal";

export default function ChecklistDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [checklist, setChecklist] = useState<Checklist | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit checklist modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        title: "",
        description: "",
        categoryId: "",
    });

    // Step modals
    const [showStepModal, setShowStepModal] = useState(false);
    const [editingStep, setEditingStep] = useState<Step | null>(null);
    const [stepFormData, setStepFormData] = useState<Partial<Step>>({});

    // Confirmation modals
    const [showDeleteChecklistConfirm, setShowDeleteChecklistConfirm] = useState(false);
    const [deleteStepId, setDeleteStepId] = useState<string | null>(null);

    // Export modal
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFilename, setExportFilename] = useState("");

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchChecklist = useCallback(async () => {
        try {
            const res = await fetch(`/api/checklists/${resolvedParams.id}`);
            if (res.ok) {
                const data = await res.json();
                setChecklist(data);
                setEditData({
                    title: data.title,
                    description: data.description || "",
                    categoryId: data.categoryId || "",
                });
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Failed to fetch checklist:", error);
        } finally {
            setLoading(false);
        }
    }, [resolvedParams.id, router]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchChecklist();
        fetchCategories();
    }, [fetchChecklist, fetchCategories]);

    // Checklist actions
    const handleUpdateChecklist = async () => {
        try {
            const res = await fetch(`/api/checklists/${resolvedParams.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editData,
                    categoryId: editData.categoryId || null,
                }),
            });

            if (res.ok) {
                setShowEditModal(false);
                fetchChecklist();
            }
        } catch (error) {
            console.error("Failed to update checklist:", error);
        }
    };

    const handleCloneChecklist = async () => {
        try {
            const res = await fetch(`/api/checklists/${resolvedParams.id}/clone`, {
                method: "POST",
            });

            if (res.ok) {
                const cloned = await res.json();
                router.push(`/checklist/${cloned.id}`);
            }
        } catch (error) {
            console.error("Failed to clone checklist:", error);
        }
    };

    const openExportModal = () => {
        if (!checklist) return;
        const safeTitle = checklist.title.replace(/[^a-z0-9]/gi, "_").substring(0, 50);
        setExportFilename(`${safeTitle}_steps.csv`);
        setShowExportModal(true);
    };

    const handleExport = async () => {
        if (!checklist) return;

        try {
            const res = await fetch(`/api/checklists/${checklist.id}/export`);
            if (res.ok) {
                const blob = await res.blob();
                const filename = exportFilename.endsWith(".csv") ? exportFilename : `${exportFilename}.csv`;

                // Try to use the File System Access API for native "Save As" dialog
                if ("showSaveFilePicker" in window) {
                    try {
                        const handle = await (window as unknown as {
                            showSaveFilePicker: (options: {
                                suggestedName: string;
                                startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";
                                types: { description: string; accept: Record<string, string[]> }[];
                            }) => Promise<FileSystemFileHandle>
                        }).showSaveFilePicker({
                            suggestedName: filename,
                            startIn: "downloads",
                            types: [
                                {
                                    description: "CSV Files",
                                    accept: { "text/csv": [".csv"] },
                                },
                            ],
                        });

                        const writable = await handle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                        setShowExportModal(false);
                        return;
                    } catch (err) {
                        if ((err as Error).name === "AbortError") {
                            return;
                        }
                        console.warn("Save picker failed, falling back to download:", err);
                    }
                }

                // Fallback: Traditional download
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setShowExportModal(false);
            }
        } catch (error) {
            console.error("Failed to export checklist:", error);
        }
    };

    const handleDeleteChecklist = async () => {
        try {
            const res = await fetch(`/api/checklists/${resolvedParams.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/");
            }
        } catch (error) {
            console.error("Failed to delete checklist:", error);
        }
    };

    // Step actions
    const handleAddStep = async (insertBefore?: string, insertAfter?: string) => {
        try {
            const res = await fetch(`/api/checklists/${resolvedParams.id}/steps`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "New Step",
                    insertBefore,
                    insertAfter,
                }),
            });

            if (res.ok) {
                fetchChecklist();
            }
        } catch (error) {
            console.error("Failed to add step:", error);
        }
    };

    const handleUpdateStep = async (id: string, data: Partial<Step>) => {
        try {
            const res = await fetch(`/api/steps/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                fetchChecklist();
            }
        } catch (error) {
            console.error("Failed to update step:", error);
        }
    };

    const handleDeleteStep = async (id: string) => {
        try {
            const res = await fetch(`/api/steps/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchChecklist();
            }
        } catch (error) {
            console.error("Failed to delete step:", error);
        }
        setDeleteStepId(null);
    };

    const handleCloneStep = async (id: string) => {
        try {
            const res = await fetch(`/api/steps/${id}/clone`, {
                method: "POST",
            });

            if (res.ok) {
                fetchChecklist();
            }
        } catch (error) {
            console.error("Failed to clone step:", error);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && checklist) {
            const oldIndex = checklist.steps.findIndex((s) => s.id === active.id);
            const newIndex = checklist.steps.findIndex((s) => s.id === over.id);

            const newSteps = arrayMove(checklist.steps, oldIndex, newIndex);
            setChecklist({ ...checklist, steps: newSteps });

            // Save new order to server
            try {
                await fetch("/api/steps/reorder", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        checklistId: checklist.id,
                        stepIds: newSteps.map((s) => s.id),
                    }),
                });
            } catch (error) {
                console.error("Failed to reorder steps:", error);
                fetchChecklist(); // Revert on error
            }
        }
    };

    const openStepModal = (step: Step) => {
        setEditingStep(step);
        setStepFormData({
            title: step.title,
            description: step.description,
            durationMinutes: step.durationMinutes,
            startDatetime: step.startDatetime,
            endDatetime: step.endDatetime,
            status: step.status,
            comments: step.comments,
        });
        setShowStepModal(true);
    };

    const handleSaveStep = async () => {
        if (!editingStep) return;

        try {
            const res = await fetch(`/api/steps/${editingStep.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stepFormData),
            });

            if (res.ok) {
                setShowStepModal(false);
                setEditingStep(null);
                fetchChecklist();
            }
        } catch (error) {
            console.error("Failed to save step:", error);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
            </div>
        );
    }

    if (!checklist) {
        return <div>Checklist not found</div>;
    }

    const stats = checklist.stats;

    return (
        <>
            <div className="content-header">
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Link href="/" className="btn btn-ghost btn-icon">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="breadcrumb">
                            <Link href="/">Dashboard</Link>
                            <span className="breadcrumb-separator">/</span>
                            <span>{checklist.title}</span>
                        </div>
                        <h1 className="content-title" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {checklist.title}
                            {checklist.isDefault && (
                                <span className="default-badge" title="Default template (read-only)">
                                    <Lock size={12} />
                                </span>
                            )}
                        </h1>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {!checklist.isDefault && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowEditModal(true)}
                        >
                            <Pencil size={18} />
                            Edit
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={handleCloneChecklist}>
                        <Copy size={18} />
                        Clone
                    </button>
                    {!checklist.isDefault && (
                        <button className="btn btn-danger" onClick={() => setShowDeleteChecklistConfirm(true)}>
                            <Trash2 size={18} />
                            Delete
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={openExportModal}>
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            <div className="content-body">
                {/* Stats Card */}
                {stats && (
                    <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                gap: 24,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "var(--color-text-muted)",
                                        marginBottom: 4,
                                    }}
                                >
                                    Progress
                                </div>
                                <div
                                    style={{
                                        fontSize: 24,
                                        fontWeight: 600,
                                        color: "var(--color-status-completed)",
                                    }}
                                >
                                    {stats.completionPercentage}%
                                </div>
                                <div className="progress-bar" style={{ marginTop: 8, marginBottom: 0 }}>
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${stats.completionPercentage}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "var(--color-text-muted)",
                                        marginBottom: 4,
                                    }}
                                >
                                    Steps
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <CheckCircle2 size={20} color="var(--color-status-completed)" />
                                    <span style={{ fontSize: 18, fontWeight: 600 }}>
                                        {stats.completedSteps} / {stats.totalSteps}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "var(--color-text-muted)",
                                        marginBottom: 4,
                                    }}
                                >
                                    Total Duration
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Clock size={20} color="var(--color-primary)" />
                                    <span style={{ fontSize: 18, fontWeight: 600 }}>
                                        {formatDuration(stats.totalDurationMinutes)}
                                    </span>
                                </div>
                            </div>
                            {(stats.startDatetime || stats.endDatetime) && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "var(--color-text-muted)",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Date Range
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Calendar size={20} color="var(--color-status-started)" />
                                        <span style={{ fontSize: 14 }}>
                                            {formatDate(stats.startDatetime)} - {formatDate(stats.endDatetime)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Description */}
                {checklist.description && (
                    <p
                        style={{
                            color: "var(--color-text-subtle)",
                            marginBottom: 24,
                            fontSize: 14,
                        }}
                    >
                        {checklist.description}
                    </p>
                )}

                {/* Steps Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>Steps</h2>
                    {!checklist.isDefault && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddStep()}
                        >
                            <Plus size={16} />
                            Add Step
                        </button>
                    )}
                </div>

                {/* Steps List */}
                {checklist.steps.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={checklist.steps.map((s) => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="steps-list">
                                {checklist.steps.map((step) => (
                                    <StepRow
                                        key={step.id}
                                        step={step}
                                        isDefault={checklist.isDefault}
                                        onUpdate={handleUpdateStep}
                                        onDelete={(id) => setDeleteStepId(id)}
                                        onClone={handleCloneStep}
                                        onAddBefore={(id) => handleAddStep(id)}
                                        onAddAfter={(id) => handleAddStep(undefined, id)}
                                        onEdit={openStepModal}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="empty-state">
                        <h3>No steps yet</h3>
                        <p>Add your first step to get started</p>
                        {!checklist.isDefault && (
                            <button
                                className="btn btn-primary"
                                onClick={() => handleAddStep()}
                            >
                                <Plus size={18} />
                                Add Step
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Checklist Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Checklist"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleUpdateChecklist}>
                            Save Changes
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-input"
                        value={editData.title}
                        onChange={(e) =>
                            setEditData({ ...editData, title: e.target.value })
                        }
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-textarea"
                        value={editData.description}
                        onChange={(e) =>
                            setEditData({ ...editData, description: e.target.value })
                        }
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                        className="form-select"
                        value={editData.categoryId}
                        onChange={(e) =>
                            setEditData({ ...editData, categoryId: e.target.value })
                        }
                    >
                        <option value="">No category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </Modal>

            {/* Edit Step Modal */}
            <Modal
                isOpen={showStepModal}
                onClose={() => {
                    setShowStepModal(false);
                    setEditingStep(null);
                }}
                title="Edit Step"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowStepModal(false);
                                setEditingStep(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSaveStep}>
                            Save Changes
                        </button>
                    </>
                }
            >
                <StepForm
                    step={stepFormData}
                    onChange={(data) => setStepFormData({ ...stepFormData, ...data })}
                />
            </Modal>

            {/* Delete Checklist Confirmation */}
            <ConfirmModal
                isOpen={showDeleteChecklistConfirm}
                onClose={() => setShowDeleteChecklistConfirm(false)}
                onConfirm={handleDeleteChecklist}
                title="Delete Checklist"
                message="Are you sure you want to delete this checklist? This action cannot be undone and all steps will be permanently removed."
                confirmText="Delete"
                variant="danger"
            />

            {/* Delete Step Confirmation */}
            <ConfirmModal
                isOpen={deleteStepId !== null}
                onClose={() => setDeleteStepId(null)}
                onConfirm={() => deleteStepId && handleDeleteStep(deleteStepId)}
                title="Delete Step"
                message="Are you sure you want to delete this step? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />

            {/* Export Modal */}
            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Export Steps to CSV"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowExportModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleExport}
                            disabled={!exportFilename.trim()}
                        >
                            <Download size={16} />
                            Export
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Checklist</label>
                    <div style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--color-bg)",
                        borderRadius: 4,
                        border: "1px solid var(--color-border)",
                        fontSize: 14,
                        color: "var(--color-text)"
                    }}>
                        {checklist?.title}
                    </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Filename</label>
                    <input
                        type="text"
                        className="form-input"
                        value={exportFilename}
                        onChange={(e) => setExportFilename(e.target.value)}
                        placeholder="Enter filename"
                    />
                    <p style={{ marginTop: 6, fontSize: 12, color: "var(--color-text-muted)" }}>
                        Choose where to save the file in the next dialog.
                    </p>
                </div>
            </Modal>
        </>
    );
}
