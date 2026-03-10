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
   TOKENS
══════════════════════════════════════════════════════════════ */
const C = {
  bg:       "#f2ece0",
  canvas:   "#ede7da",
  surface:  "#faf7f2",
  sidebar:  "#e4ddd2",
  border:   "#d6cec0",
  borderMd: "#c2b8a8",
  text:     "#2a2018",
  muted:    "#7a6e5c",
  mutedLt:  "#b0a898",
  terra:    "#be5c38",
  terraLt:  "rgba(190,92,56,0.12)",
  sage:     "#4e7252",
  sageLt:   "rgba(78,114,82,0.10)",
  amber:    "#a87030",
  amberLt:  "rgba(168,112,48,0.10)",
  red:      "#a83838",
  sky:      "#3a6e8e",
} as const;

type ColorKey = keyof typeof C;

const STATUS_CFG: Record<TableStatus, { label: string; color: string; bg: string }> = {
  available:   { label:"Available",   color:C.sage,  bg:C.sageLt  },
  occupied:    { label:"In Play",     color:C.terra, bg:C.terraLt },
  reserved:    { label:"Reserved",    color:C.amber, bg:C.amberLt },
  maintenance: { label:"Maintenance", color:C.muted, bg:"rgba(122,110,92,0.10)" },
};
const BSTATUS_CFG: Record<BookingStatus, { label: string; color: string }> = {
  confirmed:   { label:"Confirmed",   color:C.sage  },
  in_progress: { label:"In Progress", color:C.terra },
  pending:     { label:"Pending",     color:C.amber },
  completed:   { label:"Completed",   color:C.muted },
  cancelled:   { label:"Cancelled",   color:C.red   },
};
const TIER_CFG: Record<PlayerTier, { color: string; bg: string }> = {
  Gold:   { color:"#9a6e28", bg:"rgba(154,110,40,0.10)"  },
  Silver: { color:"#607080", bg:"rgba(96,112,128,0.10)" },
  Bronze: { color:C.terra,   bg:C.terraLt },
};

/* ══════════════════════════════════════════════════════════════
   SHARED UI
══════════════════════════════════════════════════════════════ */
interface PillProps { label: string; color: string; bg?: string; }
function Pill({ label, color, bg }: PillProps): ReactElement {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:20,
      background: bg ?? `${color}18`,
      border:`1px solid ${color}44`,
      fontSize:10, color,
      fontFamily:"'Nunito',sans-serif",
      fontWeight:700, letterSpacing:"0.03em", whiteSpace:"nowrap",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:color, flexShrink:0 }} />
      {label}
    </span>
  );
}

interface CardProps { children: ReactNode; style?: CSSProperties; onClick?: MouseEventHandler<HTMLDivElement>; }
function Card({ children, style = {}, onClick }: CardProps): ReactElement {
  return (
    <div style={{
      background:C.surface,
      border:`1px solid ${C.border}`,
      borderRadius:16,
      boxShadow:"0 1px 4px rgba(42,32,24,0.06)",
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
    primary: { background:C.terra,        color:"#faf7f2", border:`1px solid ${C.terra}` },
    outline: { background:"transparent",  color:C.terra,   border:`1px solid ${C.terra}` },
    ghost:   { background:"transparent",  color:C.muted,   border:`1px solid ${C.border}` },
    danger:  { background:"transparent",  color:C.red,     border:`1px solid ${C.red}55` },
  };
  return (
    <button
      onClick={onClick}
      style={{
        padding:"8px 18px", borderRadius:10, cursor:"pointer",
        fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700,
        letterSpacing:"0.02em", transition:"opacity 0.15s",
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
   TABLE CARD  (felt-style visual + stats)
══════════════════════════════════════════════════════════════ */
interface TableCardProps { t: TableRow; now: number; }
function TableCard({ t, now }: TableCardProps): ReactElement {
  const cfg = STATUS_CFG[t.status];
  const ms: number | null = t.status === "occupied" && t.startTime !== null && now !== 0 ? now - t.startTime : null;

  return (
    <Card style={{ padding:0, overflow:"hidden" }}>
      {/* coloured top bar */}
      <div style={{ height:5, background:cfg.color, borderRadius:"16px 16px 0 0", opacity:0.7 }} />
      <div style={{ padding:"16px" }}>
        {/* felt diagram */}
        <div style={{
          height:58, borderRadius:10, background:cfg.bg,
          border:`1px solid ${cfg.color}30`,
          marginBottom:14, position:"relative", overflow:"hidden",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <div style={{ position:"absolute", inset:5, borderRadius:7, border:`1px dashed ${cfg.color}40` }} />
          {([{ top:4,left:4 },{ top:4,right:4 },{ bottom:4,left:4 },{ bottom:4,right:4 },
             { top:4, left:"calc(50% - 4px)" }, { bottom:4, left:"calc(50% - 4px)" }] as CSSProperties[])
            .map((pos, i) => (
              <div key={i} style={{
                position:"absolute", width:8, height:8, borderRadius:"50%",
                background:C.surface, border:`1px solid ${cfg.color}50`, ...pos,
              }} />
            ))}
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, fontWeight:700,
            color:cfg.color, letterSpacing:"0.06em", opacity:0.8 }}>{t.type.toUpperCase()}</span>
          {t.status === "occupied" && (
            <span style={{
              position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
              width:9, height:9, borderRadius:"50%", background:C.terra,
              boxShadow:`0 0 0 3px ${C.terraLt}`, animation:"pulseRing 2s infinite",
            }} />
          )}
        </div>

        {/* name + status */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontFamily:"'Lora',serif", fontSize:15, fontWeight:600, color:C.text }}>{t.name}</span>
          <Pill label={cfg.label} color={cfg.color} />
        </div>

        {t.player !== null && (
          <div style={{ fontSize:12, color:C.muted, fontFamily:"'Nunito',sans-serif", marginBottom:8 }}>
            👤 {t.player}
          </div>
        )}

        {ms !== null && (
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8,
          }}>
            <div style={{ background:C.terraLt, borderRadius:10, padding:"8px 10px" }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:600, color:C.terra }}>{elapsedStr(ms)}</div>
              <div style={{ fontSize:9, color:C.muted, marginTop:1, textTransform:"uppercase", letterSpacing:"0.07em" }}>Elapsed</div>
            </div>
            <div style={{ background:C.canvas, borderRadius:10, padding:"8px 10px" }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:16, fontWeight:600, color:C.text }}>{runningCost(ms, t.rate)}</div>
              <div style={{ fontSize:9, color:C.muted, marginTop:1, textTransform:"uppercase", letterSpacing:"0.07em" }}>Running</div>
            </div>
          </div>
        )}
        {t.status === "available" && (
          <div style={{ marginTop:8, fontSize:11, color:C.muted, fontFamily:"'Nunito',sans-serif" }}>
            £{t.rate}/hr · Ready
          </div>
        )}
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE 1 — DASHBOARD
   Layout: full-width top header, wide stats strip, 3-col table grid,
           then schedule timeline below
══════════════════════════════════════════════════════════════ */
interface DashboardPageProps { now: number; }
function DashboardPage({ now }: DashboardPageProps): ReactElement {
  const occupied = TABLES.filter((t) => t.status === "occupied");
  const revenue  = now === 0 ? 0 : occupied.reduce((s, t) => s + ((now - (t.startTime ?? 0)) / 3600000) * t.rate, 0);
  const todayBookings = BOOKINGS.filter((b) => b.date === "2026-03-05" && b.status !== "cancelled");

  return (
    <div>
      {/* Wide greeting banner */}
      <div style={{
        background:`linear-gradient(135deg, ${C.sage} 0%, #3a5c3e 100%)`,
        borderRadius:20, padding:"28px 32px", marginBottom:24,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        boxShadow:"0 4px 20px rgba(78,114,82,0.25)",
      }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.65)",
            letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Thursday 5 March 2026</div>
          <h1 style={{ fontFamily:"'Lora',serif", fontSize:28, color:"#fff", margin:"0 0 4px", fontWeight:600 }}>
            Good morning 👋
          </h1>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"rgba(255,255,255,0.7)", margin:0 }}>
            {occupied.length} of {TABLES.length} tables are active right now
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"'Lora',serif", fontSize:36, color:"#fff", fontWeight:600 }}>
            £{revenue.toFixed(0)}
          </div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.65)",
            textTransform:"uppercase", letterSpacing:"0.08em" }}>Live revenue</div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
        {(Object.entries(STATUS_CFG) as [TableStatus, { label: string; color: string; bg: string }][]).map(([key, cfg]) => {
          const count = TABLES.filter((t) => t.status === key).length;
          return (
            <Card key={key} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{
                width:42, height:42, borderRadius:12, background:cfg.bg,
                border:`1px solid ${cfg.color}30`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20,
              }}>
                {{ available:"🟢", occupied:"🎱", reserved:"🕐", maintenance:"🔧" }[key]}
              </div>
              <div>
                <div style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:600, color:cfg.color }}>{count}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:C.muted, marginTop:1 }}>{cfg.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table grid */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:600, color:C.text, margin:0 }}>Table Status</h2>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:32 }}>
        {TABLES.map((t) => <TableCard key={t.id} t={t} now={now} />)}
      </div>

      {/* Schedule timeline */}
      <h2 style={{ fontFamily:"'Lora',serif", fontSize:18, fontWeight:600, color:C.text, margin:"0 0 16px" }}>
        Today's Schedule
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
        {todayBookings.map((b) => {
          const bs = BSTATUS_CFG[b.status];
          return (
            <Card key={b.id} style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{
                minWidth:52, height:52, borderRadius:12, background:C.canvas,
                border:`1px solid ${C.border}`, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
              }}>
                <span style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:600, color:C.terra }}>{b.time}</span>
                <span style={{ fontSize:9, color:C.muted, fontFamily:"'Nunito',sans-serif" }}>{b.duration}h</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:C.text }}>{b.player}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{b.table}</div>
              </div>
              <Pill label={bs.label} color={bs.color} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE 2 — BOOKINGS
   Layout: horizontal filter chips above a clean card list (no table)
══════════════════════════════════════════════════════════════ */
function BookingsPage(): ReactElement {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [search, setSearch] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  const visible: BookingRow[] = BOOKINGS.filter((b) => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch = b.player.toLowerCase().includes(search.toLowerCase())
      || b.table.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filterKeys: (BookingStatus | "all")[] = ["all","confirmed","in_progress","pending","completed","cancelled"];

  return (
    <div>
      {/* Page header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:600, color:C.text, margin:"0 0 4px" }}>Bookings</h1>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:C.muted, margin:0 }}>
            {BOOKINGS.length} total · {BOOKINGS.filter((b) => b.status === "confirmed").length} confirmed
          </p>
        </div>
        <Btn onClick={() => setShowModal(true)}>+ New Booking</Btn>
      </div>

      {/* Filter chips + search */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        {filterKeys.map((f) => {
          const active = filter === f;
          const cfg = f !== "all" ? BSTATUS_CFG[f] : null;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:"6px 16px", borderRadius:20, cursor:"pointer",
              fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700,
              border:`1.5px solid ${active ? (cfg?.color ?? C.terra) : C.border}`,
              background: active ? (cfg ? `${cfg.color}18` : C.terraLt) : C.surface,
              color: active ? (cfg?.color ?? C.terra) : C.muted,
              transition:"all 0.15s",
            }}>
              {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {" "}({f === "all" ? BOOKINGS.length : BOOKINGS.filter((b) => b.status === f).length})
            </button>
          );
        })}
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player or table…"
          style={{
            marginLeft:"auto", padding:"8px 16px", borderRadius:20, fontFamily:"'Nunito',sans-serif",
            fontSize:12, background:C.surface, border:`1.5px solid ${C.border}`,
            color:C.text, outline:"none", width:220,
          }}
        />
      </div>

      {/* Booking cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {visible.map((b) => {
          const bs = BSTATUS_CFG[b.status];
          return (
            <Card key={b.id} style={{ padding:"16px 20px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px 100px 100px 120px auto", alignItems:"center", gap:16 }}>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700,
                  color:C.terra, background:C.terraLt, borderRadius:8, padding:"4px 8px", textAlign:"center" }}>
                  {b.id}
                </span>
                <div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, color:C.text }}>{b.player}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{b.phone}</div>
                </div>
                <div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:600, color:C.text }}>{b.table}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{b.date}</div>
                </div>
                <div style={{ fontFamily:"'Lora',serif", fontSize:14, color:C.text }}>{b.time}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:C.muted }}>{b.duration}h</div>
                <Pill label={bs.label} color={bs.color} />
                <div style={{ display:"flex", gap:6 }}>
                  <Btn variant="ghost" style={{ padding:"5px 12px", fontSize:11 }}>Edit</Btn>
                  {b.status !== "cancelled" && b.status !== "completed" && (
                    <Btn variant="danger" style={{ padding:"5px 12px", fontSize:11 }}>Cancel</Btn>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 0", color:C.muted,
            fontFamily:"'Nunito',sans-serif", fontSize:13 }}>
            No bookings match your search.
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(42,32,24,0.4)",
          backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:200 }} onClick={() => setShowModal(false)}>
          <Card style={{ padding:32, width:460, maxWidth:"90vw" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
              <h2 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:600, color:C.text, margin:0 }}>New Booking</h2>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none",
                color:C.muted, cursor:"pointer", fontSize:18 }}>✕</button>
            </div>
            {(["Player Name","Phone Number"] as const).map((lbl) => (
              <div key={lbl} style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11, color:C.muted, fontFamily:"'Nunito',sans-serif",
                  fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{lbl}</label>
                <input style={{ width:"100%", padding:"10px 14px", borderRadius:10,
                  border:`1.5px solid ${C.border}`, background:C.bg, fontFamily:"'Nunito',sans-serif",
                  fontSize:13, color:C.text, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
              {(["Date","Time"] as const).map((lbl) => (
                <div key={lbl}>
                  <label style={{ display:"block", fontSize:11, color:C.muted, fontFamily:"'Nunito',sans-serif",
                    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{lbl}</label>
                  <input type={lbl.toLowerCase()} style={{ width:"100%", padding:"10px 14px", borderRadius:10,
                    border:`1.5px solid ${C.border}`, background:C.bg, fontFamily:"'Nunito',sans-serif",
                    fontSize:13, color:C.text, outline:"none", boxSizing:"border-box", colorScheme:"light" }} />
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
              <div>
                <label style={{ display:"block", fontSize:11, color:C.muted, fontFamily:"'Nunito',sans-serif",
                  fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Table</label>
                <select style={{ width:"100%", padding:"10px 14px", borderRadius:10,
                  border:`1.5px solid ${C.border}`, background:C.bg, fontFamily:"'Nunito',sans-serif",
                  fontSize:13, color:C.text, outline:"none" }}>
                  {TABLES.filter((t) => t.status === "available").map((t) => (
                    <option key={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, color:C.muted, fontFamily:"'Nunito',sans-serif",
                  fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Duration</label>
                <select style={{ width:"100%", padding:"10px 14px", borderRadius:10,
                  border:`1.5px solid ${C.border}`, background:C.bg, fontFamily:"'Nunito',sans-serif",
                  fontSize:13, color:C.text, outline:"none" }}>
                  {[1,2,3,4].map((h) => <option key={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn onClick={() => setShowModal(false)} style={{ flex:1 }}>Confirm Booking</Btn>
              <Btn variant="ghost" onClick={() => setShowModal(false)} style={{ flex:1 }}>Cancel</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE 3 — PLAYERS
   Layout: masonry-style player cards grid, click expands inline
══════════════════════════════════════════════════════════════ */
function PlayersPage(): ReactElement {
  const [selected, setSelected] = useState<PlayerRow | null>(null);
  const [tierFilter, setTierFilter] = useState<PlayerTier | "all">("all");
  const [search, setSearch] = useState<string>("");

  const visible: PlayerRow[] = PLAYERS.filter((p) => {
    const matchTier = tierFilter === "all" || p.tier === tierFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      || p.email.toLowerCase().includes(search.toLowerCase());
    return matchTier && matchSearch;
  });

  const tierKeys: (PlayerTier | "all")[] = ["all","Gold","Silver","Bronze"];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:600, color:C.text, margin:"0 0 4px" }}>Players</h1>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:C.muted, margin:0 }}>
            {PLAYERS.length} registered players
          </p>
        </div>
        <Btn>+ Add Player</Btn>
      </div>

      {/* Tier stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        {(["Gold","Silver","Bronze"] as PlayerTier[]).map((tier) => {
          const cfg = TIER_CFG[tier];
          const count = PLAYERS.filter((p) => p.tier === tier).length;
          const totalSpent = PLAYERS.filter((p) => p.tier === tier).reduce((s, p) => s + p.spent, 0);
          return (
            <Card key={tier} style={{ padding:"18px 22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:600, color:cfg.color }}>{count}</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700, color:C.muted, marginTop:2 }}>
                    {tier} Members
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Lora',serif", fontSize:16, color:C.text }}>£{totalSpent}</div>
                  <div style={{ fontSize:10, color:C.muted }}>total spent</div>
                </div>
              </div>
              <div style={{ marginTop:12, height:4, borderRadius:4, background:C.canvas, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(count / PLAYERS.length) * 100}%`,
                  background:cfg.color, borderRadius:4 }} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:20, alignItems:"center" }}>
        {tierKeys.map((t) => (
          <button key={t} onClick={() => setTierFilter(t)} style={{
            padding:"6px 16px", borderRadius:20, cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700,
            border:`1.5px solid ${tierFilter === t ? (t !== "all" ? TIER_CFG[t]?.color : C.terra) : C.border}`,
            background: tierFilter === t ? (t !== "all" ? `${TIER_CFG[t]?.color}18` : C.terraLt) : C.surface,
            color: tierFilter === t ? (t !== "all" ? TIER_CFG[t]?.color : C.terra) : C.muted,
            transition:"all 0.15s",
          }}>{t === "all" ? "All Players" : t}</button>
        ))}
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players…"
          style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:20,
            border:`1.5px solid ${C.border}`, background:C.surface, fontFamily:"'Nunito',sans-serif",
            fontSize:12, color:C.text, outline:"none", width:200 }}
        />
      </div>

      {/* Player card grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
        {visible.map((p) => {
          const cfg = TIER_CFG[p.tier];
          const isSel = selected?.id === p.id;
          return (
            <Card key={p.id} style={{
              padding:"20px", cursor:"pointer",
              border:`1.5px solid ${isSel ? cfg.color : C.border}`,
              background: isSel ? cfg.bg : C.surface,
              transition:"all 0.2s",
            }}
            onClick={() => setSelected(isSel ? null : p)}
            >
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%", flexShrink:0,
                  background:cfg.bg, border:`2px solid ${cfg.color}55`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'Lora',serif", fontSize:15, fontWeight:600, color:cfg.color,
                }}>{initials(p.name)}</div>
                <div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, color:C.text }}>{p.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{p.email}</div>
                </div>
                <div style={{ marginLeft:"auto" }}><Pill label={p.tier} color={cfg.color} bg={cfg.bg} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[{ l:"Visits", v:String(p.visits) },{ l:"Spent", v:`£${p.spent}` },{ l:"Last seen", v:p.lastSeen.slice(5) }].map(({ l, v }) => (
                  <div key={l} style={{ background:C.canvas, borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontFamily:"'Lora',serif", fontSize:13, fontWeight:600, color:C.text }}>{v}</div>
                    <div style={{ fontSize:9, color:C.muted, marginTop:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Expanded booking history */}
              {isSel && (
                <div style={{ marginTop:14, borderTop:`1px solid ${C.border}`, paddingTop:12,
                  animation:"fadeIn 0.2s ease" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.muted, fontFamily:"'Nunito',sans-serif",
                    textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Booking History</div>
                  {BOOKINGS.filter((b) => b.player === p.name).map((b) => {
                    const bs = BSTATUS_CFG[b.status];
                    return (
                      <div key={b.id} style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
                        <div>
                          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:C.text }}>{b.date} · {b.time}</div>
                          <div style={{ fontSize:10, color:C.muted }}>{b.table} · {b.duration}h</div>
                        </div>
                        <Pill label={bs.label} color={bs.color} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT — TOP NAV LAYOUT
══════════════════════════════════════════════════════════════ */
interface NavItem { id: PageId; label: string; icon: string; }
const NAV_ITEMS: NavItem[] = [
  { id:"dashboard", label:"Dashboard", icon:"⬡" },
  { id:"bookings",  label:"Bookings",  icon:"📅" },
  { id:"players",   label:"Players",   icon:"👤" },
];

export default function SnookerAdminSage(): ReactElement {
  const [page, setPage] = useState<PageId>("dashboard");
  const now = useNow();

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; }
        input::placeholder { color:${C.mutedLt}; }
        select option { background:${C.surface}; }
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 ${C.terra}55} 70%{box-shadow:0 0 0 8px transparent} 100%{box-shadow:0 0 0 0 transparent} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:${C.bg}} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
      `}</style>

      {/* Top navigation bar */}
      <header style={{
        background:C.surface, borderBottom:`1px solid ${C.border}`,
        position:"sticky", top:0, zIndex:50,
        boxShadow:"0 1px 8px rgba(42,32,24,0.07)",
      }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 32px",
          display:"flex", alignItems:"center", height:64 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:48 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:C.sage,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🎱</div>
            <div>
              <div style={{ fontFamily:"'Lora',serif", fontSize:15, fontWeight:600, color:C.text }}>The Cue Room</div>
              <div style={{ fontSize:10, color:C.muted, fontFamily:"'Nunito',sans-serif" }}>Admin</div>
            </div>
          </div>

          {/* Nav tabs */}
          <nav style={{ display:"flex", gap:4, flex:1 }}>
            {NAV_ITEMS.map((n) => {
              const active = page === n.id;
              return (
                <button key={n.id} onClick={() => setPage(n.id)} style={{
                  display:"flex", alignItems:"center", gap:7, padding:"8px 18px",
                  borderRadius:10, cursor:"pointer", border:"none",
                  background: active ? C.terraLt : "transparent",
                  color: active ? C.terra : C.muted,
                  fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700,
                  transition:"all 0.15s",
                }}>
                  {n.icon} {n.label}
                </button>
              );
            })}
          </nav>

          {/* Right: time + avatar */}
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:13, color:C.text }}>
                {new Date(now).toLocaleTimeString("en-GB")}
              </div>
              <div style={{ fontSize:10, color:C.muted }}>Thu 5 Mar</div>
            </div>
            <div style={{
              width:36, height:36, borderRadius:"50%", background:C.sage,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Lora',serif", fontSize:14, fontWeight:600, color:"#fff",
            }}>A</div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main style={{ maxWidth:1280, margin:"0 auto", padding:"32px 32px" }}>
        {page === "dashboard" && <DashboardPage now={now} />}
        {page === "bookings"  && <BookingsPage />}
        {page === "players"   && <PlayersPage />}
      </main>
    </div>
  );
}
