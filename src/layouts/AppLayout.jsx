import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
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
  PanelLeftClose,
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
export default function AppLayout() {
  const [role, setRole] = useState("Super Admin");
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <aside className={open ? "open" : ""}>
        <div className="brand">
          <Flower2 /> <span>BloomFlow</span>
          <button onClick={() => setOpen(false)}>
            <PanelLeftClose size={18} />
          </button>
        </div>
        <p className="workspace">{role} VIEW</p>
        {menus[role].map(([group, items]) => (
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
        <div className="sidebar-note">
          <span>Supply health</span>
          <b>92% on track</b>
          <div>
            <i />
          </div>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main>
        <Navbar role={role} setRole={setRole} onMenu={() => setOpen(true)} />
        <div className="content">
          <Outlet context={{ role }} />
        </div>
      </main>
    </div>
  );
}
