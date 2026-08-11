import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Truck,
  Sparkles,
  ChartNoAxesCombined,
  ShieldCheck,
  MapPin,
  Sprout,
  Flower2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight, Warehouse,
  ReceiptText,
} from "lucide-react";
import logo from "../assets/Logo.png";
import { Navbar } from "../components/ui";
import "../nav.css";
const menus = {
  "Super Admin": [
    [
      "OVERVIEW",
      [
        ["Dashboard", LayoutDashboard, "/"],
        ["Analytics", ChartNoAxesCombined, "/analytics"],
      ],
    ],
    [
      "MASTER DATA",
      [
        ["Users", Users, "/users"],
        ["Branches", MapPin, "/branches"],
        ["Farms", Sprout, "/farms"],
        ["Flower Catalog", Flower2, "/flower-catalog"],
      ],
    ],
    [
      "SUPPLY CHAIN",
      [
        ["Inventory", Package, "/inventory"],
        ["Distribution", Truck, "/distribution"],
        ["Forecasting", Sparkles, "/forecasting"],
        ["Quality Control", ShieldCheck, "/quality-control"],
      ],
    ],
    
    [
      "ADMINISTRATION",
      [
        
        ["Settings", Settings, "/settings"],
      ],
    ],
  ],
  "Head Office": [
    [
      "PLANNING",
      [
        ["Dashboard", LayoutDashboard, "/"],
        ["Forecasting", Sparkles, "/forecasting"],
        ["Analytics", ChartNoAxesCombined, "/analytics"],
      ],
    ],
    [
      "FULFILMENT",
      [
        ["Receiving", Package, "/receiving"],
        ["Distribution", Truck, "/distribution"],
      ],
    ],
  ],
  "Branch Staff": [
    [
      "DAILY OPERATIONS",
      [
        ["Dashboard", LayoutDashboard, "/"],
        ["Inventory", Package, "/inventory"],
        ["Distribution", Truck, "/distribution"],
        ["Daily Sales", ReceiptText, "/daily-sales"],
      ],
    ],
    [
      "FRESHNESS",
      [
        ["Quality Control", ShieldCheck, "/quality-control"],
      ],
    ],
  ],
};

const roleLabels = {
  SUPERADMIN: "Super Admin",
  STAFF_HEAD_OFFICE: "Head Office",
  STAFF_BRANCH: "Branch Staff",
};

const SIDEBAR_COLLAPSED_KEY = "bloomflow.sidebar.collapsed";

function getInitialSidebarCollapsed() {
  const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  if (stored === "true" || stored === "false") return stored === "true";
  return window.matchMedia("(max-width: 1024px)").matches;
}

export default function AppLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(getInitialSidebarCollapsed);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const role = roleLabels[user?.role?.toUpperCase()] || "Unknown role";
  const roleMenus = menus[role] || [];

  return (
    <div className={`shell ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`${isCollapsed ? "collapsed" : ""} ${open ? "open" : ""}`}>
        <div className="brand">
          <img
            className="brand-logo"
            src={logo}
            alt="BloomFlow Logo"
          />
          <span>BloomFlow</span>
          <button
            className="sidebar-mobile-close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <div className="sidebar-menu">
          {roleMenus.map(([group, items]) => (
            <section className="nav-group" key={group}>
              <p>{group}</p>
              {items.map(([name, Icon, path]) => (
                <NavLink
                  className="sidebar-link"
                  key={name}
                  to={path}
                  end={path === "/"}
                  onClick={() => setOpen(false)}
                  title={name}
                  data-tooltip={name}
                >
                  <Icon size={18} />
                  <span>{name}</span>
                </NavLink>
              ))}
            </section>
          ))}
        </div>
      </aside>
      <button
        className="sidebar-toggle"
        type="button"
        onClick={() => setIsCollapsed((value) => !value)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main>
        <Navbar onMenu={() => setOpen(true)} />
        <div className="content">
          <Outlet context={{ role }} />
        </div>
      </main>
    </div>
  );
}
