"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Category } from "@/lib/types";
import Modal from "@/components/Modal";
import ConfirmModal from "@/components/ConfirmModal";

const COLOR_OPTIONS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#8b5cf6", // purple
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#6366f1", // indigo
];

export default function Settings() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", color: "#3b82f6" });
    const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", color: "#3b82f6" });
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, color: category.color });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;

        try {
            if (editingCategory) {
                // Update
                const res = await fetch(`/api/categories/${editingCategory.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    setShowModal(false);
                    fetchCategories();
                }
            } else {
                // Create
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (res.ok) {
                    setShowModal(false);
                    fetchCategories();
                }
            }
        } catch (error) {
            console.error("Failed to save category:", error);
        }
    };

    const handleDelete = async (category: Category) => {
        try {
            const res = await fetch(`/api/categories/${category.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchCategories();
            }
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
        setDeleteConfirm(null);
    };

    const getDeleteMessage = (category: Category) => {
        const checklistCount = category._count?.checklists || 0;
        if (checklistCount > 0) {
            return `This category has ${checklistCount} checklist(s) assigned to it. They will be uncategorized after deletion. Are you sure you want to delete "${category.name}"?`;
        }
        return `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`;
    };

    return (
        <>
            <div className="content-header">
                <h1 className="content-title">Settings</h1>
            </div>

            <div className="content-body">
                <div className="card" style={{ padding: 0 }}>
                    <div
                        style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid var(--color-border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                            Categories
                        </h2>
                        <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                            <Plus size={16} />
                            Add Category
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner" />
                        </div>
                    ) : categories.length > 0 ? (
                        <table className="settings-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Color</th>
                                    <th>Checklists</th>
                                    <th style={{ width: 100 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td>
                                            <span
                                                className="category-tag"
                                                style={{
                                                    backgroundColor: `${category.color}20`,
                                                    color: category.color,
                                                }}
                                            >
                                                {category.name}
                                            </span>
                                        </td>
                                        <td>
                                            <div
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: "50%",
                                                    backgroundColor: category.color,
                                                }}
                                            />
                                        </td>
                                        <td>{category._count?.checklists || 0}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: 4 }}>
                                                <button
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => openEditModal(category)}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-icon"
                                                    onClick={() => setDeleteConfirm(category)}
                                                    style={{ color: "var(--color-status-rejected)" }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state" style={{ padding: 40 }}>
                            <h3>No categories yet</h3>
                            <p>Create categories to organize your checklists</p>
                            <button className="btn btn-primary" onClick={openCreateModal}>
                                <Plus size={18} />
                                Add Category
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? "Edit Category" : "Add Category"}
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={!formData.name.trim()}
                        >
                            {editingCategory ? "Save Changes" : "Create"}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter category name"
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Color</label>
                    <div className="color-picker">
                        {COLOR_OPTIONS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={`color-option ${formData.color === color ? "selected" : ""
                                    }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setFormData({ ...formData, color })}
                            />
                        ))}
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Preview</label>
                    <span
                        className="category-tag"
                        style={{
                            backgroundColor: `${formData.color}20`,
                            color: formData.color,
                        }}
                    >
                        {formData.name || "Category Name"}
                    </span>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                title="Delete Category"
                message={deleteConfirm ? getDeleteMessage(deleteConfirm) : ""}
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}
