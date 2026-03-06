"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = "overview" | "appointments" | "repairs" | "inventory" | "billing";

interface Appointment {
  id: string;
  customer: string;
  phone: string;
  vehicle: string;
  plate: string;
  service: string;
  date: string;
  time: string;
  mechanic: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

interface RepairJob {
  id: string;
  vehicle: string;
  plate: string;
  customer: string;
  description: string;
  parts: string[];
  progress: number;
  mechanic: string;
  bay: string;
  startDate: string;
  estimatedCost: number;
}

interface Part {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  stock: number;
  reorderAt: number;
  cost: number;
  supplier: string;
}

interface Invoice {
  id: string;
  customer: string;
  services: string[];
  subtotal: number;
  tax: number;
  total: number;
  issued: string;
  due: string;
  status: "draft" | "sent" | "paid" | "overdue";
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const APPOINTMENTS: Appointment[] = [
  { id: "APT-1044", customer: "James Okafor", phone: "604-555-0182", vehicle: "2020 Audi A4", plate: "AUD-2290", service: "Full Service", date: "Mar 6", time: "9:00 AM", mechanic: "Ben Walsh", status: "in-progress" },
  { id: "APT-1045", customer: "Nadia Petrova", phone: "604-555-0247", vehicle: "2018 Nissan Altima", plate: "NSN-4471", service: "Brake Replacement", date: "Mar 6", time: "11:00 AM", mechanic: "Sam Liu", status: "scheduled" },
  { id: "APT-1046", customer: "Ethan Brooks", phone: "778-555-0319", vehicle: "2023 Kia Sorento", plate: "KIA-6670", service: "Oil + Filter", date: "Mar 6", time: "1:00 PM", mechanic: "Ben Walsh", status: "scheduled" },
  { id: "APT-1047", customer: "Fatima Al-Nour", phone: "604-555-0081", vehicle: "2019 Subaru Outback", plate: "SUB-1182", service: "Wheel Alignment", date: "Mar 7", time: "10:00 AM", mechanic: "Unassigned", status: "scheduled" },
  { id: "APT-1048", customer: "Luke Carpenter", phone: "778-555-0556", vehicle: "2017 Dodge Ram", plate: "DGR-8844", service: "Engine Diagnostic", date: "Mar 7", time: "2:30 PM", mechanic: "Sam Liu", status: "completed" },
];

const REPAIRS: RepairJob[] = [
  { id: "REP-0291", vehicle: "Audi A4", plate: "AUD-2290", customer: "James Okafor", description: "60K mile service: oil, filter, cabin air, tire rotation", parts: ["5W-40 Oil", "OEM Filter", "Cabin Filter"], progress: 55, mechanic: "Ben Walsh", bay: "A1", startDate: "Mar 6", estimatedCost: 320 },
  { id: "REP-0292", vehicle: "Honda CR-V", plate: "HND-0031", customer: "Chloe Dawson", description: "Rear brake pads worn below minimum", parts: ["Rear Brake Pads", "Brake Fluid"], progress: 80, mechanic: "Sam Liu", bay: "B2", startDate: "Mar 5", estimatedCost: 210 },
  { id: "REP-0293", vehicle: "Ford Explorer", plate: "FRD-5578", customer: "Ray Gutierrez", description: "Check engine light: O2 sensor fault code P0138", parts: ["O2 Sensor", "Sealant"], progress: 30, mechanic: "Tina Park", bay: "A3", startDate: "Mar 6", estimatedCost: 185 },
];

const PARTS: Part[] = [
  { id: "P001", name: "5W-40 Synthetic Oil (1L)", partNumber: "OIL-540-1L", category: "Fluids", stock: 60, reorderAt: 20, cost: 14.50, supplier: "AutoSource Inc." },
  { id: "P002", name: "Front Brake Pads (Universal)", partNumber: "BRK-F-UNI", category: "Brakes", stock: 8, reorderAt: 10, cost: 38.00, supplier: "BrakeMaster Co." },
  { id: "P003", name: "Cabin Air Filter (Standard)", partNumber: "FLT-CAB-STD", category: "Filters", stock: 15, reorderAt: 8, cost: 16.00, supplier: "FilterPro" },
  { id: "P004", name: "O2 Sensor (Universal)", partNumber: "SNS-O2-UNI", category: "Sensors", stock: 4, reorderAt: 6, cost: 45.00, supplier: "Denso Parts" },
  { id: "P005", name: "ATF Transmission Fluid (1L)", partNumber: "FLD-ATF-1L", category: "Fluids", stock: 2, reorderAt: 10, cost: 24.00, supplier: "AutoSource Inc." },
  { id: "P006", name: "NGK Spark Plug (each)", partNumber: "IGN-NGK-EA", category: "Ignition", stock: 48, reorderAt: 20, cost: 7.50, supplier: "NGK Canada" },
];

const INVOICES: Invoice[] = [
  { id: "INV-5501", customer: "Luke Carpenter", services: ["Engine Diagnostic", "Labor 2hrs"], subtotal: 280, tax: 36.40, total: 316.40, issued: "Mar 5", due: "Mar 15", status: "sent" },
  { id: "INV-5500", customer: "Chloe Dawson", services: ["Rear Brake Pads", "Brake Fluid", "Labor"], subtotal: 185, tax: 24.05, total: 209.05, issued: "Mar 5", due: "Mar 12", status: "paid" },
  { id: "INV-5498", customer: "Helen Park", services: ["Oil Change", "Tire Rotation"], subtotal: 95, tax: 12.35, total: 107.35, issued: "Feb 27", due: "Mar 6", status: "overdue" },
  { id: "INV-5495", customer: "Omar Khalil", services: ["Transmission Service", "Filter x3"], subtotal: 620, tax: 80.60, total: 700.60, issued: "Feb 24", due: "Mar 3", status: "paid" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Chip: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    "scheduled":   { bg: "#eff6ff", color: "#1d4ed8", label: "Scheduled" },
    "in-progress": { bg: "#fefce8", color: "#a16207", label: "In Progress" },
    "completed":   { bg: "#f0fdf4", color: "#166534", label: "Completed" },
    "cancelled":   { bg: "#fef2f2", color: "#b91c1c", label: "Cancelled" },
    "draft":       { bg: "#f8fafc", color: "#475569", label: "Draft" },
    "sent":        { bg: "#eff6ff", color: "#1d4ed8", label: "Sent" },
    "paid":        { bg: "#f0fdf4", color: "#166534", label: "Paid" },
    "overdue":     { bg: "#fef2f2", color: "#b91c1c", label: "Overdue" },
  };
  const s = map[status] ?? { bg: "#f1f5f9", color: "#334155", label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

const Ring: React.FC<{ value: number; size?: number }> = ({ value, size = 52 }) => {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 75 ? "#16a34a" : value >= 40 ? "#d97706" : "#dc2626";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
};

// ─── Tab Content ──────────────────────────────────────────────────────────────
const OverviewTab: React.FC = () => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
      {[
        { title: "Appointments", value: 5, sub: "Today", trend: "+2", trendUp: true, icon: "🗓" },
        { title: "Active Repairs", value: 3, sub: "In workshop", trend: "On track", trendUp: true, icon: "⚙️" },
        { title: "Low Stock Parts", value: 3, sub: "Need reorder", trend: "Action needed", trendUp: false, icon: "⚠️" },
        { title: "Today's Revenue", value: "$1,025", sub: "2 invoices", trend: "+12%", trendUp: true, icon: "📊" },
      ].map((s) => (
        <div key={s.title} style={{
          background: "#fff", borderRadius: 14, padding: "20px 22px",
          boxShadow: "0 1px 3px rgba(15,23,42,0.07)",
          border: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: s.trendUp ? "#16a34a" : "#dc2626",
              background: s.trendUp ? "#f0fdf4" : "#fef2f2",
              padding: "2px 8px", borderRadius: 6,
            }}>{s.trend}</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{s.value}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginTop: 2 }}>{s.title}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{s.sub}</div>
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 1px 3px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Today's Appointments</h3>
          <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}>View all →</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {APPOINTMENTS.slice(0, 4).map((a) => (
            <div key={a.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", background: "#f8fafc", borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}>
              <div style={{
                width: 40, textAlign: "center", background: "#3b82f6",
                color: "#fff", borderRadius: 8, padding: "4px 6px",
                fontSize: 11, fontWeight: 700, lineHeight: 1.2, flexShrink: 0,
              }}>
                {a.time.replace(" AM", "").replace(" PM", "")}
                <div style={{ fontSize: 9, opacity: 0.8 }}>{a.time.includes("AM") ? "AM" : "PM"}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.customer}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{a.vehicle} · {a.service}</div>
              </div>
              <Chip status={a.status} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 1px 3px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Repair Progress</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {REPAIRS.map((r) => (
            <div key={r.id} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{r.vehicle}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Bay {r.bay} · {r.mechanic}</div>
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ring value={r.progress} size={44} />
                  <div style={{ position: "absolute", fontSize: 10, fontWeight: 800, color: "#0f172a" }}>{r.progress}%</div>
                </div>
              </div>
              <div style={{ background: "#e2e8f0", borderRadius: 4, height: 4, overflow: "hidden" }}>
                <div style={{ width: `${r.progress}%`, height: "100%", background: r.progress >= 75 ? "#16a34a" : "#3b82f6", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AppointmentsTab: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>All Appointments</h3>
          <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Schedule</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["ID", "Customer", "Vehicle", "Service", "Date & Time", "Mechanic", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {APPOINTMENTS.map((a, i) => (
              <tr key={a.id} onClick={() => setSelected(selected === a.id ? null : a.id)} style={{
                borderBottom: i < APPOINTMENTS.length - 1 ? "1px solid #f8fafc" : "none",
                cursor: "pointer", background: selected === a.id ? "#eff6ff" : "transparent",
              }}>
                <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#3b82f6" }}>{a.id}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{a.customer}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.phone}</div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, color: "#334155" }}>{a.vehicle}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.plate}</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#334155" }}>{a.service}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{a.time}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.date}</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#334155" }}>{a.mechanic}</td>
                <td style={{ padding: "12px 16px" }}><Chip status={a.status} /></td>
                <td style={{ padding: "12px 16px", textAlign: "center", color: "#94a3b8", fontSize: 16 }}>›</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected !== null && (() => {
        const a = APPOINTMENTS.find((x) => x.id === selected);
        if (!a) return null;
        return (
          <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9", alignSelf: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <Chip status={a.status} />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Customer", value: a.customer },
                { label: "Phone", value: a.phone },
                { label: "Vehicle", value: a.vehicle },
                { label: "Plate", value: a.plate },
                { label: "Service", value: a.service },
                { label: "Date", value: `${a.date} · ${a.time}` },
                { label: "Mechanic", value: a.mechanic },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f8fafc", paddingBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button style={{ flex: 1, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>
              <button style={{ flex: 1, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const RepairsTab: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {REPAIRS.map((r) => (
      <div key={r.id} style={{
        background: "#fff", borderRadius: 14, padding: 22,
        boxShadow: "0 1px 3px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9",
        display: "grid", gridTemplateColumns: "1fr auto", gap: 20,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", padding: "3px 10px", borderRadius: 6 }}>{r.id}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{r.vehicle}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{r.plate}</span>
            <span style={{ background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 6 }}>Bay {r.bay}</span>
          </div>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 14, lineHeight: 1.6 }}>{r.description}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {r.parts.map((p) => (
              <span key={p} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 6 }}>
                📦 {p}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>👤 {r.mechanic}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>📅 {r.startDate}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>Est. ${r.estimatedCost}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, minWidth: 80 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ring value={r.progress} size={64} />
            <div style={{ position: "absolute", fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{r.progress}%</div>
          </div>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Complete</span>
          <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Update</button>
        </div>
      </div>
    ))}
  </div>
);

const InventoryTab: React.FC = () => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <input placeholder="🔍 Search parts or SKU…" style={{
          border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 14px",
          fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", width: 240,
        }} />
        <select style={{ border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#334155", background: "#fff", cursor: "pointer" }}>
          <option>All Categories</option>
          <option>Fluids</option>
          <option>Brakes</option>
          <option>Filters</option>
        </select>
      </div>
      <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Part</button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
      {PARTS.map((p) => {
        const isLow = p.stock <= p.reorderAt;
        return (
          <div key={p.id} style={{
            background: "#fff", borderRadius: 14, padding: 18,
            border: `1.5px solid ${isLow ? "#fecaca" : "#f1f5f9"}`,
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, textTransform: "uppercase" }}>{p.category}</span>
              {isLow && <span style={{ background: "#fef2f2", color: "#dc2626", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>LOW STOCK</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>{p.partNumber}</div>
            <div style={{ background: "#f1f5f9", borderRadius: 8, overflow: "hidden", height: 5, marginBottom: 8 }}>
              <div style={{ width: `${Math.min(100, (p.stock / (p.reorderAt * 2)) * 100)}%`, height: "100%", background: isLow ? "#dc2626" : "#3b82f6", borderRadius: 8 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 22, fontWeight: 800, color: isLow ? "#dc2626" : "#0f172a" }}>{p.stock}</span>
                <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>/ min {p.reorderAt}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>${p.cost.toFixed(2)}</div>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>📦 {p.supplier}</div>
          </div>
        );
      })}
    </div>
  </div>
);

const BillingTab: React.FC = () => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 22 }}>
      {[
        { label: "Total Issued", value: `$${INVOICES.reduce((a, i) => a + i.total, 0).toFixed(2)}`, color: "#0f172a", bg: "#f8fafc" },
        { label: "Collected", value: `$${INVOICES.filter((i) => i.status === "paid").reduce((a, i) => a + i.total, 0).toFixed(2)}`, color: "#16a34a", bg: "#f0fdf4" },
        { label: "Overdue", value: `$${INVOICES.filter((i) => i.status === "overdue").reduce((a, i) => a + i.total, 0).toFixed(2)}`, color: "#dc2626", bg: "#fef2f2" },
      ].map((s) => (
        <div key={s.label} style={{ background: s.bg, border: "1px solid #f1f5f9", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginTop: 3 }}>{s.label}</div>
        </div>
      ))}
    </div>
    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.07)", border: "1px solid #f1f5f9" }}>
      <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Invoices</h3>
        <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Invoice</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
            {["Invoice", "Customer", "Services", "Subtotal", "Tax", "Total", "Issued", "Due", "Status", ""].map((h) => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INVOICES.map((inv, i) => (
            <tr key={inv.id} style={{ borderBottom: i < INVOICES.length - 1 ? "1px solid #f8fafc" : "none" }}>
              <td style={{ padding: "13px 16px", fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>{inv.id}</td>
              <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{inv.customer}</td>
              <td style={{ padding: "13px 16px", fontSize: 11, color: "#64748b" }}>{inv.services.slice(0, 2).join(", ")}{inv.services.length > 2 ? "…" : ""}</td>
              <td style={{ padding: "13px 16px", fontSize: 13, color: "#334155" }}>${inv.subtotal.toFixed(2)}</td>
              <td style={{ padding: "13px 16px", fontSize: 12, color: "#94a3b8" }}>${inv.tax.toFixed(2)}</td>
              <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>${inv.total.toFixed(2)}</td>
              <td style={{ padding: "13px 16px", fontSize: 12, color: "#64748b" }}>{inv.issued}</td>
              <td style={{ padding: "13px 16px", fontSize: 12, color: inv.status === "overdue" ? "#dc2626" : "#64748b", fontWeight: inv.status === "overdue" ? 700 : 400 }}>{inv.due}</td>
              <td style={{ padding: "13px 16px" }}><Chip status={inv.status} /></td>
              <td style={{ padding: "13px 16px" }}>
                <button style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#475569", cursor: "pointer", fontWeight: 600 }}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkshopDesign2(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: Array<{ id: TabId; label: string; count?: number }> = [
    { id: "overview", label: "Overview" },
    { id: "appointments", label: "Appointments", count: 5 },
    { id: "repairs", label: "Repairs", count: 3 },
    { id: "inventory", label: "Inventory" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 40 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🔧</div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>GearShift</span>
              <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 6 }}>Pro</span>
            </div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", height: "100%", flex: 1 }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                height: "100%", padding: "0 18px", background: "none", border: "none",
                borderBottom: `2px solid ${activeTab === t.id ? "#2563eb" : "transparent"}`,
                color: activeTab === t.id ? "#2563eb" : "#64748b",
                fontSize: 14, fontWeight: activeTab === t.id ? 700 : 500,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>
                {t.label}
                {t.count !== undefined && (
                  <span style={{ background: activeTab === t.id ? "#eff6ff" : "#f1f5f9", color: activeTab === t.id ? "#2563eb" : "#94a3b8", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#64748b" }}>Mar 6, 2026</div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>BT</div>
          </div>
        </div>
      </header>

      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "16px 32px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 2 }}>
          {tabs.find((t) => t.id === activeTab)?.label}
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>GearShift Workshop Management · Vancouver, BC</p>
      </div>

      <main style={{ padding: "24px 32px" }}>
        {activeTab === "overview"     && <OverviewTab />}
        {activeTab === "appointments" && <AppointmentsTab />}
        {activeTab === "repairs"      && <RepairsTab />}
        {activeTab === "inventory"    && <InventoryTab />}
        {activeTab === "billing"      && <BillingTab />}
      </main>
    </div>
  );
}
