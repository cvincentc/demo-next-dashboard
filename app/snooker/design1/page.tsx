"use client";
import { useState, useEffect, ReactNode, CSSProperties } from "react";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const TABLES = [
  { id:1, name:"Table 1", type:"Championship", rate:15, status:"occupied",  player:"James R.",   startTime: Date.now()-55*60000 },
  { id:2, name:"Table 2", type:"Standard",     rate:12, status:"available", player:null,         startTime:null },
  { id:3, name:"Table 3", type:"Standard",     rate:12, status:"reserved",  player:"Mike T.",    startTime: Date.now()+25*60000 },
  { id:4, name:"Table 4", type:"Championship", rate:15, status:"occupied",  player:"Sarah K.",   startTime: Date.now()-22*60000 },
  { id:5, name:"Table 5", type:"Standard",     rate:12, status:"available", player:null,         startTime:null },
  { id:6, name:"Table 6", type:"Standard",     rate:12, status:"maintenance",player:null,        startTime:null },
];

const BOOKINGS = [
  { id:"BK-001", player:"James Robertson", table:"Table 1", date:"2026-03-05", time:"10:00", duration:2, status:"confirmed",  phone:"+44 7700 900123" },
  { id:"BK-002", player:"Sarah Khan",      table:"Table 4", date:"2026-03-05", time:"11:30", duration:1, status:"in_progress",phone:"+44 7700 900456" },
  { id:"BK-003", player:"Mike Thompson",   table:"Table 3", date:"2026-03-05", time:"14:00", duration:2, status:"confirmed",  phone:"+44 7700 900789" },
  { id:"BK-004", player:"Lena Fischer",    table:"Table 2", date:"2026-03-05", time:"16:00", duration:3, status:"confirmed",  phone:"+44 7700 900321" },
  { id:"BK-005", player:"David Osei",      table:"Table 5", date:"2026-03-06", time:"09:00", duration:1, status:"pending",    phone:"+44 7700 900654" },
  { id:"BK-006", player:"Claire Dubois",   table:"Table 1", date:"2026-03-06", time:"13:00", duration:2, status:"confirmed",  phone:"+44 7700 900987" },
  { id:"BK-007", player:"Tom Bradley",     table:"Table 6", date:"2026-03-04", time:"18:00", duration:2, status:"completed",  phone:"+44 7700 900111" },
  { id:"BK-008", player:"James Robertson", table:"Table 2", date:"2026-03-04", time:"10:00", duration:1, status:"cancelled",  phone:"+44 7700 900123" },
];

const PLAYERS = [
  { id:"PL-001", name:"James Robertson", email:"james.r@email.com",   phone:"+44 7700 900123", tier:"Gold",   visits:42, spent:890,  joined:"2024-01-15", lastSeen:"2026-03-05" },
  { id:"PL-002", name:"Sarah Khan",      email:"sarah.k@email.com",   phone:"+44 7700 900456", tier:"Silver", visits:28, spent:512,  joined:"2024-03-22", lastSeen:"2026-03-05" },
  { id:"PL-003", name:"Mike Thompson",   email:"mike.t@email.com",    phone:"+44 7700 900789", tier:"Gold",   visits:67, spent:1340, joined:"2023-11-08", lastSeen:"2026-03-04" },
  { id:"PL-004", name:"Lena Fischer",    email:"lena.f@email.com",    phone:"+44 7700 900321", tier:"Bronze", visits:9,  spent:145,  joined:"2025-08-01", lastSeen:"2026-02-28" },
  { id:"PL-005", name:"David Osei",      email:"david.o@email.com",   phone:"+44 7700 900654", tier:"Silver", visits:19, spent:378,  joined:"2025-01-10", lastSeen:"2026-03-03" },
  { id:"PL-006", name:"Claire Dubois",   email:"claire.d@email.com",  phone:"+44 7700 900987", tier:"Bronze", visits:5,  spent:87,   joined:"2025-12-01", lastSeen:"2026-03-01" },
  { id:"PL-007", name:"Tom Bradley",     email:"tom.b@email.com",     phone:"+44 7700 900111", tier:"Gold",   visits:55, spent:1105, joined:"2023-06-14", lastSeen:"2026-03-04" },
];

/* ─── HELPERS ──────────────────────────────────────────────── */
function useNow() {
  const [n, setN] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(t); }, []);
  return n;
}
const pad = (n: number) => String(n).padStart(2,"0");
function elapsed(ms: number | null | undefined) {
  if (!ms || ms < 0) return "—";
  const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60);
  return h > 0 ? `${h}h ${pad(m)}m` : `${pad(m)}:${pad(s%60)}`;
}

/* ─── TOKENS ───────────────────────────────────────────────── */
const C = {
  bg:        "#07100a",
  surface:   "#0d1a10",
  border:    "#1c2e1e",
  borderHi:  "#2e4a30",
  text:      "#ddd5c0",
  muted:     "#5a6e5c",
  accent:    "#4caf76",
  accentDim: "rgba(76,175,118,0.12)",
  gold:      "#c9a84c",
  red:       "#e05252",
  yellow:    "#d4a843",
  blue:      "#5b9bd5",
};

const STATUS = {
  available:   { label:"Available",    color:C.accent, bg:"rgba(76,175,118,0.10)" },
  occupied:    { label:"In Play",      color:"#e07b3a", bg:"rgba(224,123,58,0.10)" },
  reserved:    { label:"Reserved",     color:C.yellow,  bg:"rgba(212,168,67,0.10)" },
  maintenance: { label:"Maintenance",  color:C.muted,   bg:"rgba(90,110,92,0.10)" },
};

const BSTATUS = {
  confirmed:   { label:"Confirmed",   color:C.accent },
  in_progress: { label:"In Progress", color:"#e07b3a" },
  pending:     { label:"Pending",     color:C.yellow },
  completed:   { label:"Completed",   color:C.muted },
  cancelled:   { label:"Cancelled",   color:C.red },
};

const TIERS = {
  Gold:   { color:"#c9a84c", bg:"rgba(201,168,76,0.12)" },
  Silver: { color:"#a0a8b0", bg:"rgba(160,168,176,0.12)" },
  Bronze: { color:"#c47a4a", bg:"rgba(196,122,74,0.12)" },
};

/* ─── SHARED COMPONENTS ────────────────────────────────────── */
function Pill({ label, color, bg }: { label: string; color: string; bg?: string }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:20,
      background: bg || color+"22",
      border:`1px solid ${color}44`,
      fontSize:10, color, fontFamily:"'JetBrains Mono',monospace",
      textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap",
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0}}/>
      {label}
    </span>
  );
}

function Card({ children, style={}, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div style={{
      background: C.surface, border:`1px solid ${C.border}`,
      borderRadius:12, ...style,
    }} onClick={onClick}>
      {children}
    </div>
  );
}

function StatBox({ value, label, color=C.accent, sub }: { value: string | number; label: string; color?: string; sub?: string }) {
  return (
    <Card style={{ padding:"18px 20px" }}>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:28, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:C.muted, marginTop:3, fontFamily:"'JetBrains Mono',monospace" }}>{sub}</div>}
      <div style={{ fontSize:10, color:C.muted, marginTop:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
    </Card>
  );
}

function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:C.text, margin:0, fontWeight:600 }}>{title}</h2>
      {action}
    </div>
  );
}

type BtnVariant = "primary" | "ghost" | "danger" | "outline";
function Btn({ children, variant="primary", onClick, style={} }: { children: ReactNode; variant?: BtnVariant; onClick?: React.MouseEventHandler<HTMLButtonElement>; style?: CSSProperties }) {
  const styles: Record<BtnVariant, CSSProperties> = {
    primary:  { background:C.accent,   color:"#07100a", border:"none" },
    ghost:    { background:"transparent", color:C.muted, border:`1px solid ${C.border}` },
    danger:   { background:"transparent", color:C.red,   border:`1px solid ${C.red}44` },
    outline:  { background:"transparent", color:C.accent, border:`1px solid ${C.accent}55` },
  };
  return (
    <button onClick={onClick} style={{
      padding:"8px 16px", borderRadius:8, cursor:"pointer",
      fontFamily:"'JetBrains Mono',monospace", fontSize:11,
      fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase",
      transition:"opacity 0.15s", ...styles[variant], ...style,
    }}
    onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
    onMouseLeave={e=>e.currentTarget.style.opacity="1"}
    >{children}</button>
  );
}

/* ─── TABLE CARD (dashboard) ───────────────────────────────── */
function TableCard({ t, now }: { t: typeof TABLES[0]; now: number }) {
  const cfg = STATUS[t.status as keyof typeof STATUS];
  const ms = t.status === "occupied" && t.startTime ? now - t.startTime : null;
  const cost = ms ? ((ms/3600000) * t.rate).toFixed(2) : null;

  return (
    <Card style={{ padding:"16px", position:"relative", transition:"border-color 0.2s",
      borderColor: cfg.color+"44",
    }}>
      {/* felt graphic */}
      <div style={{
        width:"100%", height:56, borderRadius:6, background:cfg.bg,
        border:`1px solid ${cfg.color}33`, marginBottom:12,
        display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
        overflow:"hidden",
      }}>
        {/* cushion strips */}
        {["top","bottom","left","right"].map(s => (
          <div key={s} style={{
            position:"absolute",
            ...(s==="top"    ? {top:0,left:0,right:0,height:4}:{}),
            ...(s==="bottom" ? {bottom:0,left:0,right:0,height:4}:{}),
            ...(s==="left"   ? {left:0,top:0,bottom:0,width:4}:{}),
            ...(s==="right"  ? {right:0,top:0,bottom:0,width:4}:{}),
            background:cfg.color, opacity:0.35,
          }}/>
        ))}
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:cfg.color, opacity:0.7 }}>
          {t.type.toUpperCase()}
        </div>
        {t.status==="occupied" && (
          <div style={{
            position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
            width:10, height:10, borderRadius:"50%", background:cfg.color,
            boxShadow:`0 0 8px ${cfg.color}`,
            animation:"pulse 2s infinite",
          }}/>
        )}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:C.text }}>{t.name}</span>
        <Pill label={cfg.label} color={cfg.color} />
      </div>

      {t.player && (
        <div style={{ fontSize:11, color:C.muted, fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>
          👤 {t.player}
        </div>
      )}

      {ms !== null && (
        <div style={{ display:"flex", gap:12, marginTop:4 }}>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, color:cfg.color }}>{elapsed(ms)}</div>
            <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>elapsed</div>
          </div>
          <div style={{ width:1, background:C.border }}/>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, color:C.text }}>£{cost}</div>
            <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>running cost</div>
          </div>
        </div>
      )}

      {t.status === "available" && (
        <div style={{ fontSize:10, color:C.muted, fontFamily:"'JetBrains Mono',monospace", marginTop:4 }}>
          £{t.rate}/hr
        </div>
      )}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 1 — DASHBOARD
═══════════════════════════════════════════════════════════ */
function DashboardPage() {
  const now = useNow();
  const occupied = TABLES.filter(t => t.status==="occupied");
  const revenue  = occupied.reduce((s,t) => s + ((now-(t.startTime??now))/3600000*t.rate), 0);
  const todayBookings = BOOKINGS.filter(b => b.date==="2026-03-05" && b.status !== "cancelled").length;

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:C.text, margin:"0 0 4px" }}>
          Good morning, Admin
        </h1>
        <p style={{ color:C.muted, fontSize:12, fontFamily:"'JetBrains Mono',monospace", margin:0 }}>
          Thursday, 5 March 2026 · {new Date(now).toLocaleTimeString("en-GB")}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
        <StatBox value={occupied.length} label="Tables Active" color="#e07b3a" sub={`of ${TABLES.length} total`}/>
        <StatBox value={`£${revenue.toFixed(0)}`} label="Live Revenue" color={C.accent}/>
        <StatBox value={todayBookings} label="Today's Bookings" color={C.yellow}/>
        <StatBox value={PLAYERS.length} label="Registered Players" color={C.blue}/>
      </div>

      {/* Table grid */}
      <SectionHeader title="Table Status" action={
        <div style={{ display:"flex", gap:8 }}>
          {Object.entries(STATUS).map(([k,v]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10,
              color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:v.color }}/>
              {TABLES.filter(t=>t.status===k).length} {v.label}
            </div>
          ))}
        </div>
      }/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:32 }}>
        {TABLES.map(t => <TableCard key={t.id} t={t} now={now}/>)}
      </div>

      {/* Upcoming bookings today */}
      <SectionHeader title="Today's Schedule" action={<Btn variant="outline">View All</Btn>}/>
      <Card>
        {BOOKINGS.filter(b=>b.date==="2026-03-05").map((b,i,arr) => {
          const bs = BSTATUS[b.status as keyof typeof BSTATUS];
          return (
            <div key={b.id} style={{
              display:"flex", alignItems:"center", padding:"14px 20px",
              borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none",
              gap:16,
            }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:C.accent, width:44 }}>{b.time}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:C.text }}>{b.player}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{b.table} · {b.duration}h</div>
              </div>
              <Pill label={bs.label} color={bs.color} bg={bs.color+"22"}/>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 2 — BOOKINGS
═══════════════════════════════════════════════════════════ */
function BookingsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filters = ["all","confirmed","in_progress","pending","completed","cancelled"];
  const visible = BOOKINGS.filter(b => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch = b.player.toLowerCase().includes(search.toLowerCase()) ||
      b.table.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:C.text, margin:"0 0 4px" }}>Bookings</h1>
          <p style={{ color:C.muted, fontSize:12, fontFamily:"'JetBrains Mono',monospace", margin:0 }}>
            {BOOKINGS.length} total · {BOOKINGS.filter(b=>b.status==="confirmed").length} confirmed today
          </p>
        </div>
        <Btn onClick={()=>setShowModal(true)}>+ New Booking</Btn>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {filters.map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:"5px 14px", borderRadius:20, cursor:"pointer",
            fontFamily:"'JetBrains Mono',monospace", fontSize:10, textTransform:"capitalize",
            letterSpacing:"0.05em", border:"1px solid",
            background: filter===f ? (f==="all" ? C.surface : BSTATUS[f as keyof typeof BSTATUS]?.color+"22") : "transparent",
            borderColor: filter===f ? (f==="all" ? C.borderHi : BSTATUS[f as keyof typeof BSTATUS]?.color+"66") : C.border,
            color: filter===f ? (f==="all" ? C.text : BSTATUS[f as keyof typeof BSTATUS]?.color) : C.muted,
            transition:"all 0.15s",
          }}>
            {f} ({f==="all" ? BOOKINGS.length : BOOKINGS.filter(b=>b.status===f).length})
          </button>
        ))}
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search player, table, ID…"
          style={{
            marginLeft:"auto", padding:"5px 14px", borderRadius:8, background:C.surface,
            border:`1px solid ${C.border}`, color:C.text, fontFamily:"'JetBrains Mono',monospace",
            fontSize:11, outline:"none", width:220,
          }}
        />
      </div>

      {/* Table */}
      <Card>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["Booking ID","Player","Table","Date","Time","Duration","Status",""].map(h => (
                <th key={h} style={{
                  padding:"12px 16px", textAlign:"left", fontSize:9,
                  color:C.muted, fontFamily:"'JetBrains Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:500,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((b,i) => {
              const bs = BSTATUS[b.status as keyof typeof BSTATUS];
              return (
                <tr key={b.id} style={{
                  borderBottom: i<visible.length-1 ? `1px solid ${C.border}` : "none",
                  transition:"background 0.1s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background=C.accentDim}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:"14px 16px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.accent }}>{b.id}</td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ fontSize:13, color:C.text }}>{b.player}</div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{b.phone}</div>
                  </td>
                  <td style={{ padding:"14px 16px", fontSize:12, color:C.text, fontFamily:"'JetBrains Mono',monospace" }}>{b.table}</td>
                  <td style={{ padding:"14px 16px", fontSize:12, color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>{b.date}</td>
                  <td style={{ padding:"14px 16px", fontSize:12, color:C.text,  fontFamily:"'JetBrains Mono',monospace" }}>{b.time}</td>
                  <td style={{ padding:"14px 16px", fontSize:12, color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>{b.duration}h</td>
                  <td style={{ padding:"14px 16px" }}><Pill label={bs.label} color={bs.color} bg={bs.color+"22"}/></td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <Btn variant="ghost" style={{ padding:"4px 10px", fontSize:10 }}>Edit</Btn>
                      {b.status!=="cancelled" && b.status!=="completed" &&
                        <Btn variant="danger" style={{ padding:"4px 10px", fontSize:10 }}>Cancel</Btn>
                      }
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div style={{ padding:40, textAlign:"center", color:C.muted, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
            No bookings match your filter.
          </div>
        )}
      </Card>

      {/* New Booking Modal */}
      {showModal && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:200,
        }} onClick={()=>setShowModal(false)}>
          <Card style={{ padding:32, width:440, maxWidth:"90vw" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:C.text, margin:0 }}>New Booking</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:18 }}>✕</button>
            </div>
            {[
              { label:"Player Name", placeholder:"e.g. James Robertson", type:"text" },
              { label:"Phone Number", placeholder:"e.g. +44 7700 900123", type:"text" },
              { label:"Date", placeholder:"", type:"date" },
              { label:"Time", placeholder:"", type:"time" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:10, color:C.muted, fontFamily:"'JetBrains Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} style={{
                  width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.04)",
                  border:`1px solid ${C.border}`, borderRadius:8, color:C.text,
                  fontFamily:"'JetBrains Mono',monospace", fontSize:13, outline:"none", boxSizing:"border-box",
                  colorScheme:"dark",
                }}/>
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <div>
                <label style={{ display:"block", fontSize:10, color:C.muted, fontFamily:"'JetBrains Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Table</label>
                <select style={{ width:"100%", padding:"10px 14px", background:C.surface,
                  border:`1px solid ${C.border}`, borderRadius:8, color:C.text,
                  fontFamily:"'JetBrains Mono',monospace", fontSize:13, outline:"none" }}>
                  {TABLES.filter(t=>t.status==="available").map(t=>(
                    <option key={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:10, color:C.muted, fontFamily:"'JetBrains Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Duration</label>
                <select style={{ width:"100%", padding:"10px 14px", background:C.surface,
                  border:`1px solid ${C.border}`, borderRadius:8, color:C.text,
                  fontFamily:"'JetBrains Mono',monospace", fontSize:13, outline:"none" }}>
                  {[1,2,3,4].map(h=><option key={h}>{h} hour{h>1?"s":""}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <Btn onClick={()=>setShowModal(false)} style={{ flex:1 }}>Confirm Booking</Btn>
              <Btn variant="ghost" onClick={()=>setShowModal(false)} style={{ flex:1 }}>Cancel</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 3 — PLAYERS
═══════════════════════════════════════════════════════════ */
function PlayersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof PLAYERS[0] | null>(null);
  const [tierFilter, setTierFilter] = useState("all");

  const visible = PLAYERS.filter(p => {
    const matchTier = tierFilter === "all" || p.tier === tierFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchTier && matchSearch;
  });

  const selectedBookings = selected ? BOOKINGS.filter(b => b.player === selected.name) : [];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:C.text, margin:"0 0 4px" }}>Players</h1>
          <p style={{ color:C.muted, fontSize:12, fontFamily:"'JetBrains Mono',monospace", margin:0 }}>
            {PLAYERS.length} registered · {PLAYERS.filter(p=>p.tier==="Gold").length} Gold members
          </p>
        </div>
        <Btn>+ Add Player</Btn>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        {["Gold","Silver","Bronze"].map(tier => {
          const tierCfg = TIERS[tier as keyof typeof TIERS];
          return (
          <Card key={tier} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:40, height:40, borderRadius:"50%", background:tierCfg.bg,
              border:`2px solid ${tierCfg.color}55`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:16,
            }}>
              {tier==="Gold"?"🥇":tier==="Silver"?"🥈":"🥉"}
            </div>
            <div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, color:tierCfg.color }}>
                {PLAYERS.filter(p=>p.tier===tier).length}
              </div>
              <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{tier} members</div>
            </div>
          </Card>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap:16 }}>
        {/* Player list */}
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {["all","Gold","Silver","Bronze"].map(t => (
              <button key={t} onClick={()=>setTierFilter(t)} style={{
                padding:"5px 14px", borderRadius:20, cursor:"pointer",
                fontFamily:"'JetBrains Mono',monospace", fontSize:10, textTransform:"capitalize",
                letterSpacing:"0.05em", border:"1px solid",
                background: tierFilter===t ? (t==="all" ? C.surface : TIERS[t as keyof typeof TIERS]?.bg) : "transparent",
                borderColor: tierFilter===t ? (t==="all" ? C.borderHi : TIERS[t as keyof typeof TIERS]?.color+"66") : C.border,
                color: tierFilter===t ? (t==="all" ? C.text : TIERS[t as keyof typeof TIERS]?.color) : C.muted,
              }}>
                {t}
              </button>
            ))}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search players…"
              style={{
                marginLeft:"auto", padding:"5px 14px", borderRadius:8, background:C.surface,
                border:`1px solid ${C.border}`, color:C.text, fontFamily:"'JetBrains Mono',monospace",
                fontSize:11, outline:"none", width:200,
              }}
            />
          </div>

          <Card>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["Player","Tier","Visits","Total Spent","Last Seen",""].map(h=>(
                    <th key={h} style={{
                      padding:"12px 16px", textAlign:"left", fontSize:9, color:C.muted,
                      fontFamily:"'JetBrains Mono',monospace", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:500,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((p,i)=>{
                  const tier = TIERS[p.tier as keyof typeof TIERS];
                  const isSelected = selected?.id === p.id;
                  return (
                    <tr key={p.id}
                      onClick={()=>setSelected(isSelected ? null : p)}
                      style={{
                        borderBottom: i<visible.length-1 ? `1px solid ${C.border}` : "none",
                        cursor:"pointer",
                        background: isSelected ? C.accentDim : "transparent",
                        transition:"background 0.15s",
                      }}
                      onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background=C.accentDim+"88"}}
                      onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background="transparent"}}
                    >
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{
                            width:32, height:32, borderRadius:"50%", flexShrink:0,
                            background:`linear-gradient(135deg, ${tier.color}44, ${tier.color}22)`,
                            border:`1px solid ${tier.color}55`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:12, color:tier.color, fontFamily:"'Cormorant Garamond',serif",
                            fontWeight:600,
                          }}>
                            {p.name.split(" ").map(n=>n[0]).join("")}
                          </div>
                          <div>
                            <div style={{ fontSize:13, color:C.text }}>{p.name}</div>
                            <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"14px 16px" }}><Pill label={p.tier} color={tier.color} bg={tier.bg}/></td>
                      <td style={{ padding:"14px 16px", fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:C.text }}>{p.visits}</td>
                      <td style={{ padding:"14px 16px", fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:C.accent }}>£{p.spent}</td>
                      <td style={{ padding:"14px 16px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.muted }}>{p.lastSeen}</td>
                      <td style={{ padding:"14px 16px" }}>
                        <Btn variant="ghost" style={{ padding:"4px 10px", fontSize:10 }}>View</Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Player detail panel */}
        {selected && (
          <div style={{ animation:"slideIn 0.2s ease" }}>
            <Card style={{ padding:24, position:"sticky", top:80 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:C.text, margin:0 }}>Player Profile</h3>
                <button onClick={()=>setSelected(null)} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16 }}>✕</button>
              </div>

              {/* Avatar */}
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{
                  width:64, height:64, borderRadius:"50%", margin:"0 auto 10px",
                  background:`linear-gradient(135deg, ${TIERS[selected.tier as keyof typeof TIERS].color}55, ${TIERS[selected.tier as keyof typeof TIERS].color}22)`,
                  border:`2px solid ${TIERS[selected.tier as keyof typeof TIERS].color}66`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, color:TIERS[selected.tier as keyof typeof TIERS].color, fontFamily:"'Cormorant Garamond',serif", fontWeight:600,
                }}>
                  {selected.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:C.text }}>{selected.name}</div>
                <div style={{ marginTop:6 }}><Pill label={selected.tier} color={TIERS[selected.tier as keyof typeof TIERS].color} bg={TIERS[selected.tier as keyof typeof TIERS].bg}/></div>
              </div>

              {/* Info grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[
                  {l:"Total Visits", v:selected.visits},
                  {l:"Total Spent",  v:`£${selected.spent}`},
                  {l:"Member Since", v:selected.joined},
                  {l:"Last Seen",    v:selected.lastSeen},
                ].map(({l,v})=>(
                  <div key={l} style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"10px 12px",
                    border:`1px solid ${C.border}` }}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:C.text }}>{v}</div>
                    <div style={{ fontSize:9, color:C.muted, marginTop:3, textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16, marginBottom:16 }}>
                <div style={{ fontSize:9, color:C.muted, fontFamily:"'JetBrains Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Contact</div>
                <div style={{ fontSize:11, color:C.text, fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>{selected.email}</div>
                <div style={{ fontSize:11, color:C.text, fontFamily:"'JetBrains Mono',monospace" }}>{selected.phone}</div>
              </div>

              {/* Booking history */}
              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
                <div style={{ fontSize:9, color:C.muted, fontFamily:"'JetBrains Mono',monospace",
                  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Booking History</div>
                {selectedBookings.length === 0
                  ? <div style={{ fontSize:11, color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>No bookings found.</div>
                  : selectedBookings.map(b=>{
                    const bs = BSTATUS[b.status as keyof typeof BSTATUS];
                    return (
                      <div key={b.id} style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"center", padding:"8px 0",
                        borderBottom:`1px solid ${C.border}` }}>
                        <div>
                          <div style={{ fontSize:11, color:C.text }}>{b.date} · {b.time}</div>
                          <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{b.table} · {b.duration}h</div>
                        </div>
                        <Pill label={bs.label} color={bs.color} bg={bs.color+"22"}/>
                      </div>
                    );
                  })
                }
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP — NAV + ROUTING
═══════════════════════════════════════════════════════════ */
const NAV = [
  { id:"dashboard", label:"Dashboard",  icon:"⬡" },
  { id:"bookings",  label:"Bookings",   icon:"◈" },
  { id:"players",   label:"Players",    icon:"◉" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; }
        input::placeholder { color:${C.muted}; }
        select option { background:${C.surface}; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes slideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width:220, flexShrink:0, background:C.surface,
        borderRight:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, bottom:0, left:0, zIndex:50,
      }}>
        {/* Logo */}
        <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:8, flexShrink:0,
              background:`linear-gradient(135deg, ${C.accent}, #2d7a4f)`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
            }}>🎱</div>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:C.text, fontWeight:600 }}>The Cue Room</div>
              <div style={{ fontSize:9, color:C.muted, fontFamily:"'JetBrains Mono',monospace",
                textTransform:"uppercase", letterSpacing:"0.1em", marginTop:1 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ padding:"16px 12px", flex:1 }}>
          <div style={{ fontSize:9, color:C.muted, fontFamily:"'JetBrains Mono',monospace",
            textTransform:"uppercase", letterSpacing:"0.1em", paddingLeft:8, marginBottom:8 }}>Menu</div>
          {NAV.map(n => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={()=>setPage(n.id)} style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"10px 12px", borderRadius:8, cursor:"pointer",
                background: active ? C.accentDim : "transparent",
                border: active ? `1px solid ${C.accent}33` : "1px solid transparent",
                color: active ? C.accent : C.muted,
                fontFamily:"'JetBrains Mono',monospace", fontSize:12,
                textAlign:"left", transition:"all 0.15s", marginBottom:4,
              }}>
                <span style={{ fontSize:14 }}>{n.icon}</span>
                {n.label}
                {active && <span style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:C.accent }}/>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding:"16px 20px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{
              width:28, height:28, borderRadius:"50%",
              background:`linear-gradient(135deg, ${C.accent}44, ${C.accent}22)`,
              border:`1px solid ${C.accent}44`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, color:C.accent, fontFamily:"'Cormorant Garamond',serif", fontWeight:600,
            }}>A</div>
            <div>
              <div style={{ fontSize:11, color:C.text }}>Admin</div>
              <div style={{ fontSize:9, color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>admin@cueroom.co</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:220, flex:1, padding:"32px 36px", minHeight:"100vh" }}>
        {page === "dashboard" && <DashboardPage />}
        {page === "bookings"  && <BookingsPage />}
        {page === "players"   && <PlayersPage />}
      </main>
    </div>
  );
}
