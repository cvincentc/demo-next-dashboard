"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appointment {
  id: string;
  customer: string;
  vehicle: string;
  service: string;
  time: string;
  status: "confirmed" | "in-progress" | "completed" | "pending";
  mechanic: string;
}

interface RepairJob {
  id: string;
  plate: string;
  vehicle: string;
  issue: string;
  progress: number;
  mechanic: string;
  eta: string;
  priority: "high" | "medium" | "low";
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  unit: string;
  price: number;
}

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  date: string;
  status: "paid" | "unpaid" | "overdue";
  services: string[];
}

type NavItem = "dashboard" | "appointments" | "repairs" | "inventory" | "billing";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const appointments: Appointment[] = [
  { id: "A001", customer: "Marcus Webb", vehicle: "2021 BMW 3 Series", service: "Full Service", time: "09:00", status: "completed", mechanic: "Jake T." },
  { id: "A002", customer: "Sarah Lin", vehicle: "2019 Honda Civic", service: "Brake Replacement", time: "10:30", status: "in-progress", mechanic: "Emma R." },
  { id: "A003", customer: "Daniel Foster", vehicle: "2020 Toyota RAV4", service: "Oil Change", time: "12:00", status: "confirmed", mechanic: "Mike S." },
  { id: "A004", customer: "Priya Sharma", vehicle: "2022 Audi A4", service: "Tire Rotation", time: "13:30", status: "pending", mechanic: "Jake T." },
  { id: "A005", customer: "Tom Bradley", vehicle: "2018 Ford F-150", service: "Engine Diagnostic", time: "15:00", status: "confirmed", mechanic: "Emma R." },
  { id: "A006", customer: "Julia Chen", vehicle: "2023 Tesla Model 3", service: "Software Update", time: "16:30", status: "pending", mechanic: "Mike S." },
];

const repairs: RepairJob[] = [
  { id: "R101", plate: "KJH 442", vehicle: "BMW X5 2020", issue: "Transmission overhaul", progress: 75, mechanic: "Jake Thompson", eta: "Today 5pm", priority: "high" },
  { id: "R102", plate: "PLM 881", vehicle: "Honda Accord 2019", issue: "AC compressor replacement", progress: 40, mechanic: "Emma Rivera", eta: "Tomorrow 2pm", priority: "medium" },
  { id: "R103", plate: "XRT 293", vehicle: "Toyota Camry 2021", issue: "Suspension repair", progress: 20, mechanic: "Mike Sanders", eta: "Mar 8, 12pm", priority: "medium" },
  { id: "R104", plate: "QWE 657", vehicle: "Audi Q7 2022", issue: "Brake system full check", progress: 90, mechanic: "Jake Thompson", eta: "Today 3pm", priority: "high" },
  { id: "R105", plate: "UIO 334", vehicle: "Ford Mustang 2018", issue: "Oil leak inspection", progress: 10, mechanic: "Emma Rivera", eta: "Mar 9, 10am", priority: "low" },
];

const inventory: InventoryItem[] = [
  { id: "I01", name: "Engine Oil 5W-30", sku: "OIL-5W30", stock: 24, minStock: 10, unit: "L", price: 12.5 },
  { id: "I02", name: "Brake Pads (Front)", sku: "BRK-FNT-01", stock: 8, minStock: 5, unit: "set", price: 45.0 },
  { id: "I03", name: "Air Filter Universal", sku: "AFT-UNI-02", stock: 3, minStock: 8, unit: "pcs", price: 18.0 },
  { id: "I04", name: "Spark Plugs (NGK)", sku: "SPK-NGK-04", stock: 30, minStock: 15, unit: "pcs", price: 9.99 },
  { id: "I05", name: "Coolant Antifreeze", sku: "CLT-ANF-01", stock: 2, minStock: 6, unit: "L", price: 22.0 },
  { id: "I06", name: "Transmission Fluid", sku: "TRN-FLD-03", stock: 18, minStock: 8, unit: "L", price: 15.75 },
  { id: "I07", name: "Windshield Wipers", sku: "WPR-STD-02", stock: 12, minStock: 5, unit: "pairs", price: 28.0 },
];

const invoices: Invoice[] = [
  { id: "INV-2024-081", customer: "Marcus Webb", amount: 320.0, date: "Mar 6", status: "paid", services: ["Full Service", "Oil Change"] },
  { id: "INV-2024-082", customer: "Natalie Brooks", amount: 185.5, date: "Mar 5", status: "unpaid", services: ["Brake Replacement"] },
  { id: "INV-2024-083", customer: "James Okafor", amount: 540.0, date: "Mar 4", status: "paid", services: ["Engine Diagnostic", "Spark Plugs"] },
  { id: "INV-2024-084", customer: "Sophie Turner", amount: 95.0, date: "Mar 3", status: "overdue", services: ["Tire Rotation"] },
  { id: "INV-2024-085", customer: "Arjun Mehta", amount: 1250.0, date: "Mar 2", status: "paid", services: ["Transmission Service"] },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, React.CSSProperties> = {
    "confirmed": { background: "#dbeafe", color: "#1d4ed8" },
    "in-progress": { background: "#fef3c7", color: "#b45309" },
    "completed": { background: "#d1fae5", color: "#065f46" },
    "pending": { background: "#f3f4f6", color: "#6b7280" },
    "paid": { background: "#d1fae5", color: "#065f46" },
    "unpaid": { background: "#fef3c7", color: "#b45309" },
    "overdue": { background: "#fee2e2", color: "#b91c1c" },
    "high": { background: "#fee2e2", color: "#b91c1c" },
    "medium": { background: "#fef3c7", color: "#b45309" },
    "low": { background: "#d1fae5", color: "#065f46" },
  };
  return (
    <span style={{ ...styles[status], padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
};

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div style={{ background: "#e5e7eb", borderRadius: "99px", height: "6px", width: "100%" }}>
    <div style={{ background: value > 70 ? "#2563eb" : value > 40 ? "#f59e0b" : "#94a3b8", width: `${value}%`, height: "100%", borderRadius: "99px", transition: "width 0.5s ease" }} />
  </div>
);

// ─── Dashboard View ───────────────────────────────────────────────────────────
const DashboardView: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
      {[
        { label: "Today's Appointments", value: "12", delta: "+2 vs yesterday", icon: "📅", color: "#2563eb" },
        { label: "Active Repairs", value: "5", delta: "2 due today", icon: "🔧", color: "#f59e0b" },
        { label: "Monthly Revenue", value: "$18,420", delta: "+12% this month", icon: "💰", color: "#10b981" },
        { label: "Low Stock Items", value: "3", delta: "Needs reorder", icon: "📦", color: "#ef4444" },
      ].map((kpi) => (
        <div key={kpi.label} style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>{kpi.label}</div>
            <div style={{ fontSize: "22px" }}>{kpi.icon}</div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>{kpi.value}</div>
          <div style={{ fontSize: "12px", color: kpi.color, fontWeight: 500 }}>{kpi.delta}</div>
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 600, color: "#111827", fontSize: "15px" }}>Today's Schedule</div>
          <span style={{ fontSize: "12px", color: "#6b7280", background: "#f9fafb", padding: "4px 10px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>Mar 6, 2026</span>
        </div>
        <div>
          {appointments.slice(0, 5).map((apt) => (
            <div key={apt.id} style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #f9fafb", gap: "12px" }}>
              <div style={{ background: "#f1f5f9", borderRadius: "8px", padding: "6px 10px", fontWeight: 700, fontSize: "13px", color: "#475569", minWidth: "52px", textAlign: "center" }}>{apt.time}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{apt.customer}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{apt.vehicle} · {apt.service}</div>
              </div>
              <StatusBadge status={apt.status} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ fontWeight: 600, color: "#111827", fontSize: "15px" }}>Active Repairs</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
          {repairs.slice(0, 4).map((r) => (
            <div key={r.id} style={{ padding: "14px 20px", borderBottom: "1px solid #f9fafb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>{r.plate}</span>
                  <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "8px" }}>{r.vehicle}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <StatusBadge status={r.priority} />
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{r.progress}%</span>
                </div>
              </div>
              <ProgressBar value={r.progress} />
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>ETA: {r.eta} · {r.mechanic}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 600, color: "#111827", fontSize: "15px" }}>Recent Invoices</div>
        <button style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>View all →</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Invoice", "Customer", "Services", "Date", "Amount", "Status"].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 20px", color: "#2563eb", fontWeight: 600 }}>{inv.id}</td>
                <td style={{ padding: "12px 20px", color: "#374151", fontWeight: 500 }}>{inv.customer}</td>
                <td style={{ padding: "12px 20px", color: "#6b7280" }}>{inv.services.join(", ")}</td>
                <td style={{ padding: "12px 20px", color: "#6b7280", whiteSpace: "nowrap" }}>{inv.date}</td>
                <td style={{ padding: "12px 20px", color: "#111827", fontWeight: 700 }}>${inv.amount.toFixed(2)}</td>
                <td style={{ padding: "12px 20px" }}><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── Appointments View ────────────────────────────────────────────────────────
const AppointmentsView: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {["All", "Pending", "Confirmed", "In Progress", "Completed"].map((f) => (
        <button key={f} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: f === "All" ? "#2563eb" : "#fff", color: f === "All" ? "#fff" : "#374151", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>{f}</button>
      ))}
      <div style={{ marginLeft: "auto" }}>
        <button style={{ padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>+ New Appointment</button>
      </div>
    </div>
    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {["ID", "Customer", "Vehicle", "Service", "Time", "Mechanic", "Status", "Actions"].map((h) => (
              <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt.id} style={{ borderTop: "1px solid #f3f4f6" }}>
              <td style={{ padding: "14px 16px", color: "#6b7280", fontFamily: "monospace" }}>{apt.id}</td>
              <td style={{ padding: "14px 16px", color: "#1e293b", fontWeight: 600 }}>{apt.customer}</td>
              <td style={{ padding: "14px 16px", color: "#475569" }}>{apt.vehicle}</td>
              <td style={{ padding: "14px 16px", color: "#475569" }}>{apt.service}</td>
              <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1e293b" }}>{apt.time}</td>
              <td style={{ padding: "14px 16px", color: "#475569" }}>{apt.mechanic}</td>
              <td style={{ padding: "14px 16px" }}><StatusBadge status={apt.status} /></td>
              <td style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ padding: "5px 12px", fontSize: "12px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "#374151" }}>Edit</button>
                  <button style={{ padding: "5px 12px", fontSize: "12px", border: "1px solid #fee2e2", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "#ef4444" }}>Cancel</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Inventory View ───────────────────────────────────────────────────────────
const InventoryView: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
      <input placeholder="Search inventory..." style={{ padding: "9px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#374151", outline: "none", width: "260px" }} />
      <button style={{ padding: "9px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>+ Add Item</button>
    </div>
    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {["SKU", "Item Name", "Stock", "Min Stock", "Unit", "Unit Price", "Status", "Actions"].map((h) => (
              <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => {
            const isLow = item.stock <= item.minStock;
            return (
              <tr key={item.id} style={{ borderTop: "1px solid #f3f4f6", background: isLow ? "#fffbeb" : "#fff" }}>
                <td style={{ padding: "14px 16px", color: "#6b7280", fontFamily: "monospace", fontSize: "12px" }}>{item.sku}</td>
                <td style={{ padding: "14px 16px", color: "#1e293b", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: isLow ? "#dc2626" : "#1e293b" }}>{item.stock}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{item.minStock}</td>
                <td style={{ padding: "14px 16px", color: "#475569" }}>{item.unit}</td>
                <td style={{ padding: "14px 16px", color: "#1e293b", fontWeight: 500 }}>${item.price.toFixed(2)}</td>
                <td style={{ padding: "14px 16px" }}>
                  {isLow ? <StatusBadge status="overdue" /> : <StatusBadge status="paid" />}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button style={{ padding: "5px 12px", fontSize: "12px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "#374151" }}>Restock</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Nav Icons (SVG) ──────────────────────────────────────────────────────────
const navItems: { id: NavItem; label: string; emoji: string }[] = [
  { id: "dashboard", label: "Dashboard", emoji: "⊞" },
  { id: "appointments", label: "Appointments", emoji: "📅" },
  { id: "repairs", label: "Repairs", emoji: "🔧" },
  { id: "inventory", label: "Inventory", emoji: "📦" },
  { id: "billing", label: "Billing", emoji: "💳" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkshopDesign1(): React.JSX.Element {
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");

  const pageTitles: Record<NavItem, string> = {
    dashboard: "Dashboard Overview",
    appointments: "Appointments",
    repairs: "Active Repairs",
    inventory: "Parts Inventory",
    billing: "Billing & Invoices",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
      `}</style>
      <div style={{ display: "flex", height: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Sidebar */}
        <aside style={{ width: "220px", minWidth: "220px", background: "#0f172a", display: "flex", flexDirection: "column", padding: "24px 0", zIndex: 10 }}>
          <div style={{ padding: "0 20px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#2563eb", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🔩</div>
              <div>
                <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: "15px", lineHeight: 1.2 }}>GarageOS</div>
                <div style={{ color: "#64748b", fontSize: "11px" }}>Workshop Suite</div>
              </div>
            </div>
          </div>

          <nav style={{ padding: "16px 12px", flex: 1 }}>
            <div style={{ fontSize: "10px", color: "#475569", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>MAIN</div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 10px",
                  borderRadius: "8px", border: "none", cursor: "pointer", marginBottom: "2px",
                  background: activeNav === item.id ? "rgba(37,99,235,0.2)" : "transparent",
                  color: activeNav === item.id ? "#60a5fa" : "#94a3b8",
                  fontSize: "13px", fontWeight: activeNav === item.id ? 600 : 400,
                  textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s ease"
                }}
              >
                <span style={{ fontSize: "15px", width: "18px", textAlign: "center" }}>{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#1e293b", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>👤</div>
              <div>
                <div style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600 }}>Alex Morgan</div>
                <div style={{ color: "#475569", fontSize: "11px" }}>Manager</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Top Bar */}
          <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{pageTitles[activeNav]}</h1>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Friday, March 6, 2026</div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", color: "#475569", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>🔔 3 Alerts</button>
              <button style={{ background: "#2563eb", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>+ Quick Add</button>
            </div>
          </header>

          {/* Page Content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {activeNav === "dashboard" && <DashboardView />}
            {activeNav === "appointments" && <AppointmentsView />}
            {activeNav === "repairs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {repairs.map((r) => (
                  <div key={r.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{r.plate}</span>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>{r.vehicle}</span>
                          <StatusBadge status={r.priority} />
                        </div>
                        <div style={{ fontSize: "13px", color: "#374151", marginTop: "4px" }}>{r.issue}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>Mechanic: <b style={{ color: "#374151" }}>{r.mechanic}</b></div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>ETA: <b style={{ color: "#374151" }}>{r.eta}</b></div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <ProgressBar value={r.progress} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", minWidth: "36px" }}>{r.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeNav === "inventory" && <InventoryView />}
            {activeNav === "billing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {[
                    { label: "Total Revenue (Mar)", value: "$18,420", color: "#10b981" },
                    { label: "Outstanding Invoices", value: "$280.50", color: "#f59e0b" },
                    { label: "Overdue Payments", value: "$95.00", color: "#ef4444" },
                  ].map((s) => (
                    <div key={s.label} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px" }}>
                      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>{s.label}</div>
                      <div style={{ fontSize: "26px", fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["Invoice ID", "Customer", "Services", "Date", "Amount", "Status", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "14px 16px", color: "#2563eb", fontWeight: 600 }}>{inv.id}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 500, color: "#1e293b" }}>{inv.customer}</td>
                          <td style={{ padding: "14px 16px", color: "#6b7280" }}>{inv.services.join(", ")}</td>
                          <td style={{ padding: "14px 16px", color: "#6b7280" }}>{inv.date}</td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#1e293b" }}>${inv.amount.toFixed(2)}</td>
                          <td style={{ padding: "14px 16px" }}><StatusBadge status={inv.status} /></td>
                          <td style={{ padding: "14px 16px" }}>
                            <button style={{ padding: "5px 12px", fontSize: "12px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "#374151" }}>View PDF</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
