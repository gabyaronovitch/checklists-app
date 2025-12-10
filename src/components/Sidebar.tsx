"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    FolderKanban,
} from "lucide-react";

const APP_VERSION = "1.0.0";
const LAST_UPDATE = "10/12/2025";

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <FolderKanban />
                    <span>CheckLists</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-title">Navigation</div>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${pathname === item.href ? "active" : ""}`}
                    >
                        <item.icon />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Footer with author info */}
            <div
                style={{
                    marginTop: "auto",
                    padding: "16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.6,
                }}
            >
                <div style={{ fontWeight: 500, color: "var(--color-sidebar-text)", marginBottom: 4 }}>
                    Gaby Aronovitch
                </div>
                <div>Version {APP_VERSION}</div>
                <div>Updated: {LAST_UPDATE}</div>
            </div>
        </aside>
    );
}
