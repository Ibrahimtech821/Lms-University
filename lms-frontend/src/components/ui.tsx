import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

// ---- Button ----
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type BtnSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const btnBase = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-[#1C3D6E] text-white hover:bg-[#162f55] active:bg-[#0f2140] focus-visible:outline-[#1C3D6E]",
  secondary: "bg-[#EEF2F8] text-[#1C3D6E] hover:bg-[#DDE6F5] active:bg-[#C8D8EE] border border-[#DEE5F0] focus-visible:outline-[#1C3D6E]",
  ghost: "bg-transparent text-[#5A6A82] hover:bg-[#EEF2F8] hover:text-[#1C3D6E] active:bg-[#DDE6F5] focus-visible:outline-[#1C3D6E]",
  danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B] focus-visible:outline-[#DC2626]",
  accent: "bg-[#E07B39] text-white hover:bg-[#C46828] active:bg-[#A85620] focus-visible:outline-[#E07B39]",
};
const btnSizes: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export function Button({ variant = "primary", size = "md", icon, iconRight, fullWidth, className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{iconRight}</span>}
    </button>
  );
}

// ---- Badge ----
type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-[#EEF2F8] text-[#1C3D6E]",
  success: "bg-[#DCFCE7] text-[#166534]",
  warning: "bg-[#FEF3C7] text-[#92400E]",
  error: "bg-[#FEE2E2] text-[#991B1B]",
  info: "bg-[#DBEAFE] text-[#1E40AF]",
  neutral: "bg-[#F1F5F9] text-[#475569]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[#1C3D6E]",
  success: "bg-[#22C55E]",
  warning: "bg-[#F59E0B]",
  error: "bg-[#EF4444]",
  info: "bg-[#3B82F6]",
  neutral: "bg-[#94A3B8]",
};

export function Badge({ variant = "default", children, dot, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

// ---- Input ----
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
}

export function Input({ icon, error, className = "", ...props }: InputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BAABF] pointer-events-none w-4 h-4 flex items-center">
          {icon}
        </span>
      )}
      <input
        className={`w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all ${icon ? "pl-9" : ""} ${error ? "border-red-400 focus:ring-red-100 focus:border-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ---- Textarea ----
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <div className="w-full">
      <textarea
        className={`w-full rounded-lg border border-[#DEE5F0] bg-white px-3 py-2.5 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all resize-none ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ---- Card ----
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ children, className = "", onClick, hoverable, padding = "md" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#DEE5F0] shadow-sm ${paddings[padding]} ${hoverable ? "cursor-pointer hover:shadow-md hover:border-[#B8CDE8] transition-all duration-150" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ---- Avatar ----
interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
}

const avatarSizes = { sm: "w-7 h-7 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base", xl: "w-12 h-12 text-lg" };

export function Avatar({ initials, size = "md", color = "#1C3D6E" }: AvatarProps) {
  return (
    <div
      className={`${avatarSizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

// ---- Progress Bar ----
export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`progress-bar ${className}`}>
      <div className="progress-bar-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

// ---- Stat Card ----
export function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: ReactNode }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#5A6A82] uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#0D1B2E]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-[#5A6A82]">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-[#EEF2F8] flex items-center justify-center text-[#1C3D6E] flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ---- Section Header ----
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-[#0D1B2E]">{title}</h2>
      {action}
    </div>
  );
}

// ---- Empty State ----
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-14 h-14 rounded-xl bg-[#EEF2F8] flex items-center justify-center text-[#9BAABF] mb-4">
        {icon}
      </div>
      <p className="text-base font-semibold text-[#0D1B2E] mb-1">{title}</p>
      {description && <p className="text-sm text-[#5A6A82] max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---- Modal ----
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, footer, width = "max-w-lg" }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0D1B2E]/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE5F0]">
          <h3 className="text-lg font-semibold text-[#0D1B2E]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#EEF2F8] flex items-center justify-center text-[#5A6A82] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-[#DEE5F0] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Select ----
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  label?: string;
}

export function Select({ options, label, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">{label}</label>}
      <select
        className={`w-full h-9 rounded-lg border border-[#DEE5F0] bg-white px-3 text-sm text-[#0D1B2E] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ---- Icons (inline SVG) ----
export const Icons = {
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Courses: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  AI: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><circle cx="19" cy="5" r="3"/></svg>,
  Profile: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Admin: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Upload: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  PDF: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Send: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Edit: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Eye: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Sparkle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.57a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.57a1 1 0 0 0-1.18 0L6.5 20l1.87-5.86a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  BookOpen: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  AlertCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  RefreshCw: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  GraduationCap: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
};
