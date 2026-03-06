"use client";
import { useState, useEffect, ReactNode, CSSProperties, MouseEventHandler } from "react";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const TABLES = [
  { id:1, name:"Table I",   type:"Championship", rate:15, status:"occupied",    player:"James Robertson", startTime: Date.now()-55*60000 },
  { id:2, name:"Table II",  type:"Standard",     rate:12, status:"available",   player:null,              startTime:null },
  { id:3, name:"Table III", type:"Standard",     rate:12, status:"reserved",    player:"Mike Thompson",   startTime: Date.now()+25*60000 },
  { id:4, name:"Table IV",  type:"Championship", rate:15, status:"occupied",    player:"Sarah Khan",      startTime: Date.now()-22*60000 },
  { id:5, name:"Table V",   type:"Standard",     rate:12, status:"available",   player:null,              startTime:null },
  { id:6, name:"Table VI",  type:"Standard",     rate:12, status:"maintenance", player:null,              startTime:null },
];

const BOOKINGS = [
  { id:"BK-001", player:"James Robertson", table:"Table I",   date:"2026-03-05", time:"10:00", duration:2, status:"confirmed",   phone:"+44 7700 900123" },
  { id:"BK-002", player:"Sarah Khan",      table:"Table IV",  date:"2026-03-05", time:"11:30", duration:1, status:"in_progress", phone:"+44 7700 900456" },
  { id:"BK-003", player:"Mike Thompson",   table:"Table III", date:"2026-03-05", time:"14:00", duration:2, status:"confirmed",   phone:"+44 7700 900789" },
  { id:"BK-004", player:"Lena Fischer",    table:"Table II",  date:"2026-03-05", time:"16:00", duration:3, status:"confirmed",   phone:"+44 7700 900321" },
  { id:"BK-005", player:"David Osei",      table:"Table V",   date:"2026-03-06", time:"09:00", duration:1, status:"pending",     phone:"+44 7700 900654" },
  { id:"BK-006", player:"Claire Dubois",   table:"Table I",   date:"2026-03-06", time:"13:00", duration:2, status:"confirmed",   phone:"+44 7700 900987" },
  { id:"BK-007", player:"Tom Bradley",     table:"Table VI",  date:"2026-03-04", time:"18:00", duration:2, status:"completed",   phone:"+44 7700 900111" },
  { id:"BK-008", player:"James Robertson", table:"Table II",  date:"2026-03-04", time:"10:00", duration:1, status:"cancelled",   phone:"+44 7700 900123" },
];

const PLAYERS = [
  { id:"PL-001", name:"James Robertson", email:"james.r@email.com",  phone:"+44 7700 900123", tier:"Patron",  visits:42, spent:890,  joined:"2024-01-15", lastSeen:"2026-03-05" },
  { id:"PL-002", name:"Sarah Khan",      email:"sarah.k@email.com",  phone:"+44 7700 900456", tier:"Member",  visits:28, spent:512,  joined:"2024-03-22", lastSeen:"2026-03-05" },
  { id:"PL-003", name:"Mike Thompson",   email:"mike.t@email.com",   phone:"+44 7700 900789", tier:"Patron",  visits:67, spent:1340, joined:"2023-11-08", lastSeen:"2026-03-04" },
  { id:"PL-004", name:"Lena Fischer",    email:"lena.f@email.com",   phone:"+44 7700 900321", tier:"Guest",   visits:9,  spent:145,  joined:"2025-08-01", lastSeen:"2026-02-28" },
  { id:"PL-005", name:"David Osei",      email:"david.o@email.com",  phone:"+44 7700 900654", tier:"Member",  visits:19, spent:378,  joined:"2025-01-10", lastSeen:"2026-03-03" },
  { id:"PL-006", name:"Claire Dubois",   email:"claire.d@email.com", phone:"+44 7700 900987", tier:"Guest",   visits:5,  spent:87,   joined:"2025-12-01", lastSeen:"2026-03-01" },
  { id:"PL-007", name:"Tom Bradley",     email:"tom.b@email.com",    phone:"+44 7700 900111", tier:"Patron",  visits:55, spent:1105, joined:"2023-06-14", lastSeen:"2026-03-04" },
];

/* ─── HELPERS ──────────────────────────────────────────────── */
function useNow() {
  const [n, setN] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(t); }, []);
  return n;
}
const pad = (n: number) => String(n).padStart(2,"0");
function elapsedStr(ms: number | null | undefined) {
  if (!ms || ms < 0) return "—";
  const s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60);
  return h > 0 ? `${h}h ${pad(m)}m` : `${pad(m)}:${pad(s%60)}`;
}

/* ─── DESIGN TOKENS ────────────────────────────────────────── */
const C = {
  bg:       "#f7f3ec",
  surface:  "#fdfaf5",
  border:   "#ddd5c0",
  borderDk: "#c4b89a",
  text:     "#1a1510",
  muted:    "#8a7d68",
  gold:     "#a8843a",
  goldLt:   "#c9a84c",
  navy:     "#1b2a4a",
  red:      "#9b3535",
  green:    "#2d6b4a",
  amber:    "#b87333",
};

const STATUS_CFG = {
  available:   { label:"Available",   color:C.green,  bg:"rgba(45,107,74,0.07)"  },
  occupied:    { label:"In Play",     color:C.navy,   bg:"rgba(27,42,74,0.07)"   },
  reserved:    { label:"Reserved",    color:C.amber,  bg:"rgba(184,115,51,0.07)" },
  maintenance: { label:"Maintenance", color:C.muted,  bg:"rgba(138,125,104,0.07)"},
};

const BSTATUS = {
  confirmed:   { label:"Confirmed",   color:C.green },
  in_progress: { label:"In Progress", color:C.navy  },
  pending:     { label:"Pending",     color:C.amber  },
  completed:   { label:"Completed",   color:C.muted  },
  cancelled:   { label:"Cancelled",   color:C.red   },
};

const TIERS = {
  Patron: { color:C.gold,  bg:"rgba(168,132,58,0.08)"  },
  Member: { color:C.navy,  bg:"rgba(27,42,74,0.07)"    },
  Guest:  { color:C.muted, bg:"rgba(138,125,104,0.07)" },
};

/* ─── ORNAMENT SVG ─────────────────────────────────────────── */
function Ornament({ size=20, color=C.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 1 L11.5 8.5 L19 10 L11.5 11.5 L10 19 L8.5 11.5 L1 10 L8.5 8.5 Z" stroke={color} strokeWidth="0.8" fill="none"/>
      <circle cx="10" cy="10" r="1.5" fill={color}/>
    </svg>
  );
}

function Divider({ style={} }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, ...style }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${C.borderDk})` }}/>
      <Ornament size={14} color={C.gold}/>
      <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${C.borderDk})` }}/>
    </div>
  );
}

/* ─── SHARED COMPONENTS ────────────────────────────────────── */
function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"2px 10px", border:`1px solid ${color}55`,
      fontSize:9, color, fontFamily:"'Cinzel',serif",
      letterSpacing:"0.12em", textTransform:"uppercase",
      background:`${color}0d`,
    }}>
      {label}
    </span>
  );
}

function Panel({ children, style={}, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: MouseEventHandler<HTMLDivElement> }) {
  return (
    <div style={{
      background: C.surface,
      border:`1px solid ${C.border}`,
      position:"relative",
      ...style,
    }} onClick={onClick}>
      {/* corner accents */}
      {[{t:0,l:0},{t:0,r:0},{b:0,l:0},{b:0,r:0}].map((pos,i) => (
        <div key={i} style={{
          position:"absolute", width:8, height:8,
          borderTop: pos.t===0 ? `2px solid ${C.gold}` : undefined,
          borderBottom: pos.b===0 ? `2px solid ${C.gold}` : undefined,
          borderLeft: pos.l===0 ? `2px solid ${C.gold}` : undefined,
          borderRight: pos.r===0 ? `2px solid ${C.gold}` : undefined,
          top: pos.t===0 ? -1 : undefined, bottom: pos.b===0 ? -1 : undefined,
          left: pos.l===0 ? -1 : undefined, right: pos.r===0 ? -1 : undefined,
        }}/>
      ))}
      {children}
    </div>
  );
}

function StatPanel({ value, label, icon }: { value: string | number; label: string; icon?: string }) {
  return (
    <Panel style={{ padding:"20px 24px", textAlign:"center" }}>
      {icon && <div style={{ fontSize:18, marginBottom:8 }}>{icon}</div>}
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:26, color:C.navy, letterSpacing:"0.05em" }}>{value}</div>
      <Divider style={{ margin:"10px 0 8px" }}/>
      <div style={{ fontSize:9, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.14em", textTransform:"uppercase" }}>{label}</div>
    </Panel>
  );
}

type BtnVariant = "primary" | "gold" | "ghost" | "danger";
function Btn({ children, variant="primary", onClick, style={} }: { children: ReactNode; variant?: BtnVariant; onClick?: MouseEventHandler<HTMLButtonElement>; style?: CSSProperties }) {
  const s: Record<BtnVariant, CSSProperties> = {
    primary: { background:C.navy,        color:"#f7f3ec",  border:`1px solid ${C.navy}` },
    gold:    { background:"transparent",  color:C.gold,     border:`1px solid ${C.gold}` },
    ghost:   { background:"transparent",  color:C.muted,    border:`1px solid ${C.border}` },
    danger:  { background:"transparent",  color:C.red,      border:`1px solid ${C.red}66` },
  };
  return (
    <button onClick={onClick} style={{
      padding:"7px 18px", cursor:"pointer",
      fontFamily:"'Cinzel',serif", fontSize:10,
      letterSpacing:"0.12em", textTransform:"uppercase",
      transition:"opacity 0.15s", ...s[variant], ...style,
    }}
    onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
    onMouseLeave={e=>e.currentTarget.style.opacity="1"}
    >{children}</button>
  );
}

/* ─── TABLE CARD ───────────────────────────────────────────── */
function TableCard({ t, now }: { t: typeof TABLES[0]; now: number }) {
  const cfg = STATUS_CFG[t.status as keyof typeof STATUS_CFG];
  const ms = t.status==="occupied" && t.startTime ? now - t.startTime : null;

  return (
    <Panel style={{ padding:"18px 20px" }}>
      {/* Felt diagram */}
      <div style={{
        height:52, background:cfg.bg, border:`1px solid ${cfg.color}33`,
        marginBottom:14, position:"relative", overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{ position:"absolute", inset:4, border:`1px solid ${cfg.color}22` }}/>
        {[0,1,2,3,4,5].map(i => {
          const positions = [{top:3,left:3},{top:3,left:"calc(50% - 4px)"},{top:3,right:3},{bottom:3,left:3},{bottom:3,left:"calc(50% - 4px)"},{bottom:3,right:3}];
          return <div key={i} style={{ position:"absolute", width:7, height:7, borderRadius:"50%",
            background:C.surface, border:`1px solid ${cfg.color}55`, ...positions[i] }}/>;
        })}
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:9, color:cfg.color, letterSpacing:"0.15em", opacity:0.7 }}>
          {t.type.toUpperCase()}
        </span>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:14, color:C.navy, letterSpacing:"0.08em" }}>{t.name}</span>
        <Pill label={cfg.label} color={cfg.color}/>
      </div>

      {t.player && (
        <div style={{ fontSize:11, color:C.muted, fontFamily:"'EB Garamond',serif", fontStyle:"italic", marginBottom:8 }}>
          {t.player}
        </div>
      )}

      {ms !== null && (
        <>
          <Divider style={{ margin:"10px 0" }}/>
          <div style={{ display:"flex", gap:16 }}>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:15, color:C.navy }}>{elapsedStr(ms)}</div>
              <div style={{ fontSize:8, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Cinzel',serif" }}>Elapsed</div>
            </div>
            <div style={{ width:1, background:C.border }}/>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:15, color:C.gold }}>£{((ms/3600000)*t.rate).toFixed(2)}</div>
              <div style={{ fontSize:8, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Cinzel',serif" }}>Running</div>
            </div>
          </div>
        </>
      )}
      {t.status==="available" && (
        <div style={{ fontSize:10, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.08em" }}>£{t.rate} per hour</div>
      )}
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 1 — DASHBOARD
═══════════════════════════════════════════════════════════ */
function DashboardPage({ now }: { now: number }) {
  const occupied = TABLES.filter(t=>t.status==="occupied");
  const revenue = occupied.reduce((s,t)=>s+((now-(t.startTime??now))/3600000*t.rate),0);

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:8 }}>
          <div style={{ height:1, width:60, background:C.gold }}/>
          <Ornament size={18} color={C.gold}/>
          <div style={{ height:1, width:60, background:C.gold }}/>
        </div>
        <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:24, color:C.navy, margin:"0 0 6px", letterSpacing:"0.1em" }}>
          Operations Dashboard
        </h1>
        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:C.muted, fontStyle:"italic", margin:0 }}>
          Thursday, 5th March 2026 · {new Date(now).toLocaleTimeString("en-GB")}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
        <StatPanel value={occupied.length} label="Tables in Play" icon="🎱"/>
        <StatPanel value={`£${revenue.toFixed(0)}`} label="Live Revenue"/>
        <StatPanel value={BOOKINGS.filter(b=>b.date==="2026-03-05"&&b.status!=="cancelled").length} label="Today's Bookings"/>
        <StatPanel value={PLAYERS.length} label="Registered Members"/>
      </div>

      <Divider style={{ marginBottom:28 }}/>

      {/* Table grid */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:16, color:C.navy, margin:0, letterSpacing:"0.1em" }}>TABLE STATUS</h2>
        <div style={{ display:"flex", gap:16 }}>
          {Object.entries(STATUS_CFG).map(([k,v])=>(
            <span key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:9,
              color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.08em", textTransform:"uppercase" }}>
              <span style={{ width:5,height:5,background:v.color }}/>
              {TABLES.filter(t=>t.status===k).length} {v.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:36 }}>
        {TABLES.map(t=><TableCard key={t.id} t={t} now={now}/>)}
      </div>

      <Divider style={{ marginBottom:28 }}/>

      {/* Today schedule */}
      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:16, color:C.navy, margin:"0 0 18px", letterSpacing:"0.1em" }}>TODAY'S APPOINTMENTS</h2>
      <Panel>
        {BOOKINGS.filter(b=>b.date==="2026-03-05").map((b,i,arr)=>{
          const bs = BSTATUS[b.status as keyof typeof BSTATUS];
          return (
            <div key={b.id} style={{
              display:"flex", alignItems:"center", padding:"14px 20px", gap:20,
              borderBottom: i<arr.length-1 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:C.gold, width:44, letterSpacing:"0.05em" }}>{b.time}</div>
              <div style={{ width:1, height:32, background:C.border }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'EB Garamond',serif", fontSize:15, color:C.text }}>{b.player}</div>
                <div style={{ fontSize:10, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.05em", marginTop:2 }}>{b.table} · {b.duration}h</div>
              </div>
              <Pill label={bs.label} color={bs.color}/>
            </div>
          );
        })}
      </Panel>
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

  const visible = BOOKINGS.filter(b => {
    const ms = filter==="all" || b.status===filter;
    const ss = b.player.toLowerCase().includes(search.toLowerCase()) || b.table.toLowerCase().includes(search.toLowerCase());
    return ms && ss;
  });

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:8 }}>
          <div style={{ height:1, width:60, background:C.gold }}/>
          <Ornament size={18} color={C.gold}/>
          <div style={{ height:1, width:60, background:C.gold }}/>
        </div>
        <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:24, color:C.navy, margin:"0 0 6px", letterSpacing:"0.1em" }}>
          Reservations
        </h1>
        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:C.muted, fontStyle:"italic", margin:0 }}>
          {BOOKINGS.length} total bookings on record
        </p>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", gap:0 }}>
          {["all","confirmed","in_progress","pending","completed","cancelled"].map((f,i,arr) => {
            const active = filter===f;
            return (
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:"7px 14px", cursor:"pointer",
                fontFamily:"'Cinzel',serif", fontSize:9, letterSpacing:"0.1em",
                textTransform:"uppercase",
                background: active ? C.navy : "transparent",
                border:`1px solid ${C.borderDk}`,
                borderLeft: i>0 ? "none" : `1px solid ${C.borderDk}`,
                color: active ? "#f7f3ec" : C.muted,
                transition:"all 0.15s",
              }}>
                {f.replace("_"," ")}
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            style={{ padding:"7px 14px", border:`1px solid ${C.border}`, background:C.surface,
              fontFamily:"'EB Garamond',serif", fontSize:13, color:C.text, outline:"none", width:180 }}/>
          <Btn onClick={()=>setShowModal(true)}>+ New Reservation</Btn>
        </div>
      </div>

      <Panel>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.borderDk}`, background:`${C.navy}08` }}>
              {["Reference","Member","Table","Date","Time","Duration","Status","Actions"].map(h=>(
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:8, color:C.navy,
                  fontFamily:"'Cinzel',serif", letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((b,i)=>{
              const bs = BSTATUS[b.status as keyof typeof BSTATUS];
              return (
                <tr key={b.id} style={{ borderBottom: i<visible.length-1?`1px solid ${C.border}`:"none", transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${C.gold}0a`}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px", fontFamily:"'Cinzel',serif", fontSize:11, color:C.gold, letterSpacing:"0.05em" }}>{b.id}</td>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:C.text }}>{b.player}</div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{b.phone}</div>
                  </td>
                  <td style={{ padding:"13px 16px", fontFamily:"'Cinzel',serif", fontSize:11, color:C.navy, letterSpacing:"0.05em" }}>{b.table}</td>
                  <td style={{ padding:"13px 16px", fontFamily:"'EB Garamond',serif", fontSize:13, color:C.muted }}>{b.date}</td>
                  <td style={{ padding:"13px 16px", fontFamily:"'Cinzel',serif", fontSize:12, color:C.text }}>{b.time}</td>
                  <td style={{ padding:"13px 16px", fontFamily:"'Cinzel',serif", fontSize:11, color:C.muted }}>{b.duration}h</td>
                  <td style={{ padding:"13px 16px" }}><Pill label={bs.label} color={bs.color}/></td>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <Btn variant="ghost" style={{ padding:"3px 10px", fontSize:9 }}>Edit</Btn>
                      {b.status!=="cancelled"&&b.status!=="completed"&&<Btn variant="danger" style={{ padding:"3px 10px", fontSize:9 }}>Cancel</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      {/* Modal */}
      {showModal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(26,21,16,0.6)",backdropFilter:"blur(4px)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }} onClick={()=>setShowModal(false)}>
          <Panel style={{ padding:36, width:460, maxWidth:"90vw" }} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:12 }}>
                <div style={{ height:1, width:40, background:C.gold }}/>
                <Ornament size={14} color={C.gold}/>
                <div style={{ height:1, width:40, background:C.gold }}/>
              </div>
              <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:18, color:C.navy, margin:0 }}>New Reservation</h2>
            </div>
            {[{l:"Member Name",placeholder:"Full name"},{l:"Telephone",placeholder:"+44 7700 …"},{l:"Date",type:"date"},{l:"Time",type:"time"}].map(f=>(
              <div key={f.l} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:8, color:C.muted, fontFamily:"'Cinzel',serif",
                  letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:5 }}>{f.l}</label>
                <input type={f.type||"text"} placeholder={f.placeholder||""} style={{
                  width:"100%", padding:"9px 14px", background:C.bg, border:`1px solid ${C.border}`,
                  fontFamily:"'EB Garamond',serif", fontSize:14, color:C.text, outline:"none", boxSizing:"border-box",
                  colorScheme:"light",
                }}/>
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              {[{l:"Table"},{l:"Duration"}].map(f=>(
                <div key={f.l}>
                  <label style={{ display:"block", fontSize:8, color:C.muted, fontFamily:"'Cinzel',serif",
                    letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:5 }}>{f.l}</label>
                  <select style={{ width:"100%", padding:"9px 14px", background:C.bg, border:`1px solid ${C.border}`,
                    fontFamily:"'EB Garamond',serif", fontSize:14, color:C.text, outline:"none" }}>
                    {f.l==="Table"
                      ? TABLES.filter(t=>t.status==="available").map(t=><option key={t.id}>{t.name}</option>)
                      : [1,2,3,4].map(h=><option key={h}>{h} hour{h>1?"s":""}</option>)
                    }
                  </select>
                </div>
              ))}
            </div>
            <Divider style={{ margin:"20px 0" }}/>
            <div style={{ display:"flex", gap:12 }}>
              <Btn onClick={()=>setShowModal(false)} style={{ flex:1 }}>Confirm Reservation</Btn>
              <Btn variant="ghost" onClick={()=>setShowModal(false)} style={{ flex:1 }}>Dismiss</Btn>
            </div>
          </Panel>
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

  const visible = PLAYERS.filter(p=>{
    const mt = tierFilter==="all"||p.tier===tierFilter;
    const ms = p.name.toLowerCase().includes(search.toLowerCase())||p.email.toLowerCase().includes(search.toLowerCase());
    return mt&&ms;
  });

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:8 }}>
          <div style={{ height:1, width:60, background:C.gold }}/>
          <Ornament size={18} color={C.gold}/>
          <div style={{ height:1, width:60, background:C.gold }}/>
        </div>
        <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:24, color:C.navy, margin:"0 0 6px", letterSpacing:"0.1em" }}>
          Members Registry
        </h1>
        <p style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:C.muted, fontStyle:"italic", margin:0 }}>
          {PLAYERS.length} registered members
        </p>
      </div>

      {/* Tier stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
        {["Patron","Member","Guest"].map(tier=>{
          const tierCfg = TIERS[tier as keyof typeof TIERS];
          return (
          <Panel key={tier} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:36,height:36, border:`1px solid ${tierCfg.color}66`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'Cinzel',serif",fontSize:14,color:tierCfg.color }}>
              {tier==="Patron"?"I":tier==="Member"?"II":"III"}
            </div>
            <div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:20, color:tierCfg.color }}>
                {PLAYERS.filter(p=>p.tier===tier).length}
              </div>
              <div style={{ fontSize:8, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.1em", textTransform:"uppercase" }}>{tier}s</div>
            </div>
          </Panel>
          );
        })}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", gap:0 }}>
          {["all","Patron","Member","Guest"].map((t,i)=>(
            <button key={t} onClick={()=>setTierFilter(t)} style={{
              padding:"6px 14px", cursor:"pointer", fontFamily:"'Cinzel',serif", fontSize:9,
              letterSpacing:"0.1em", textTransform:"uppercase",
              background: tierFilter===t ? C.navy : "transparent",
              border:`1px solid ${C.borderDk}`,
              borderLeft: i>0?"none":`1px solid ${C.borderDk}`,
              color: tierFilter===t ? "#f7f3ec" : C.muted,
            }}>{t}</button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search members…"
          style={{ padding:"7px 14px", border:`1px solid ${C.border}`, background:C.surface,
            fontFamily:"'EB Garamond',serif", fontSize:13, color:C.text, outline:"none", width:200 }}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap:16 }}>
        <Panel>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.borderDk}`, background:`${C.navy}08` }}>
                {["Member","Status","Visits","Total Spent","Last Visit",""].map(h=>(
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:8,
                    color:C.navy, fontFamily:"'Cinzel',serif", letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p,i)=>{
                const tier = TIERS[p.tier as keyof typeof TIERS];
                const isSel = selected?.id===p.id;
                return (
                  <tr key={p.id} onClick={()=>setSelected(isSel?null:p)}
                    style={{ borderBottom:i<visible.length-1?`1px solid ${C.border}`:"none",
                      cursor:"pointer", background:isSel?`${C.gold}0a`:"transparent", transition:"background 0.1s" }}
                    onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background=`${C.gold}0a`}}
                    onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background="transparent"}}>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:32,height:32,border:`1px solid ${tier.color}55`,flexShrink:0,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontFamily:"'Cinzel',serif",fontSize:11,color:tier.color }}>
                          {p.name.split(" ").map(n=>n[0]).join("")}
                        </div>
                        <div>
                          <div style={{ fontFamily:"'EB Garamond',serif", fontSize:14, color:C.text }}>{p.name}</div>
                          <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"13px 16px" }}><Pill label={p.tier} color={tier.color}/></td>
                    <td style={{ padding:"13px 16px", fontFamily:"'Cinzel',serif", fontSize:12, color:C.text }}>{p.visits}</td>
                    <td style={{ padding:"13px 16px", fontFamily:"'Cinzel',serif", fontSize:12, color:C.gold }}>£{p.spent}</td>
                    <td style={{ padding:"13px 16px", fontFamily:"'EB Garamond',serif", fontSize:13, color:C.muted }}>{p.lastSeen}</td>
                    <td style={{ padding:"13px 16px" }}><Btn variant="ghost" style={{ padding:"3px 10px", fontSize:9 }}>View</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        {selected && (
          <div style={{ animation:"fadeIn 0.2s ease" }}>
            <Panel style={{ padding:24, position:"sticky", top:80 }}>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ width:56,height:56,border:`1px solid ${TIERS[selected.tier as keyof typeof TIERS].color}88`,
                  margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'Cinzel',serif",fontSize:18,color:TIERS[selected.tier as keyof typeof TIERS].color }}>
                  {selected.name.split(" ").map((n:string)=>n[0]).join("")}
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:15, color:C.navy, letterSpacing:"0.05em" }}>{selected.name}</div>
                <div style={{ marginTop:8 }}><Pill label={selected.tier} color={TIERS[selected.tier as keyof typeof TIERS].color}/></div>
              </div>
              <Divider style={{ margin:"16px 0" }}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[{l:"Visits",v:selected.visits},{l:"Spent",v:`£${selected.spent}`},{l:"Since",v:selected.joined},{l:"Last Seen",v:selected.lastSeen}].map(({l,v})=>(
                  <div key={l} style={{ border:`1px solid ${C.border}`, padding:"10px 12px" }}>
                    <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:C.navy }}>{v}</div>
                    <div style={{ fontSize:8, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:3 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:C.muted, marginBottom:4 }}>{selected.email}</div>
              <div style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:C.muted }}>{selected.phone}</div>
              <Divider style={{ margin:"16px 0" }}/>
              <div style={{ fontSize:8, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:10 }}>Booking History</div>
              {BOOKINGS.filter(b=>b.player===selected.name).map(b=>{
                const bs = BSTATUS[b.status as keyof typeof BSTATUS];
                return (
                  <div key={b.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:C.text }}>{b.date} · {b.time}</div>
                      <div style={{ fontSize:10, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.04em" }}>{b.table} · {b.duration}h</div>
                    </div>
                    <Pill label={bs.label} color={bs.color}/>
                  </div>
                );
              })}
              <button onClick={()=>setSelected(null)} style={{ marginTop:16,width:"100%",padding:"8px",
                background:"transparent",border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",
                fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.1em" }}>CLOSE</button>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
const NAV = [
  { id:"dashboard", label:"Dashboard" },
  { id:"bookings",  label:"Reservations" },
  { id:"players",   label:"Members" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const now = useNow();

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color:${C.muted}; font-style:italic; }
        select option { background:${C.surface}; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:${C.bg}} ::-webkit-scrollbar-thumb{background:${C.border}}
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width:220, flexShrink:0, background:C.surface,
        borderRight:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, bottom:0, left:0, zIndex:50,
      }}>
        {/* Logo */}
        <div style={{ padding:"28px 24px", borderBottom:`1px solid ${C.border}`, textAlign:"center" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 }}>
            <div style={{ height:1, flex:1, background:C.gold }}/>
            <span style={{ fontSize:18 }}>🎱</span>
            <div style={{ height:1, flex:1, background:C.gold }}/>
          </div>
          <div style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:13, color:C.navy, letterSpacing:"0.08em" }}>The Cue Room</div>
          <div style={{ fontSize:8, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.16em",
            textTransform:"uppercase", marginTop:4 }}>Members Club</div>
        </div>

        {/* Nav */}
        <nav style={{ padding:"24px 16px", flex:1 }}>
          <div style={{ fontSize:7, color:C.muted, fontFamily:"'Cinzel',serif",
            textTransform:"uppercase", letterSpacing:"0.16em", paddingLeft:8, marginBottom:12 }}>Navigation</div>
          {NAV.map(n=>{
            const active = page===n.id;
            return (
              <button key={n.id} onClick={()=>setPage(n.id)} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%",
                padding:"10px 14px", cursor:"pointer",
                background: active ? `${C.navy}0c` : "transparent",
                border: active ? `1px solid ${C.borderDk}` : "1px solid transparent",
                color: active ? C.navy : C.muted,
                fontFamily:"'Cinzel',serif", fontSize:11, letterSpacing:"0.1em",
                textTransform:"uppercase", textAlign:"left",
                marginBottom:4, transition:"all 0.15s",
              }}>
                {n.label}
                {active && <Ornament size={10} color={C.gold}/>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"20px 24px", borderTop:`1px solid ${C.border}`, textAlign:"center" }}>
          <div style={{ fontSize:8, color:C.muted, fontFamily:"'Cinzel',serif", letterSpacing:"0.1em", textTransform:"uppercase" }}>Signed in as</div>
          <div style={{ fontFamily:"'EB Garamond',serif", fontSize:13, color:C.text, marginTop:4 }}>Administrator</div>
        </div>
      </aside>

      {/* Decorative left border line */}
      <div style={{ position:"fixed", left:220, top:0, bottom:0, width:1, background:`linear-gradient(to bottom, ${C.gold}66, transparent, ${C.gold}66)`, zIndex:51 }}/>

      <main style={{ marginLeft:221, flex:1, padding:"36px 40px", minHeight:"100vh" }}>
        {page==="dashboard" && <DashboardPage now={now}/>}
        {page==="bookings"  && <BookingsPage/>}
        {page==="players"   && <PlayersPage/>}
      </main>
    </div>
  );
}
