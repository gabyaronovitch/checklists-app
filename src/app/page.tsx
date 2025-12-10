"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, FolderKanban, Copy, Trash2, MoreHorizontal, Upload, Download, FileText, CheckCircle, AlertCircle } from "lucide-react";
import ChecklistCard from "@/components/ChecklistCard";
import Modal from "@/components/Modal";
import ConfirmModal from "@/components/ConfirmModal";
import { Checklist, Category, Step } from "@/lib/types";
import { validateCSVFile, parseCSV, CSVParseResult } from "@/lib/csv";

export default function Dashboard() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChecklist, setNewChecklist] = useState({
    title: "",
    description: "",
    categoryId: "",
  });
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvParseResult, setCsvParseResult] = useState<CSVParseResult | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChecklists();
    fetchCategories();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenuId(null);
    if (actionMenuId) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [actionMenuId]);

  const fetchChecklists = async () => {
    try {
      const res = await fetch("/api/checklists");
      const data = await res.json();
      setChecklists(data);
    } catch (error) {
      console.error("Failed to fetch checklists:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const resetCreateModal = () => {
    setNewChecklist({ title: "", description: "", categoryId: "" });
    setCsvFile(null);
    setCsvParseResult(null);
    setImportStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    if (!newChecklist.title.trim()) return;

    try {
      const payload: {
        title: string;
        description: string;
        categoryId: string | null;
        steps?: Partial<Step>[];
      } = {
        ...newChecklist,
        categoryId: newChecklist.categoryId || null,
      };

      // Include parsed steps if CSV was uploaded successfully
      if (csvParseResult?.success && csvParseResult.steps.length > 0) {
        payload.steps = csvParseResult.steps;
      }

      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        const stepCount = csvParseResult?.steps.length || 0;

        setShowCreateModal(false);
        resetCreateModal();
        fetchChecklists();

        if (stepCount > 0) {
          setImportStatus({
            type: "success",
            message: `Checklist created with ${stepCount} imported step(s)!`,
          });
        }
      } else {
        const data = await res.json();
        setImportStatus({
          type: "error",
          message: data.error || "Failed to create checklist",
        });
      }
    } catch (error) {
      console.error("Failed to create checklist:", error);
      setImportStatus({
        type: "error",
        message: "An error occurred while creating the checklist",
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCsvFile(null);
      setCsvParseResult(null);
      return;
    }

    // Validate file
    const validation = validateCSVFile(file);
    if (!validation.valid) {
      setImportStatus({ type: "error", message: validation.error! });
      setCsvFile(null);
      setCsvParseResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setCsvFile(file);
    setImportStatus(null);

    // Read and parse file
    try {
      const content = await file.text();
      const result = parseCSV(content);
      setCsvParseResult(result);

      if (!result.success && result.errors.length > 0) {
        setImportStatus({
          type: "error",
          message: result.errors.join("; "),
        });
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Failed to read CSV file",
      });
      setCsvParseResult(null);
    }
  };

  const handleClone = async (id: string) => {
    try {
      const res = await fetch(`/api/checklists/${id}/clone`, {
        method: "POST",
      });

      if (res.ok) {
        fetchChecklists();
      }
    } catch (error) {
      console.error("Failed to clone checklist:", error);
    }
    setActionMenuId(null);
  };

  const handleExport = async (id: string) => {
    try {
      const res = await fetch(`/api/checklists/${id}/export`);
      if (res.ok) {
        const blob = await res.blob();
        const contentDisposition = res.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch?.[1] || "steps.csv";

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export checklist:", error);
    }
    setActionMenuId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchChecklists();
      }
    } catch (error) {
      console.error("Failed to delete checklist:", error);
    }
    setActionMenuId(null);
    setDeleteConfirm(null);
  };

  // Separate default and user checklists
  const defaultChecklists = checklists.filter((c) => c.isDefault);
  const userChecklists = checklists.filter((c) => !c.isDefault);

  return (
    <>
      <div className="content-header">
        <h1 className="content-title">Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          New Checklist
        </button>
      </div>

      <div className="content-body">
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* User Checklists */}
            {userChecklists.length > 0 && (
              <>
                <h2 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
                  My Checklists
                </h2>
                <div className="checklist-grid" style={{ marginBottom: 32 }}>
                  {userChecklists.map((checklist) => (
                    <div key={checklist.id} className="checklist-card-wrapper">
                      <ChecklistCard
                        checklist={checklist}
                        onClone={handleClone}
                        showCloneButton={true}
                      />
                      {/* Action menu button */}
                      <div className="checklist-card-actions">
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActionMenuId(
                              actionMenuId === checklist.id
                                ? null
                                : checklist.id
                            );
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {actionMenuId === checklist.id && (
                          <div className="actions-menu">
                            <button
                              className="actions-menu-item"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClone(checklist.id);
                              }}
                            >
                              <Copy size={16} />
                              Clone
                            </button>
                            <button
                              className="actions-menu-item"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleExport(checklist.id);
                              }}
                            >
                              <Download size={16} />
                              Export CSV
                            </button>
                            <button
                              className="actions-menu-item danger"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteConfirm(checklist.id);
                                setActionMenuId(null);
                              }}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Default Checklists */}
            {defaultChecklists.length > 0 && (
              <>
                <h2 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
                  Default Templates
                </h2>
                <p
                  style={{
                    marginBottom: 16,
                    color: "var(--color-text-subtle)",
                    fontSize: 14,
                  }}
                >
                  These are read-only templates. Clone them to create your own
                  editable version.
                </p>
                <div className="checklist-grid">
                  {defaultChecklists.map((checklist) => (
                    <ChecklistCard
                      key={checklist.id}
                      checklist={checklist}
                      onClone={handleClone}
                      showCloneButton={true}
                    />
                  ))}
                </div>
              </>
            )}

            {checklists.length === 0 && (
              <div className="empty-state">
                <FolderKanban size={64} />
                <h3>No checklists yet</h3>
                <p>Create your first checklist to get started</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={18} />
                  Create Checklist
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetCreateModal();
        }}
        title="Create New Checklist"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetCreateModal();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={!newChecklist.title.trim()}
            >
              Create
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            value={newChecklist.title}
            onChange={(e) =>
              setNewChecklist({ ...newChecklist, title: e.target.value })
            }
            placeholder="Enter checklist title"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={newChecklist.description}
            onChange={(e) =>
              setNewChecklist({ ...newChecklist, description: e.target.value })
            }
            placeholder="Enter checklist description"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={newChecklist.categoryId}
            onChange={(e) =>
              setNewChecklist({ ...newChecklist, categoryId: e.target.value })
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

        {/* CSV Import Section */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Import Steps from CSV (Optional)</label>
          <div
            style={{
              border: "2px dashed var(--color-border)",
              borderRadius: 8,
              padding: 16,
              textAlign: "center",
              backgroundColor: "var(--color-bg)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Upload size={24} color="var(--color-text-muted)" />
              <span style={{ color: "var(--color-text-subtle)", fontSize: 14 }}>
                Click to select a CSV file
              </span>
              <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                Columns: title, description, durationMinutes, status, etc.
              </span>
            </label>
          </div>

          {/* Selected file info */}
          {csvFile && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: csvParseResult?.success
                  ? "var(--color-status-completed-bg)"
                  : "var(--color-bg)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <FileText size={20} color="var(--color-primary)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{csvFile.name}</div>
                {csvParseResult?.success && (
                  <div style={{ color: "var(--color-status-completed)", fontSize: 12 }}>
                    ✓ {csvParseResult.steps.length} step(s) ready to import
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setCsvFile(null);
                  setCsvParseResult(null);
                  setImportStatus(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Remove
              </button>
            </div>
          )}

          {/* Import status message */}
          {importStatus && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor:
                  importStatus.type === "success"
                    ? "var(--color-status-completed-bg)"
                    : "var(--color-status-rejected-bg)",
                color:
                  importStatus.type === "success"
                    ? "var(--color-status-completed)"
                    : "var(--color-status-rejected)",
                borderRadius: 6,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 13,
              }}
            >
              {importStatus.type === "success" ? (
                <CheckCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              ) : (
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Checklist"
        message="Are you sure you want to delete this checklist? This action cannot be undone and all steps will be permanently removed."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
