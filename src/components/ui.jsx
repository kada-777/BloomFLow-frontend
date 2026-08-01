import { motion } from "framer-motion";
import {
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Flower2,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
export const statusTone = {
  Healthy: "success",
  Warning: "warning",
  Critical: "danger",
  Expired: "muted",
  Active: "success",
  Pending: "warning",
};
export function StatusBadge({ children }) {
  return (
    <span className={`status ${statusTone[children] || "muted"}`}>
      {children}
    </span>
  );
}
export function StatisticCard({ label, value, note, tone = "rose" }) {
  return (
    <motion.article whileHover={{ y: -3 }} className={`stat-card ${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
      <small>{note}</small>
    </motion.article>
  );
}
export function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">BloomFlow Operations</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      {action && <button className="button">{action}</button>}
    </header>
  );
}
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="icon-button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
export function SearchBar({ value, onChange }) {
  return (
    <label className="search">
      <Search size={17} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search flowers, branches..."
      />
    </label>
  );
}
export function Navbar({ role, setRole, onMenu }) {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <button className="mobile-menu icon-button" onClick={onMenu}>
        <Menu size={19} />
      </button>
      <SearchBar value="" onChange={() => {}} />
      <div className="nav-actions">
        <button className="icon-button">
          <Bell size={18} />
          <i />
        </button>
        <ThemeToggle />
        <div className="role-select">
          <Flower2 size={16} />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {["Super Admin", "Head Office", "Branch Staff"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <ChevronDown size={14} />
        </div>
        <button className="user-pill" onClick={logout}>
          <b>{user?.name?.slice(0, 1) || "A"}</b>
          <span>
            {user?.name || "Admin"}
            <small>{role}</small>
          </span>
        </button>
      </div>
    </nav>
  );
}
export function EmptyState({ title = "Nothing to show yet" }) {
  return (
    <div className="empty">
      <Flower2 size={28} />
      <p>{title}</p>
    </div>
  );
}
export function CloseButton({ onClick }) {
  return (
    <button className="icon-button" onClick={onClick}>
      <X size={18} />
    </button>
  );
}
