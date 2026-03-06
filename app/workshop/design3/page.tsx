"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "home" | "calendar" | "shop" | "parts" | "finance";

interface Job {
  id: string;
  ref: string;
  owner: string;
  car: string;
  reg: string;
  issue: string;
  assigned: string;
  bay: number;
  pct: number;
  cost: number;
  stage: "queued" | "active" | "testing" | "ready";
}

interface Slot {
  id: string;
  time: string;
  name: string;
  car: string;
  job: string;
  tech: string;
  confirmed: boolean;
}

interface Stock {
  id: string;
  desc: string;
  code: string;
  cat: string;
  qty: number;
  low: number;
  each: number;
}

interface Bill {
  ref: string;
  client: string;
  car: string;
  lines: string[];
  net: number;
  vat: number;
  gross: number;
  raised: string;
  state: "open" | "paid" | "late";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const JOBS: Job[] = [
  { id: "J-4401", ref: "ORD-9901", owner: "Claire Bouchard", car: "Volvo XC60", reg: "VXC-4401", issue: "Suspension noise front right, CV joint suspected", assigned: "Yusuf A.", bay: 1, pct: 72, cost: 480, stage: "active" },
  { id: "J-4402", ref: "ORD-9902", owner: "Ben Hayashi", car: "Toyota RAV4", reg: "TYR-2209", issue: "Intermittent stall, idle issues, MAF sensor cleaning", assigned: "Petra K.", bay: 2, pct: 35, cost: 260, stage: "active" },
  { id: "J-4403", ref: "ORD-9903", owner: "Sofia Mendez", car: "BMW X3", reg: "BMW-8812", issue: "Oil service + brake fluid flush 60k service", assigned: "Yusuf A.", bay: 3, pct: 95, cost: 340, stage: "testing" },
  { id: "J-4404", ref: "ORD-9904", owner: "Raj Patel", car: "Hyundai Tucson", reg: "HYN-3301", issue: "AC not cooling, compressor and refrigerant check", assigned: "Unassigned", bay: 0, pct: 0, cost: 390, stage: "queued" },
];

const SLOTS: Slot[] = [
  { id: "S-01", time: "08:30", name: "Tom Whitley", car: "Ford Focus", job: "Full Service", tech: "Petra K.", confirmed: true },
  { id: "S-02", time: "09:45", name: "Amy Lim", car: "Mazda CX-5", job: "Tire Rotation + Balance", tech: "Yusuf A.", confirmed: true },
  { id: "S-03", time: "11:00", name: "Gerard Flynn", car: "VW Passat", job: "Diagnostic Scan", tech: "TBD", confirmed: false },
  { id: "S-04", time: "13:30", name: "Diana Osei", car: "Honda Jazz", job: "Timing Belt", tech: "Petra K.", confirmed: true },
  { id: "S-05", time: "15:00", name: "Ian Novak", car: "Skoda Octavia", job: "Brake Pads (F+R)", tech: "Yusuf A.", confirmed: false },
];

const STOCK: Stock[] = [
  { id: "ST001", desc: "Castrol EDGE 5W-30 1L", code: "CST-530-1L", cat: "Oil", qty: 72, low: 24, each: 13.50 },
  { id: "ST002", desc: "Bosch Brake Pad Set Front", code: "BSH-BPF-SET", cat: "Brakes", qty: 6, low: 8, each: 44.00 },
  { id: "ST003", desc: "Valeo Oil Filter (Universal)", code: "VLO-OFL-UNI", cat: "Filters", qty: 29, low: 12, each: 9.80 },
  { id: "ST004", desc: "Bosch MAF Sensor", code: "BSH-MAF-UNI", cat: "Sensors", qty: 3, low: 4, each: 89.00 },
  { id: "ST005", desc: "Comma Brake Fluid DOT4 500ml", code: "CMM-BF4-500", cat: "Fluids", qty: 18, low: 6, each: 8.40 },
  { id: "ST006", desc: "NGK Iridium Spark Plug", code: "NGK-IRI-EA", cat: "Ignition", qty: 64, low: 24, each: 11.20 },
  { id: "ST007", desc: "AC Refrigerant R134a 1kg", code: "ACR-134A-1K", cat: "AC", qty: 2, low: 5, each: 28.00 },
];

const BILLS: Bill[] = [
  { ref: "2024-188", client: "Sofia Mendez", car: "BMW X3", lines: ["60K Service", "Brake Fluid", "Labour 2h"], net: 283.33, vat: 56.67, gross: 340.00, raised: "Mar 6", state: "open" },
  { ref: "2024-187", client: "Amy Lim", car: "Mazda CX-5", lines: ["Tire Rotation", "Balance x4"], net: 79.17, vat: 15.83, gross: 95.00, raised: "Mar 5", state: "paid" },
  { ref: "2024-185", client: "Tom Whitley", car: "Ford Focus", lines: ["Full Service", "Air Filter"], net: 175.00, vat: 35.00, gross: 210.00, raised: "Feb 28", state: "late" },
  { ref: "2024-183", client: "Ian Novak", car: "Skoda Octavia", lines: ["Brake Pads F+R", "Labour"], net: 229.17, vat: 45.83, gross: 275.00, raised: "Feb 25", state: "paid" },
];

// ─── Reusable Components ──────────────────────────────────────────────────────
const Tag: React.FC<{ v: string }> = ({ v }) => {
  const c: Record<string, [string, string]> = {
    queued:  ["#f1f5f9", "#64748b"],
    active:  ["#ecfdf5", "#065f46"],
    testing: ["#fffbeb", "#92400e"],
    ready:   ["#f0fdf4", "#166534"],
    open:    ["#eff6ff", "#1e40af"],
    paid:    ["#ecfdf5", "#065f46"],
    late:    ["#fef2f2", "#991b1b"],
  };
  const [bg, fg] = c[v] ?? ["#f1f5f9", "#334155"];
  const labels: Record<string, string> = {
    queued: "Queued", active: "Active", testing: "Testing",
    ready: "Ready", open: "Open", paid: "Paid", late: "Overdue",
  };
  return (
    <span style={{
      background: bg, color: fg, fontSize: 10, fontWeight: 700,
      padding: "2px 9px", borderRadius: 4, letterSpacing: "0.06em", textTransform: "uppercase",
    }}>
      {labels[v] ?? v}
    </span>
  );
};

const Bar: React.FC<{ pct: number }> = ({ pct }) => (
  <div style={{ height: 3, background: "#e2e8e2", borderRadius: 2, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${pct}%`,
      background: pct >= 80 ? "#059669" : pct >= 50 ? "#6366f1" : "#f59e0b",
      borderRadius: 2,
    }} />
  </div>
);

// ─── Right Panel ──────────────────────────────────────────────────────────────
const RightPanel: React.FC<{ section: Section }> = ({ section }) => {
  const allLabels: Record<Section, Array<{ k: string; v: string }>> = {
    home:     [{ k: "Active Jobs", v: "3" }, { k: "In Queue", v: "1" }, { k: "Today's Slots", v: "5" }, { k: "Revenue MTD", v: "$4,820" }, { k: "Low Stock", v: "4 items" }, { k: "Mechanics On", v: "2 / 3" }],
    calendar: [{ k: "Today's Bookings", v: "5" }, { k: "Confirmed", v: "3" }, { k: "Awaiting Confirm", v: "2" }, { k: "Utilisation", v: "83%" }],
    shop:     [{ k: "Open Jobs", v: "4" }, { k: "In Progress", v: "2" }, { k: "Near Complete", v: "1" }, { k: "Est. Revenue", v: "$1,470" }],
    parts:    [{ k: "Total SKUs", v: "7" }, { k: "Low / Out", v: "4" }, { k: "Stock Value", v: "$3,114" }, { k: "Pending Orders", v: "2" }],
    finance:  [{ k: "Invoiced MTD", v: "$920" }, { k: "Collected", v: "$570" }, { k: "Outstanding", v: "$350" }, { k: "Overdue", v: "$210" }],
  };

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: "#f8faf8",
      borderLeft: "1px solid #dde8dd", padding: "28px 20px",
      display: "flex", flexDirection: "column", gap: 28, overflowY: "auto",
    }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#7a9b7a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Summary</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {allLabels[section].map((row) => (
            <div key={row.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, color: "#5c7a5c" }}>{row.k}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a" }}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#7a9b7a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Mechanics</div>
        {[
          { name: "Yusuf A.", jobs: 2, on: true },
          { name: "Petra K.", jobs: 2, on: true },
          { name: "Mei T.", jobs: 0, on: false },
        ].map((m) => (
          <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: m.on ? "#d1fae5" : "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: m.on ? "#065f46" : "#94a3b8",
            }}>
              {m.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1a2e1a" }}>{m.name}</div>
              <div style={{ fontSize: 10, color: "#7a9b7a" }}>{m.on ? `${m.jobs} jobs` : "Day off"}</div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: m.on ? "#10b981" : "#d1d5db" }} />
          </div>
        ))}
      </div>

      <div style={{ background: "#fff8ed", border: "1px solid #fde68a", borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>Stock Alert</div>
        <div style={{ fontSize: 11, color: "#78350f", lineHeight: 1.5 }}>4 parts below reorder threshold. Review inventory.</div>
      </div>
    </aside>
  );
};

// ─── Home ─────────────────────────────────────────────────────────────────────
const HomeSection: React.FC = () => (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 24 }}>
      {[
        { n: "Active Repairs", v: "3", d: "2 mechanics working", c: "#6366f1" },
        { n: "Today's Bookings", v: "5", d: "3 confirmed · 2 pending", c: "#059669" },
        { n: "Low Stock Items", v: "4", d: "Parts need ordering", c: "#f59e0b" },
        { n: "Open Invoices", v: "$625", d: "1 overdue", c: "#dc2626" },
      ].map((s) => (
        <div key={s.n} style={{
          background: "#fff", border: "1px solid #dde8dd", borderRadius: 12,
          padding: "18px 20px", borderLeft: `4px solid ${s.c}`,
        }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#1a2e1a", letterSpacing: "-0.03em" }}>{s.v}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#2d4a2d", marginTop: 2 }}>{s.n}</div>
          <div style={{ fontSize: 11, color: "#7a9b7a", marginTop: 3 }}>{s.d}</div>
        </div>
      ))}
    </div>
    <h3 style={{ fontSize: 11, fontWeight: 700, color: "#7a9b7a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Active Repair Orders</h3>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {JOBS.map((j) => (
        <div key={j.id} style={{
          background: "#fff", border: "1px solid #dde8dd", borderRadius: 12,
          padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "#eef2ff", padding: "2px 8px", borderRadius: 4 }}>{j.id}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a" }}>{j.car}</span>
              <span style={{ fontSize: 11, color: "#7a9b7a" }}>{j.reg}</span>
              <Tag v={j.stage} />
            </div>
            <div style={{ fontSize: 12, color: "#5c7a5c", marginBottom: 10, lineHeight: 1.5 }}>{j.issue}</div>
            <Bar pct={j.pct} />
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1a2e1a" }}>{j.pct}%</div>
            <div style={{ fontSize: 11, color: "#7a9b7a" }}>{j.assigned}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2d4a2d", marginTop: 4 }}>£{j.cost}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Calendar ─────────────────────────────────────────────────────────────────
const CalendarSection: React.FC = () => {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a2e1a" }}>Friday, 6 March 2026</h2>
          <p style={{ fontSize: 12, color: "#7a9b7a", marginTop: 2 }}>5 bookings · 3 confirmed</p>
        </div>
        <button style={{ background: "#2d4a2d", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Book Slot</button>
      </div>
      <div style={{ background: "#fff", border: "1px solid #dde8dd", borderRadius: 14, overflow: "hidden" }}>
        {hours.map((h, i) => {
          const slot = SLOTS.find((s) => s.time.startsWith(h.split(":")[0]));
          return (
            <div key={h} style={{ display: "flex", borderBottom: i < hours.length - 1 ? "1px solid #f0f5f0" : "none", minHeight: 56 }}>
              <div style={{ width: 56, flexShrink: 0, padding: "16px 12px", fontSize: 11, fontWeight: 600, color: "#7a9b7a", borderRight: "1px solid #f0f5f0" }}>
                {h}
              </div>
              <div style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center" }}>
                {slot ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, width: "100%",
                    background: slot.confirmed ? "#f0fdf4" : "#fefce8",
                    borderRadius: 8, padding: "8px 14px",
                    border: `1px solid ${slot.confirmed ? "#bbf7d0" : "#fde68a"}`,
                  }}>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e1a" }}>{slot.name}</div>
                      <div style={{ fontSize: 11, color: "#5c7a5c" }}>{slot.car}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#2d4a2d" }}>{slot.job}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#7a9b7a" }}>{slot.tech}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: slot.confirmed ? "#dcfce7" : "#fef9c3",
                      color: slot.confirmed ? "#166534" : "#854d0e",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      {slot.confirmed ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "#c7d9c7" }}>Available</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Workshop ─────────────────────────────────────────────────────────────────
const ShopSection: React.FC = () => {
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const job = JOBS.find((j) => j.id === activeJob);

  return (
    <div style={{ display: "grid", gridTemplateColumns: activeJob ? "1fr 300px" : "1fr", gap: 18 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1a2e1a" }}>Workshop Floor</h2>
          <button style={{ background: "#2d4a2d", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Job</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
          {[1,2,3,4,5,6,7,8].map((bay) => {
            const j = JOBS.find((x) => x.bay === bay);
            return (
              <div key={bay}
                onClick={() => j && setActiveJob(j.id === activeJob ? null : j.id)}
                style={{
                  background: j ? "#fff" : "#f8faf8", border: `1.5px solid ${j ? "#6366f1" : "#dde8dd"}`,
                  borderRadius: 10, padding: "12px 14px", minHeight: 80, cursor: j ? "pointer" : "default",
                }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: j ? "#6366f1" : "#7a9b7a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Bay {bay}</div>
                {j ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1a2e1a" }}>{j.car}</div>
                    <div style={{ fontSize: 11, color: "#5c7a5c", marginTop: 2, marginBottom: 8 }}>{j.assigned}</div>
                    <Bar pct={j.pct} />
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: "#b8ccb8" }}>Free</div>
                )}
              </div>
            );
          })}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid #dde8dd" }}>
              {["Ref", "Owner", "Vehicle", "Issue", "Mechanic", "Bay", "Progress", "Stage"].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#7a9b7a", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {JOBS.map((j, i) => (
              <tr key={j.id}
                onClick={() => setActiveJob(j.id === activeJob ? null : j.id)}
                style={{ borderBottom: i < JOBS.length - 1 ? "1px solid #f0f5f0" : "none", background: activeJob === j.id ? "#f0fdf4" : "transparent", cursor: "pointer" }}>
                <td style={{ padding: "12px 12px", fontSize: 11, fontWeight: 700, color: "#6366f1" }}>{j.id}</td>
                <td style={{ padding: "12px 12px", fontSize: 12, fontWeight: 600, color: "#1a2e1a" }}>{j.owner}</td>
                <td style={{ padding: "12px 12px" }}>
                  <div style={{ fontSize: 12, color: "#2d4a2d" }}>{j.car}</div>
                  <div style={{ fontSize: 10, color: "#7a9b7a" }}>{j.reg}</div>
                </td>
                <td style={{ padding: "12px 12px", fontSize: 11, color: "#5c7a5c", maxWidth: 180 }}>{j.issue.slice(0, 40)}…</td>
                <td style={{ padding: "12px 12px", fontSize: 11, color: "#5c7a5c" }}>{j.assigned}</td>
                <td style={{ padding: "12px 12px", fontSize: 12, fontWeight: 600, color: "#1a2e1a" }}>{j.bay || "—"}</td>
                <td style={{ padding: "12px 12px", width: 80 }}>
                  <div style={{ marginBottom: 4, fontSize: 11, fontWeight: 700, color: "#1a2e1a" }}>{j.pct}%</div>
                  <Bar pct={j.pct} />
                </td>
                <td style={{ padding: "12px 12px" }}><Tag v={j.stage} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {job !== undefined && (
        <div style={{ background: "#fff", border: "1px solid #dde8dd", borderRadius: 14, padding: 20, alignSelf: "flex-start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <Tag v={job.stage} />
            <button onClick={() => setActiveJob(null)} style={{ background: "none", border: "none", fontSize: 17, cursor: "pointer", color: "#7a9b7a" }}>✕</button>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1a2e1a", marginBottom: 4 }}>{job.car}</h3>
          <p style={{ fontSize: 12, color: "#7a9b7a", marginBottom: 16 }}>{job.reg} · Bay {job.bay}</p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5c7a5c" }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1a2e1a" }}>{job.pct}%</span>
            </div>
            <div style={{ background: "#e2e8e2", borderRadius: 3, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${job.pct}%`, height: "100%", background: job.pct >= 80 ? "#059669" : "#6366f1", borderRadius: 3 }} />
            </div>
          </div>
          {[
            { l: "Customer", v: job.owner },
            { l: "Mechanic", v: job.assigned },
            { l: "Est. Cost", v: `£${job.cost}` },
            { l: "Order Ref", v: job.ref },
          ].map((r) => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f5f0" }}>
              <span style={{ fontSize: 11, color: "#7a9b7a" }}>{r.l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1a2e1a" }}>{r.v}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#5c7a5c", marginTop: 14, lineHeight: 1.6, padding: "10px 12px", background: "#f8faf8", borderRadius: 8 }}>{job.issue}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={{ flex: 1, background: "#2d4a2d", color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Update</button>
            <button style={{ flex: 1, background: "#f8faf8", color: "#5c7a5c", border: "1px solid #dde8dd", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Invoice</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Parts ────────────────────────────────────────────────────────────────────
const PartsSection: React.FC = () => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1a2e1a" }}>Parts & Inventory</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="Search..." style={{ border: "1px solid #dde8dd", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#1a2e1a", background: "#fff", outline: "none", width: 180 }} />
        <button style={{ background: "#2d4a2d", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add</button>
      </div>
    </div>
    <div style={{ background: "#fff", border: "1px solid #dde8dd", borderRadius: 14, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8faf8", borderBottom: "1px solid #dde8dd" }}>
            {["Code", "Description", "Category", "Stock", "Min", "Unit Price", "Status"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#7a9b7a", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STOCK.map((s, i) => {
            const low = s.qty <= s.low;
            return (
              <tr key={s.id} style={{ borderBottom: i < STOCK.length - 1 ? "1px solid #f0f5f0" : "none", background: low ? "#fffbf0" : "transparent" }}>
                <td style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "#6366f1" }}>{s.code}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#1a2e1a" }}>{s.desc}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ background: "#f0fdf4", color: "#166534", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>{s.cat}</span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: low ? "#dc2626" : "#1a2e1a" }}>{s.qty}</span>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "#7a9b7a" }}>{s.low}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#1a2e1a" }}>£{s.each.toFixed(2)}</td>
                <td style={{ padding: "12px 14px" }}>
                  {low
                    ? <span style={{ background: "#fef2f2", color: "#dc2626", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Reorder</span>
                    : <span style={{ background: "#f0fdf4", color: "#166534", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>OK</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Finance ──────────────────────────────────────────────────────────────────
const FinanceSection: React.FC = () => {
  const total = BILLS.reduce((a, b) => a + b.gross, 0);
  const paid = BILLS.filter((b) => b.state === "paid").reduce((a, b) => a + b.gross, 0);
  const late = BILLS.filter((b) => b.state === "late").reduce((a, b) => a + b.gross, 0);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { l: "Invoiced", v: `£${total.toFixed(2)}`, c: "#1a2e1a" },
          { l: "Collected", v: `£${paid.toFixed(2)}`, c: "#059669" },
          { l: "Outstanding", v: `£${(total - paid).toFixed(2)}`, c: "#f59e0b" },
          { l: "Overdue", v: `£${late.toFixed(2)}`, c: "#dc2626" },
        ].map((s) => (
          <div key={s.l} style={{ background: "#fff", border: "1px solid #dde8dd", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c, letterSpacing: "-0.02em" }}>{s.v}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#7a9b7a", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #dde8dd", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #dde8dd" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a2e1a" }}>Invoice Register</h3>
          <button style={{ background: "#2d4a2d", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Raise Invoice</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8faf8", borderBottom: "1px solid #dde8dd" }}>
              {["Ref", "Client", "Vehicle", "Line Items", "Net", "VAT", "Gross", "Raised", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#7a9b7a", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BILLS.map((b, i) => (
              <tr key={b.ref} style={{ borderBottom: i < BILLS.length - 1 ? "1px solid #f0f5f0" : "none" }}>
                <td style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "#6366f1" }}>{b.ref}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#1a2e1a" }}>{b.client}</td>
                <td style={{ padding: "12px 14px", fontSize: 11, color: "#5c7a5c" }}>{b.car}</td>
                <td style={{ padding: "12px 14px", fontSize: 11, color: "#7a9b7a" }}>{b.lines.slice(0, 2).join(", ")}</td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "#334155" }}>£{b.net.toFixed(2)}</td>
                <td style={{ padding: "12px 14px", fontSize: 11, color: "#94a3b8" }}>£{b.vat.toFixed(2)}</td>
                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#1a2e1a" }}>£{b.gross.toFixed(2)}</td>
                <td style={{ padding: "12px 14px", fontSize: 11, color: "#7a9b7a" }}>{b.raised}</td>
                <td style={{ padding: "12px 14px" }}><Tag v={b.state} /></td>
                <td style={{ padding: "12px 14px" }}>
                  <button style={{ background: "none", border: "1px solid #dde8dd", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#5c7a5c", cursor: "pointer", fontWeight: 600 }}>PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function WorkshopDesign3(): React.JSX.Element {
  const [section, setSection] = useState<Section>("home");

  const nav: Array<{ id: Section; icon: string; label: string }> = [
    { id: "home",     icon: "⊞",  label: "Home" },
    { id: "calendar", icon: "📅", label: "Calendar" },
    { id: "shop",     icon: "🔩", label: "Workshop" },
    { id: "parts",    icon: "📦", label: "Parts" },
    { id: "finance",  icon: "🧾", label: "Finance" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f3f8f3", fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Top nav */}
      <div style={{ background: "#1a2e1a", padding: "0 28px", display: "flex", alignItems: "center", height: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 36 }}>
          <span style={{ fontSize: 20 }}>🔧</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>PitStop</span>
          <span style={{ color: "#4a7a4a", fontSize: 13 }}>Workshop OS</span>
        </div>
        <nav style={{ display: "flex", gap: 2, flex: 1 }}>
          {nav.map((n) => (
            <button key={n.id} onClick={() => setSection(n.id)} style={{
              background: section === n.id ? "#2d4a2d" : "transparent",
              border: "none", color: section === n.id ? "#a3d9a3" : "#5a7a5a",
              padding: "0 16px", height: 52, fontSize: 13,
              fontWeight: section === n.id ? 700 : 400,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              fontFamily: "inherit",
            }}>
              <span style={{ fontSize: 14 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#4a7a4a", fontSize: 12 }}>6 Mar 2026</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#2d4a2d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#a3d9a3" }}>MT</div>
        </div>
      </div>

      {/* Sub header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #dde8dd", padding: "12px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#1a2e1a" }}>{nav.find((n) => n.id === section)?.label}</span>
        <span style={{ fontSize: 12, color: "#7a9b7a" }}>PitStop Automotive Services · Est. 2009</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
          {section === "home"     && <HomeSection />}
          {section === "calendar" && <CalendarSection />}
          {section === "shop"     && <ShopSection />}
          {section === "parts"    && <PartsSection />}
          {section === "finance"  && <FinanceSection />}
        </main>
        <RightPanel section={section} />
      </div>
    </div>
  );
}
