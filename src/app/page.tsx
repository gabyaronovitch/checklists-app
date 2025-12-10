"use client";

import { useState, useEffect } from "react";
import { Plus, FolderKanban, Copy, Trash2, MoreHorizontal } from "lucide-react";
import ChecklistCard from "@/components/ChecklistCard";
import Modal from "@/components/Modal";
import ConfirmModal from "@/components/ConfirmModal";
import { Checklist, Category } from "@/lib/types";

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

  const handleCreate = async () => {
    if (!newChecklist.title.trim()) return;

    try {
      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newChecklist,
          categoryId: newChecklist.categoryId || null,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewChecklist({ title: "", description: "", categoryId: "" });
        fetchChecklists();
      }
    } catch (error) {
      console.error("Failed to create checklist:", error);
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
        onClose={() => setShowCreateModal(false)}
        title="Create New Checklist"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(false)}
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
