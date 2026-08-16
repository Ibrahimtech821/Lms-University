import React from "react";
import { Icons } from "./ui";

export type Page = "dashboard" | "courses" | "course-detail" | "lecture" | "ai" | "profile" | "admin" | "admin-courses" | "admin-lectures" | "admin-users";

interface NavItem {
  id: Page;
  label: string;
  icon: () => React.ReactElement;
}

const studentNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
  { id: "courses", label: "My Courses", icon: Icons.Courses },
  { id: "ai", label: "AI Assistant", icon: Icons.Sparkle },
  { id: "profile", label: "Profile", icon: Icons.Profile },
];

const adminNav: NavItem[] = [
  { id: "admin", label: "Admin Dashboard", icon: Icons.Dashboard },
  { id: "admin-courses", label: "Manage Courses", icon: Icons.Courses },
  { id: "admin-lectures", label: "Manage Lectures", icon: Icons.PDF },
  { id: "admin-users", label: "Users", icon: Icons.Users },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    role: string;
  } | null;
}

export function Sidebar({
  activePage,
  onNavigate,
  isAdmin,
  isOpen,
  onClose,
  user,
}: SidebarProps) {
  const nav = isAdmin ? adminNav : studentNav;

  const isActive = (id: Page) => {
    if (activePage === "course-detail" || activePage === "lecture") return id === "courses";
    return activePage === id;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0D1B2E]/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        w-[240px] bg-[#1C3D6E] text-white
        transition-transform duration-200
        lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[#E07B39] flex items-center justify-center flex-shrink-0">
            <Icons.GraduationCap />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate" style={{ fontFamily: "Instrument Sans, sans-serif" }}>AI University</p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">LMS Platform</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Icons.X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((item) => (
            <button
              key={`${item.id}-${item.label}`}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left
                ${isActive(item.id)
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"}
              `}
            >
              <span className="flex-shrink-0">
                <item.icon />
              </span>
              {item.label}
              {isActive(item.id) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E07B39]" />
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E07B39] flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name ?? "User"}
            </p>

            <p className="text-xs text-white/50 truncate">
              {user?.role ?? "User"}
            </p>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
