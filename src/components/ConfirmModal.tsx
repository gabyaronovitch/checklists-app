"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "default";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${variant === "danger" ? "btn-danger" : "btn-primary"}`}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </>
            }
        >
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {variant === "danger" && (
                    <div
                        style={{
                            padding: 10,
                            background: "var(--color-status-rejected-bg)",
                            borderRadius: 8,
                            flexShrink: 0,
                        }}
                    >
                        <AlertTriangle size={24} color="var(--color-status-rejected)" />
                    </div>
                )}
                {variant === "warning" && (
                    <div
                        style={{
                            padding: 10,
                            background: "var(--color-status-paused-bg)",
                            borderRadius: 8,
                            flexShrink: 0,
                        }}
                    >
                        <AlertTriangle size={24} color="var(--color-status-paused)" />
                    </div>
                )}
                <p style={{ margin: 0, color: "var(--color-text-subtle)", lineHeight: 1.6 }}>
                    {message}
                </p>
            </div>
        </Modal>
    );
}
