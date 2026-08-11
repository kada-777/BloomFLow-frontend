import { useState } from "react";
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
export function SearchBar({ value, onChange, placeholder = "Search flowers, branches..." }) {
  return (
    <label className="search">
      <Search size={17} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLogoutConfirmOpen(false);
    setIsLoggingOut(false);
  };

  return (
    <>
      <nav className="navbar" style={{ justifyContent: "right" }}>
        <button className="mobile-menu icon-button" onClick={onMenu}>
          <Menu size={19} />
        </button>
        <div className="nav-actions">
          {/* button lonceng notification */}
          {/* <button className="icon-button" aria-label="Notifications">
            <Bell size={18} />
            <i />
          </button> */}
          <ThemeToggle />
          <div className="profile-menu">
            <button
              className="user-pill"
              aria-expanded={isProfileOpen}
              onClick={() => setIsProfileOpen((current) => !current)}
            >
              <b>{user?.email?.slice(0, 1).toUpperCase() || "A"}</b>
              <span>{user?.email || ""}</span>
              <ChevronDown size={15} />
            </button>
            {isProfileOpen && (
              <div className="profile-dropdown">
                <button
                  className="logout-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsLogoutConfirmOpen(true);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {isLogoutConfirmOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsLogoutConfirmOpen(false)}
        >
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="logout-title">Logout from BloomFlow?</h2>
            <p>You will need to sign in again to access your workspace.</p>
            <div className="confirm-actions">
              <button
                className="text-button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className="button logout-button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
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
