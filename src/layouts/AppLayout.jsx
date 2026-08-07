import { useState } from "react";
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
} from "lucide-react";
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
      "SUPPLY CHAIN",
      [
        ["Inventory", Package, "/inventory"],
        ["Distribution", Truck, "/distribution"],
        ["Forecasting", Sparkles, "/forecasting"],
        ["Quality Control", ShieldCheck, "/quality-control"],
      ],
    ],
    [
      "MASTER DATA",
      [
        ["Branches", MapPin, "/branches"],
        ["Farms", Sprout, "/farms"],
        ["Flower Catalog", Flower2, "/flower-catalog"],
      ],
    ],
    [
      "ADMINISTRATION",
      [
        ["Users", Users, "/users"],
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
        ["Inventory", Package, "/inventory"],
        ["Distribution", Truck, "/distribution"],
        ["Quality Control", ShieldCheck, "/quality-control"],
      ],
    ],
    [
      "NETWORK",
      [
        ["Branches", MapPin, "/branches"],
        ["Farms", Sprout, "/farms"],
        ["Flower Catalog", Flower2, "/flower-catalog"],
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
      ],
    ],
    [
      "FRESHNESS",
      [
        ["Quality Control", ShieldCheck, "/quality-control"],
        ["Flower Catalog", Flower2, "/flower-catalog"],
      ],
    ],
    [
      "REFERENCE",
      [
        ["Branches", MapPin, "/branches"],
        ["Settings", Settings, "/settings"],
      ],
    ],
  ],
};

const roleLabels = {
  SUPERADMIN: "Super Admin",
  STAFF_HEAD_OFFICE: "Head Office",
  STAFF_BRANCH: "Branch Staff",
};

export default function AppLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const role = roleLabels[user?.role?.toUpperCase()] || "Unknown role";
  const roleMenus = menus[role] || [];

  return (
    <div className="shell">
      <aside className={open ? "open" : ""}>
        <div className="brand">
          <Flower2 /> <span>BloomFlow</span>
        </div>
        <p className="workspace">{role} VIEW</p>
        {roleMenus.map(([group, items]) => (
          <section className="nav-group" key={group}>
            <p>{group}</p>
            {items.map(([name, Icon, path]) => (
              <NavLink
                key={name}
                to={path}
                end={path === "/"}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                <span>{name}</span>
              </NavLink>
            ))}
          </section>
        ))}
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main>
        <Navbar role={role} onMenu={() => setOpen(true)} />
        <div className="content">
          <Outlet context={{ role }} />
        </div>
      </main>
    </div>
  );
}
