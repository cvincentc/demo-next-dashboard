"use client";
import { useState, useEffect, type ReactNode, type CSSProperties, type ReactElement, type MouseEventHandler } from "react";

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type TableStatus   = "occupied" | "available" | "reserved" | "maintenance";
type BookingStatus = "confirmed" | "in_progress" | "pending" | "completed" | "cancelled";
type PlayerTier    = "Gold" | "Silver" | "Bronze";
type PageId        = "dashboard" | "bookings" | "players";
type BtnVariant    = "primary" | "outline" | "ghost" | "danger";

interface TableRow {
  id: number;
  name: string;
  type: string;
  rate: number;
  status: TableStatus;
  player: string | null;
  startTime: number | null;
}
interface BookingRow {
  id: string;
  player: string;
  table: string;
  date: string;
  time: string;
  duration: number;
  status: BookingStatus;
  phone: string;
}
interface PlayerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: PlayerTier;
  visits: number;
  spent: number;
  joined: string;
  lastSeen: string;
}

/* ══════════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════════ */
const TABLES: TableRow[] = [
  { id:1, name:"Table 1", type:"Championship", rate:15, status:"occupied",    player:"James Robertson", startTime:Date.now()-55*60000 },
  { id:2, name:"Table 2", type:"Standard",     rate:12, status:"available",   player:null,              startTime:null },
  { id:3, name:"Table 3", type:"Standard",     rate:12, status:"reserved",    player:"Mike Thompson",   startTime:Date.now()+25*60000 },
  { id:4, name:"Table 4", type:"Championship", rate:15, status:"occupied",    player:"Sarah Khan",      startTime:Date.now()-22*60000 },
  { id:5, name:"Table 5", type:"Standard",     rate:12, status:"available",   player:null,              startTime:null },
  { id:6, name:"Table 6", type:"Standard",     rate:12, status:"maintenance", player:null,              startTime:null },
];
const BOOKINGS: BookingRow[] = [
  { id:"BK-001", player:"James Robertson", table:"Table 1", date:"2026-03-05", time:"10:00", duration:2, status:"confirmed",   phone:"+44 7700 900123" },
  { id:"BK-002", player:"Sarah Khan",      table:"Table 4", date:"2026-03-05", time:"11:30", duration:1, status:"in_progress", phone:"+44 7700 900456" },
  { id:"BK-003", player:"Mike Thompson",   table:"Table 3", date:"2026-03-05", time:"14:00", duration:2, status:"confirmed",   phone:"+44 7700 900789" },
  { id:"BK-004", player:"Lena Fischer",    table:"Table 2", date:"2026-03-05", time:"16:00", duration:3, status:"confirmed",   phone:"+44 7700 900321" },
  { id:"BK-005", player:"David Osei",      table:"Table 5", date:"2026-03-06", time:"09:00", duration:1, status:"pending",     phone:"+44 7700 900654" },
  { id:"BK-006", player:"Claire Dubois",   table:"Table 1", date:"2026-03-06", time:"13:00", duration:2, status:"confirmed",   phone:"+44 7700 900987" },
  { id:"BK-007", player:"Tom Bradley",     table:"Table 6", date:"2026-03-04", time:"18:00", duration:2, status:"completed",   phone:"+44 7700 900111" },
  { id:"BK-008", player:"James Robertson", table:"Table 2", date:"2026-03-04", time:"10:00", duration:1, status:"cancelled",   phone:"+44 7700 900123" },
];
const PLAYERS: PlayerRow[] = [
  { id:"PL-001", name:"James Robertson", email:"james.r@email.com",  phone:"+44 7700 900123", tier:"Gold",   visits:42, spent:890,  joined:"2024-01-15", lastSeen:"2026-03-05" },
  { id:"PL-002", name:"Sarah Khan",      email:"sarah.k@email.com",  phone:"+44 7700 900456", tier:"Silver", visits:28, spent:512,  joined:"2024-03-22", lastSeen:"2026-03-05" },
  { id:"PL-003", name:"Mike Thompson",   email:"mike.t@email.com",   phone:"+44 7700 900789", tier:"Gold",   visits:67, spent:1340, joined:"2023-11-08", lastSeen:"2026-03-04" },
  { id:"PL-004", name:"Lena Fischer",    email:"lena.f@email.com",   phone:"+44 7700 900321", tier:"Bronze", visits:9,  spent:145,  joined:"2025-08-01", lastSeen:"2026-02-28" },
  { id:"PL-005", name:"David Osei",      email:"david.o@email.com",  phone:"+44 7700 900654", tier:"Silver", visits:19, spent:378,  joined:"2025-01-10", lastSeen:"2026-03-03" },
  { id:"PL-006", name:"Claire Dubois",   email:"claire.d@email.com", phone:"+44 7700 900987", tier:"Bronze", visits:5,  spent:87,   joined:"2025-12-01", lastSeen:"2026-03-01" },
  { id:"PL-007", name:"Tom Bradley",     email:"tom.b@email.com",    phone:"+44 7700 900111", tier:"Gold",   visits:55, spent:1105, joined:"2023-06-14", lastSeen:"2026-03-04" },
];

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function useNow(): number {
  const [n, setN] = useState<number>(0);
  useEffect(() => {
    setN(Date.now());
    const t = setInterval(() => setN(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return n;
}
const pad = (n: number): string => String(n).padStart(2, "0");
function elapsedStr(ms: number): string {
  if (ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${pad(m)}m` : `${pad(m)}:${pad(s % 60)}`;
}
function runningCost(ms: number, rate: number): string {
  return `£${((ms / 3600000) * rate).toFixed(2)}`;
}
function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("");
}

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS  — Slate & Powder Blue
══════════════════════════════════════════════════════════════ */
const C = {
  bg:       "#eef2f7",
  surface:  "#ffffff",
  sidebar:  "#1e2d3d",
  sidebarHi:"#263d52",
  border:   "#dce4ee",
  borderMd: "#c4d0de",
  text:     "#1a2533",
  muted:    "#6b7e94",
  mutedLt:  "#a8bace",
  blue:     "#2e6da8",
  blueLt:   "rgba(46,109,168,0.10)",
  coral:    "#d95f43",
  coralLt:  "rgba(217,95,67,0.10)",
  teal:     "#1e8c7a",
  tealLt:   "rgba(30,140,122,0.10)",
  amber:    "#c07c28",
  amberLt:  "rgba(192,124,40,0.10)",
  red:      "#c0393a",
  purple:   "#6b4faa",
} as const;

const STATUS_CFG: Record<TableStatus, { label: string; color: string; bg: string }> = {
  available:   { label:"Available",   color:C.teal,  bg:C.tealLt  },
  occupied:    { label:"In Play",     color:C.blue,  bg:C.blueLt  },
  reserved:    { label:"Reserved",    color:C.amber, bg:C.amberLt },
  maintenance: { label:"Maintenance", color:C.muted, bg:"rgba(107,126,148,0.10)" },
};
const BSTATUS_CFG: Record<BookingStatus, { label: string; color: string }> = {
  confirmed:   { label:"Confirmed",   color:C.teal  },
  in_progress: { label:"In Progress", color:C.blue  },
  pending:     { label:"Pending",     color:C.amber },
  completed:   { label:"Completed",   color:C.muted },
  cancelled:   { label:"Cancelled",   color:C.red   },
};
const TIER_CFG: Record<PlayerTier, { color: string; bg: string }> = {
  Gold:   { color:C.amber,  bg:C.amberLt },
  Silver: { color:C.muted,  bg:"rgba(107,126,148,0.10)" },
  Bronze: { color:C.coral,  bg:C.coralLt },
};

/* ══════════════════════════════════════════════════════════════
   SHARED UI
══════════════════════════════════════════════════════════════ */
interface PillProps { label: string; color: string; bg?: string; }
function Pill({ label, color, bg }: PillProps): ReactElement {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:6,
      background: bg ?? `${color}18`,
      border:`1px solid ${color}40`,
      fontSize:10, color,
      fontFamily:"'IBM Plex Mono',monospace",
      fontWeight:500, letterSpacing:"0.04em", whiteSpace:"nowrap",
    }}>
      {label}
    </span>
  );
}

interface SurfaceProps { children: ReactNode; style?: CSSProperties; onClick?: MouseEventHandler<HTMLDivElement>; }
function Surface({ children, style = {}, onClick }: SurfaceProps): ReactElement {
  return (
    <div style={{
      background:C.surface,
      border:`1px solid ${C.border}`,
      borderRadius:12,
      boxShadow:"0 1px 3px rgba(30,45,61,0.06)",
      ...style,
    }} onClick={onClick}>
      {children}
    </div>
  );
}

interface BtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  style?: CSSProperties;
}
function Btn({ children, variant = "primary", onClick, style = {} }: BtnProps): ReactElement {
  const variants: Record<BtnVariant, CSSProperties> = {
    primary: { background:C.blue,        color:"#fff",    border:`1px solid ${C.blue}` },
    outline: { background:"transparent", color:C.blue,    border:`1px solid ${C.blue}` },
    ghost:   { background:"transparent", color:C.muted,   border:`1px solid ${C.border}` },
    danger:  { background:"transparent", color:C.red,     border:`1px solid ${C.red}55` },
  };
  return (
    <button
      onClick={onClick}
      style={{
        padding:"7px 16px", borderRadius:8, cursor:"pointer",
        fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, fontWeight:600,
        letterSpacing:"0.01em", transition:"opacity 0.15s",
        ...variants[variant], ...style,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.78"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   TABLE ROW WIDGET  (horizontal strip style)
══════════════════════════════════════════════════════════════ */
interface TableStripProps { t: TableRow; now: number; }
function TableStrip({ t, now }: TableStripProps): ReactElement {
  const cfg = STATUS_CFG[t.status];
  const ms: number | null = t.status === "occupied" && t.startTime !== null && now !== 0
    ? now - t.startTime : null;

  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"140px 1fr 120px 120px 100px",
      alignItems:"center", gap:16,
      padding:"14px 20px",
      borderLeft:`3px solid ${cfg.color}`,
      background:C.surface,
      borderBottom:`1px solid ${C.border}`,
      transition:"background 0.15s",
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.bg; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.surface; }}
    >
      {/* Table name */}
      <div>
        <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, fontWeight:600, color:C.text }}>{t.name}</div>
        <div style={{ fontSize:10, color:C.muted, marginTop:1, fontFamily:"'IBM Plex Mono',monospace" }}>{t.type}</div>
      </div>

      {/* Player / status */}
      <div>
        {t.player !== null
          ? <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, color:C.text }}>{t.player}</div>
          : <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, color:C.mutedLt, fontStyle:"italic" }}>Unoccupied</div>
        }
      </div>

      {/* Elapsed */}
      <div>
        {ms !== null
          ? <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:500, color:C.blue }}>{elapsedStr(ms)}</div>
          : <div style={{ color:C.mutedLt, fontSize:13 }}>—</div>
        }
      </div>

      {/* Running cost */}
      <div>
        {ms !== null
          ? <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:500, color:C.text }}>{runningCost(ms, t.rate)}</div>
          : <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:C.mutedLt }}>£{t.rate}/hr</div>
        }
      </div>

      <Pill label={cfg.label} color={cfg.color} bg={cfg.bg} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE 1 — DASHBOARD
   Layout: left main content + right always-on summary panel
══════════════════════════════════════════════════════════════ */
interface DashboardPageProps { now: number; }
function DashboardPage({ now }: DashboardPageProps): ReactElement {
  const occupied = TABLES.filter((t) => t.status === "occupied");
  const revenue  = occupied.reduce((s, t) => s + ((now - (t.startTime ?? 0)) / 3600000) * t.rate, 0);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>
      {/* Main left column */}
      <div>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
          {[
            { label:"Tables Active", value:occupied.length,    color:C.blue,  sub:`of ${TABLES.length}` },
            { label:"Live Revenue",  value:`£${revenue.toFixed(0)}`, color:C.teal,  sub:"running now" },
            { label:"Today Booked",  value:BOOKINGS.filter((b) => b.date==="2026-03-05"&&b.status!=="cancelled").length,
              color:C.amber, sub:"appointments" },
          ].map(({ label, value, color, sub }) => (
            <Surface key={label} style={{ padding:"16px 20px" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:26, fontWeight:500, color, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:4, fontFamily:"'IBM Plex Mono',monospace",
                textTransform:"uppercase", letterSpacing:"0.08em" }}>{sub}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:6, fontFamily:"'IBM Plex Sans',sans-serif" }}>{label}</div>
            </Surface>
          ))}
        </div>

        {/* Table strips */}
        <div style={{ fontSize:11, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
          textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>
          // All Tables
        </div>
        <Surface style={{ overflow:"hidden", padding:0 }}>
          {/* Header row */}
          <div style={{ display:"grid", gridTemplateColumns:"140px 1fr 120px 120px 100px",
            gap:16, padding:"10px 20px", background:C.bg, borderBottom:`1px solid ${C.border}` }}>
            {["Table","Player","Elapsed","Running","Status"].map((h) => (
              <div key={h} style={{ fontSize:10, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                textTransform:"uppercase", letterSpacing:"0.1em" }}>{h}</div>
            ))}
          </div>
          {TABLES.map((t) => <TableStrip key={t.id} t={t} now={now} />)}
        </Surface>
      </div>

      {/* Right summary panel */}
      <div style={{ position:"sticky", top:20, display:"flex", flexDirection:"column", gap:16 }}>
        {/* Status breakdown */}
        <Surface style={{ padding:"20px" }}>
          <div style={{ fontSize:11, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
            textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>// Status</div>
          {(Object.entries(STATUS_CFG) as [TableStatus, { label: string; color: string; bg: string }][]).map(([key, cfg]) => {
            const count = TABLES.filter((t) => t.status === key).length;
            const pct = Math.round((count / TABLES.length) * 100);
            return (
              <div key={key} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, color:C.text, fontFamily:"'IBM Plex Sans',sans-serif" }}>{cfg.label}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:cfg.color, fontWeight:500 }}>{count}</span>
                </div>
                <div style={{ height:5, background:C.bg, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:cfg.color,
                    borderRadius:3, transition:"width 0.4s ease" }} />
                </div>
              </div>
            );
          })}
        </Surface>

        {/* Today's next appointments */}
        <Surface style={{ padding:"20px" }}>
          <div style={{ fontSize:11, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
            textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>// Upcoming</div>
          {BOOKINGS.filter((b) => b.date === "2026-03-05" && (b.status === "confirmed" || b.status === "pending"))
            .slice(0, 4).map((b) => {
              const bs = BSTATUS_CFG[b.status];
              return (
                <div key={b.id} style={{ display:"flex", alignItems:"center", gap:12,
                  padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ minWidth:38, height:38, borderRadius:8, background:C.blueLt,
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
                      fontWeight:600, color:C.blue, lineHeight:1 }}>{b.time.slice(0,5)}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12,
                      fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.player}</div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{b.table} · {b.duration}h</div>
                  </div>
                  <Pill label={bs.label} color={bs.color} />
                </div>
              );
          })}
        </Surface>

        {/* Revenue breakdown */}
        <Surface style={{ padding:"20px" }}>
          <div style={{ fontSize:11, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
            textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>// Revenue</div>
          {occupied.map((t) => {
            const ms = now - (t.startTime ?? now);
            return (
              <div key={t.id} style={{ display:"flex", justifyContent:"space-between",
                padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, color:C.text }}>{t.name}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{elapsedStr(ms)}</div>
                </div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13,
                  fontWeight:500, color:C.teal }}>{runningCost(ms, t.rate)}</div>
              </div>
            );
          })}
          <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, marginTop:4 }}>
            <span style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, fontWeight:600, color:C.text }}>Total</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14,
              fontWeight:600, color:C.blue }}>£{revenue.toFixed(2)}</span>
          </div>
        </Surface>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE 2 — BOOKINGS
   Layout: left list + sticky right detail panel
══════════════════════════════════════════════════════════════ */
function BookingsPage(): ReactElement {
  const [filter, setFilter]       = useState<BookingStatus | "all">("all");
  const [search, setSearch]       = useState<string>("");
  const [selected, setSelected]   = useState<BookingRow | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const visible: BookingRow[] = BOOKINGS.filter((b) => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch = b.player.toLowerCase().includes(search.toLowerCase())
      || b.table.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filterKeys: (BookingStatus | "all")[] = ["all","confirmed","in_progress","pending","completed","cancelled"];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>
      {/* Left: list */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:11, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
            textTransform:"uppercase", letterSpacing:"0.1em" }}>
            // Bookings — {visible.length} records
          </div>
          <Btn onClick={() => setShowModal(true)}>+ New Booking</Btn>
        </div>

        {/* Filter bar */}
        <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
          {filterKeys.map((f) => {
            const active = filter === f;
            const cfg = f !== "all" ? BSTATUS_CFG[f] : null;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"4px 12px", borderRadius:6, cursor:"pointer",
                fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:500,
                border:`1px solid ${active ? (cfg?.color ?? C.blue) : C.border}`,
                background: active ? (cfg ? `${cfg.color}15` : C.blueLt) : C.surface,
                color: active ? (cfg?.color ?? C.blue) : C.muted,
                transition:"all 0.12s", letterSpacing:"0.04em",
              }}>
                {f.replace("_", " ")}
              </button>
            );
          })}
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            style={{ marginLeft:"auto", padding:"4px 12px", borderRadius:6,
              border:`1px solid ${C.border}`, background:C.surface, fontFamily:"'IBM Plex Mono',monospace",
              fontSize:10, color:C.text, outline:"none", width:160 }}
          />
        </div>

        {/* Booking rows */}
        <Surface style={{ overflow:"hidden", padding:0 }}>
          <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 80px 60px 80px 90px",
            gap:12, padding:"9px 18px", background:C.bg, borderBottom:`1px solid ${C.border}` }}>
            {["ID","Player","Table","Time","Dur","Status"].map((h) => (
              <div key={h} style={{ fontSize:9, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                textTransform:"uppercase", letterSpacing:"0.1em" }}>{h}</div>
            ))}
          </div>
          {visible.map((b, i) => {
            const bs = BSTATUS_CFG[b.status];
            const isSel = selected?.id === b.id;
            return (
              <div key={b.id} onClick={() => setSelected(isSel ? null : b)} style={{
                display:"grid", gridTemplateColumns:"80px 1fr 80px 60px 80px 90px",
                gap:12, padding:"13px 18px", cursor:"pointer",
                borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : "none",
                borderLeft:`3px solid ${isSel ? bs.color : "transparent"}`,
                background: isSel ? `${bs.color}0a` : "transparent",
                transition:"all 0.12s",
              }}
              onMouseEnter={(e) => { if (!isSel) (e.currentTarget as HTMLDivElement).style.background = C.bg; }}
              onMouseLeave={(e) => { if (!isSel) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:C.blue }}>{b.id}</span>
                <div>
                  <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, fontWeight:600, color:C.text }}>{b.player}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{b.date}</div>
                </div>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:C.text }}>{b.table}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:C.text }}>{b.time}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:C.muted }}>{b.duration}h</span>
                <Pill label={bs.label} color={bs.color} />
              </div>
            );
          })}
          {visible.length === 0 && (
            <div style={{ padding:"32px", textAlign:"center", fontFamily:"'IBM Plex Mono',monospace",
              fontSize:12, color:C.muted }}>// no records found</div>
          )}
        </Surface>
      </div>

      {/* Right: sticky detail */}
      <div style={{ position:"sticky", top:20 }}>
        {selected ? (
          <Surface style={{ padding:"22px", animation:"slideIn 0.18s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
              <div>
                <div style={{ fontSize:10, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>// Booking Detail</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:600, color:C.blue }}>
                  {selected.id}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none",
                color:C.muted, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
            <Pill label={BSTATUS_CFG[selected.status].label} color={BSTATUS_CFG[selected.status].color} />
            <div style={{ marginTop:18, display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { l:"Player",   v:selected.player },
                { l:"Phone",    v:selected.phone },
                { l:"Table",    v:selected.table },
                { l:"Date",     v:selected.date },
                { l:"Time",     v:selected.time },
                { l:"Duration", v:`${selected.duration}h` },
              ].map(({ l, v }) => (
                <div key={l} style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:10 }}>
                  <div style={{ fontSize:9, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                    textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{l}</div>
                  <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, color:C.text }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:18 }}>
              <Btn variant="outline" style={{ flex:1 }}>Edit</Btn>
              {selected.status !== "cancelled" && selected.status !== "completed" && (
                <Btn variant="danger" style={{ flex:1 }}>Cancel</Btn>
              )}
            </div>
          </Surface>
        ) : (
          <Surface style={{ padding:"32px 20px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>📋</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:C.muted,
              letterSpacing:"0.06em" }}>Select a booking<br/>to view details</div>
          </Surface>
        )}
      </div>

      {/* New Booking Modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(30,45,61,0.45)",
          backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:200 }} onClick={() => setShowModal(false)}>
          <Surface style={{ padding:32, width:460, maxWidth:"90vw" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <h2 style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:18, fontWeight:600, color:C.text, margin:0 }}>
                New Booking
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none",
                color:C.muted, cursor:"pointer", fontSize:18 }}>✕</button>
            </div>
            {(["Player Name","Phone","Date","Time"] as const).map((lbl) => (
              <div key={lbl} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:10, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{lbl}</label>
                <input
                  type={lbl === "Date" ? "date" : lbl === "Time" ? "time" : "text"}
                  style={{ width:"100%", padding:"9px 13px", borderRadius:8, fontFamily:"'IBM Plex Sans',sans-serif",
                    border:`1px solid ${C.border}`, background:C.bg, fontSize:13, color:C.text,
                    outline:"none", boxSizing:"border-box", colorScheme:"light" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.blue; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = C.border; }}
                />
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:22 }}>
              {(["Table","Duration"] as const).map((lbl) => (
                <div key={lbl}>
                  <label style={{ display:"block", fontSize:10, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                    textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{lbl}</label>
                  <select style={{ width:"100%", padding:"9px 13px", borderRadius:8, fontFamily:"'IBM Plex Sans',sans-serif",
                    border:`1px solid ${C.border}`, background:C.bg, fontSize:13, color:C.text, outline:"none" }}>
                    {lbl === "Table"
                      ? TABLES.filter((t) => t.status === "available").map((t) => <option key={t.id}>{t.name}</option>)
                      : [1,2,3,4].map((h) => <option key={h}>{h} hour{h > 1 ? "s" : ""}</option>)
                    }
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn onClick={() => setShowModal(false)} style={{ flex:1 }}>Confirm</Btn>
              <Btn variant="ghost" onClick={() => setShowModal(false)} style={{ flex:1 }}>Cancel</Btn>
            </div>
          </Surface>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE 3 — PLAYERS
   Layout: compact table left + sticky profile card right
══════════════════════════════════════════════════════════════ */
function PlayersPage(): ReactElement {
  const [selected,   setSelected]   = useState<PlayerRow | null>(null);
  const [tierFilter, setTierFilter] = useState<PlayerTier | "all">("all");
  const [search,     setSearch]     = useState<string>("");

  const visible: PlayerRow[] = PLAYERS.filter((p) => {
    const matchTier   = tierFilter === "all" || p.tier === tierFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      || p.email.toLowerCase().includes(search.toLowerCase());
    return matchTier && matchSearch;
  });

  const tierKeys: (PlayerTier | "all")[] = ["all","Gold","Silver","Bronze"];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>
      {/* Left: table */}
      <div>
        {/* Tier mini-stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
          {(["Gold","Silver","Bronze"] as PlayerTier[]).map((tier) => {
            const cfg   = TIER_CFG[tier];
            const count = PLAYERS.filter((p) => p.tier === tier).length;
            const spent = PLAYERS.filter((p) => p.tier === tier).reduce((s, p) => s + p.spent, 0);
            return (
              <Surface key={tier} style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:600, color:cfg.color }}>{count}</div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                    letterSpacing:"0.06em", marginTop:2 }}>{tier}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:C.text }}>£{spent}</div>
                  <div style={{ fontSize:9, color:C.muted }}>total spent</div>
                </div>
              </Surface>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:6, marginBottom:12, alignItems:"center" }}>
          {tierKeys.map((t) => {
            const active = tierFilter === t;
            const cfg = t !== "all" ? TIER_CFG[t] : null;
            return (
              <button key={t} onClick={() => setTierFilter(t)} style={{
                padding:"4px 12px", borderRadius:6, cursor:"pointer",
                fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:500, letterSpacing:"0.04em",
                border:`1px solid ${active ? (cfg?.color ?? C.blue) : C.border}`,
                background: active ? (cfg ? `${cfg.color}15` : C.blueLt) : C.surface,
                color: active ? (cfg?.color ?? C.blue) : C.muted,
                transition:"all 0.12s",
              }}>{t === "all" ? "All" : t}</button>
            );
          })}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
            style={{ marginLeft:"auto", padding:"4px 12px", borderRadius:6, border:`1px solid ${C.border}`,
              background:C.surface, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:C.text, outline:"none", width:160 }}
          />
          <Btn style={{ padding:"5px 14px", fontSize:11 }}>+ Add</Btn>
        </div>

        {/* Players table */}
        <Surface style={{ overflow:"hidden", padding:0 }}>
          <div style={{ display:"grid", gridTemplateColumns:"32px 1fr 80px 60px 80px 100px",
            gap:12, padding:"9px 18px", background:C.bg, borderBottom:`1px solid ${C.border}` }}>
            {["","Player","Tier","Visits","Spent","Last Seen"].map((h) => (
              <div key={h} style={{ fontSize:9, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                textTransform:"uppercase", letterSpacing:"0.1em" }}>{h}</div>
            ))}
          </div>
          {visible.map((p, i) => {
            const cfg   = TIER_CFG[p.tier];
            const isSel = selected?.id === p.id;
            return (
              <div key={p.id} onClick={() => setSelected(isSel ? null : p)} style={{
                display:"grid", gridTemplateColumns:"32px 1fr 80px 60px 80px 100px",
                gap:12, padding:"12px 18px", cursor:"pointer",
                borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : "none",
                borderLeft:`3px solid ${isSel ? cfg.color : "transparent"}`,
                background: isSel ? `${cfg.color}0a` : "transparent",
                transition:"all 0.12s", alignItems:"center",
              }}
              onMouseEnter={(e) => { if (!isSel) (e.currentTarget as HTMLDivElement).style.background = C.bg; }}
              onMouseLeave={(e) => { if (!isSel) (e.currentTarget as HTMLDivElement).style.background = isSel ? `${cfg.color}0a` : "transparent"; }}
              >
                {/* Avatar */}
                <div style={{
                  width:28, height:28, borderRadius:"50%", background:cfg.bg,
                  border:`1px solid ${cfg.color}55`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:700, color:cfg.color,
                  fontFamily:"'IBM Plex Sans',sans-serif",
                }}>{initials(p.name)}</div>

                <div>
                  <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, fontWeight:600, color:C.text }}>{p.name}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{p.email}</div>
                </div>
                <Pill label={p.tier} color={cfg.color} bg={cfg.bg} />
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:C.text }}>{p.visits}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:C.teal }}>£{p.spent}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:C.muted }}>{p.lastSeen.slice(5)}</span>
              </div>
            );
          })}
        </Surface>
      </div>

      {/* Right: sticky profile */}
      <div style={{ position:"sticky", top:20 }}>
        {selected ? (
          <Surface style={{ padding:"22px", animation:"slideIn 0.18s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontSize:10, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                textTransform:"uppercase", letterSpacing:"0.1em" }}>// Player Profile</div>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none",
                color:C.muted, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>

            {/* Avatar + name */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{
                width:52, height:52, borderRadius:"50%",
                background:TIER_CFG[selected.tier].bg,
                border:`2px solid ${TIER_CFG[selected.tier].color}55`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'IBM Plex Sans',sans-serif", fontSize:18, fontWeight:700,
                color:TIER_CFG[selected.tier].color,
              }}>{initials(selected.name)}</div>
              <div>
                <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:14, fontWeight:700, color:C.text }}>
                  {selected.name}
                </div>
                <div style={{ marginTop:4 }}>
                  <Pill label={selected.tier} color={TIER_CFG[selected.tier].color} bg={TIER_CFG[selected.tier].bg} />
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {[
                { l:"Visits",   v:String(selected.visits) },
                { l:"Spent",    v:`£${selected.spent}`    },
                { l:"Joined",   v:selected.joined         },
                { l:"Last Seen",v:selected.lastSeen        },
              ].map(({ l, v }) => (
                <div key={l} style={{ background:C.bg, borderRadius:8, padding:"10px 12px",
                  border:`1px solid ${C.border}` }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:500, color:C.text }}>{v}</div>
                  <div style={{ fontSize:9, color:C.muted, marginTop:3, textTransform:"uppercase",
                    letterSpacing:"0.08em", fontFamily:"'IBM Plex Mono',monospace" }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14, marginBottom:16 }}>
              <div style={{ fontSize:9, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Contact</div>
              <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, color:C.text, marginBottom:4 }}>{selected.email}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:C.text }}>{selected.phone}</div>
            </div>

            {/* Booking history */}
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
              <div style={{ fontSize:9, color:C.muted, fontFamily:"'IBM Plex Mono',monospace",
                textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Bookings</div>
              {BOOKINGS.filter((b) => b.player === selected.name).map((b) => {
                const bs = BSTATUS_CFG[b.status];
                return (
                  <div key={b.id} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:C.text }}>{b.date} {b.time}</div>
                      <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{b.table} · {b.duration}h</div>
                    </div>
                    <Pill label={bs.label} color={bs.color} />
                  </div>
                );
              })}
            </div>
          </Surface>
        ) : (
          <Surface style={{ padding:"32px 20px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>👤</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:C.muted,
              letterSpacing:"0.06em" }}>Select a player<br/>to view profile</div>
          </Surface>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT — LEFT SIDEBAR + CONTENT LAYOUT
══════════════════════════════════════════════════════════════ */
interface NavItem { id: PageId; label: string; icon: string; }
const NAV_ITEMS: NavItem[] = [
  { id:"dashboard", label:"Dashboard", icon:"◈" },
  { id:"bookings",  label:"Bookings",  icon:"◉" },
  { id:"players",   label:"Players",   icon:"◎" },
];

export default function SnookerAdminSlate(): ReactElement {
  const [page, setPage] = useState<PageId>("dashboard");
  const now = useNow();

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; }
        input::placeholder { color:${C.mutedLt}; }
        select option { background:${C.surface}; }
        @keyframes slideIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:${C.bg}} ::-webkit-scrollbar-thumb{background:${C.borderMd};border-radius:4px}
      `}</style>

      {/* Dark left sidebar */}
      <aside style={{
        width:220, flexShrink:0,
        background:C.sidebar,
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, bottom:0, left:0, zIndex:50,
      }}>
        {/* Logo */}
        <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:"rgba(46,109,168,0.6)",
              border:"1px solid rgba(46,109,168,0.4)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            }}>🎱</div>
            <div>
              <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:14, fontWeight:700,
                color:"#ffffff", letterSpacing:"0.01em" }}>The Cue Room</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontFamily:"'IBM Plex Mono',monospace",
                letterSpacing:"0.06em", marginTop:1 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Live indicator strip */}
        <div style={{ padding:"10px 20px", borderBottom:`1px solid rgba(255,255,255,0.06)`,
          display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:C.teal,
            boxShadow:`0 0 6px ${C.teal}`, animation:"pulse 2s infinite" }} />
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
            color:"rgba(255,255,255,0.45)", letterSpacing:"0.06em" }}>
            {TABLES.filter((t) => t.status === "occupied").length} active sessions
          </span>
        </div>

        {/* Nav */}
        <nav style={{ padding:"16px 12px", flex:1 }}>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", fontFamily:"'IBM Plex Mono',monospace",
            letterSpacing:"0.14em", textTransform:"uppercase", paddingLeft:8, marginBottom:10 }}>Navigate</div>
          {NAV_ITEMS.map((n) => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"10px 12px", borderRadius:8, cursor:"pointer", textAlign:"left",
                background: active ? "rgba(46,109,168,0.25)" : "transparent",
                border: active ? "1px solid rgba(46,109,168,0.35)" : "1px solid transparent",
                color: active ? "#ffffff" : "rgba(255,255,255,0.45)",
                fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, fontWeight: active ? 600 : 400,
                transition:"all 0.12s", marginBottom:4,
              }}>
                <span style={{ fontSize:14 }}>{n.icon}</span>
                {n.label}
                {active && (
                  <div style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:C.blue }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: current time */}
        <div style={{ padding:"16px 20px", borderTop:`1px solid rgba(255,255,255,0.06)` }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, color:"#ffffff",
            fontWeight:500, letterSpacing:"0.04em" }}>
            {new Date(now).toLocaleTimeString("en-GB")}
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,0.35)",
            marginTop:2, letterSpacing:"0.04em" }}>Thu 5 Mar 2026</div>
          <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%",
              background:"rgba(46,109,168,0.4)", border:"1px solid rgba(46,109,168,0.4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, color:"#fff", fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700 }}>A</div>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontFamily:"'IBM Plex Sans',sans-serif" }}>Admin</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", fontFamily:"'IBM Plex Mono',monospace" }}>admin@cueroom.co</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:220, flex:1, padding:"28px 32px", minHeight:"100vh" }}>
        {page === "dashboard" && <DashboardPage now={now} />}
        {page === "bookings"  && <BookingsPage />}
        {page === "players"   && <PlayersPage />}
      </main>
    </div>
  );
}
