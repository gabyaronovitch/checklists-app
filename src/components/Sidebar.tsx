"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CheckSquare,
    LayoutDashboard,
    Settings,
    FolderKanban,
} from "lucide-react";

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
        </aside>
    );
}
