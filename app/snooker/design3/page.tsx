"use client";
import { useState, useEffect, ReactNode, CSSProperties, MouseEventHandler } from "react";

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const TABLES = [
  { id:1, name:"T-01", type:"CHAMPIONSHIP", rate:15, status:"occupied",    player:"J. ROBERTSON", startTime: Date.now()-55*60000 },
  { id:2, name:"T-02", type:"STANDARD",     rate:12, status:"available",   player:null,           startTime:null },
  { id:3, name:"T-03", type:"STANDARD",     rate:12, status:"reserved",    player:"M. THOMPSON",  startTime: Date.now()+25*60000 },
  { id:4, name:"T-04", type:"CHAMPIONSHIP", rate:15, status:"occupied",    player:"S. KHAN",      startTime: Date.now()-22*60000 },
  { id:5, name:"T-05", type:"STANDARD",     rate:12, status:"available",   player:null,           startTime:null },
  { id:6, name:"T-06", type:"STANDARD",     rate:12, status:"maintenance", player:null,           startTime:null },
];

const BOOKINGS = [
  { id:"BK001", player:"JAMES ROBERTSON", table:"T-01", date:"2026-03-05", time:"10:00", duration:2, status:"confirmed",   phone:"+44 7700 900123" },
  { id:"BK002", player:"SARAH KHAN",      table:"T-04", date:"2026-03-05", time:"11:30", duration:1, status:"in_progress", phone:"+44 7700 900456" },
  { id:"BK003", player:"MIKE THOMPSON",   table:"T-03", date:"2026-03-05", time:"14:00", duration:2, status:"confirmed",   phone:"+44 7700 900789" },
  { id:"BK004", player:"LENA FISCHER",    table:"T-02", date:"2026-03-05", time:"16:00", duration:3, status:"confirmed",   phone:"+44 7700 900321" },
  { id:"BK005", player:"DAVID OSEI",      table:"T-05", date:"2026-03-06", time:"09:00", duration:1, status:"pending",     phone:"+44 7700 900654" },
  { id:"BK006", player:"CLAIRE DUBOIS",   table:"T-01", date:"2026-03-06", time:"13:00", duration:2, status:"confirmed",   phone:"+44 7700 900987" },
  { id:"BK007", player:"TOM BRADLEY",     table:"T-06", date:"2026-03-04", time:"18:00", duration:2, status:"completed",   phone:"+44 7700 900111" },
  { id:"BK008", player:"JAMES ROBERTSON", table:"T-02", date:"2026-03-04", time:"10:00", duration:1, status:"cancelled",   phone:"+44 7700 900123" },
];

const PLAYERS = [
  { id:"P001", name:"JAMES ROBERTSON", email:"james.r@email.com",  phone:"+44 7700 900123", tier:"GOLD",   visits:42, spent:890,  joined:"2024-01-15", lastSeen:"2026-03-05" },
  { id:"P002", name:"SARAH KHAN",      email:"sarah.k@email.com",  phone:"+44 7700 900456", tier:"SILVER", visits:28, spent:512,  joined:"2024-03-22", lastSeen:"2026-03-05" },
  { id:"P003", name:"MIKE THOMPSON",   email:"mike.t@email.com",   phone:"+44 7700 900789", tier:"GOLD",   visits:67, spent:1340, joined:"2023-11-08", lastSeen:"2026-03-04" },
  { id:"P004", name:"LENA FISCHER",    email:"lena.f@email.com",   phone:"+44 7700 900321", tier:"STD",    visits:9,  spent:145,  joined:"2025-08-01", lastSeen:"2026-02-28" },
  { id:"P005", name:"DAVID OSEI",      email:"david.o@email.com",  phone:"+44 7700 900654", tier:"SILVER", visits:19, spent:378,  joined:"2025-01-10", lastSeen:"2026-03-03" },
  { id:"P006", name:"CLAIRE DUBOIS",   email:"claire.d@email.com", phone:"+44 7700 900987", tier:"STD",    visits:5,  spent:87,   joined:"2025-12-01", lastSeen:"2026-03-01" },
  { id:"P007", name:"TOM BRADLEY",     email:"tom.b@email.com",    phone:"+44 7700 900111", tier:"GOLD",   visits:55, spent:1105, joined:"2023-06-14", lastSeen:"2026-03-04" },
];

/* ─── HELPERS ──────────────────────────────────────────────── */
function useNow() {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(Date.now());
    const t = setInterval(() => setN(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return n;
}
const pad = (n: number) => String(n).padStart(2,"0");
function elapsedStr(ms: number | null | undefined) {
  if (!ms||ms<0) return "--:--";
  const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60);
  return h>0?`${h}H ${pad(m)}M`:`${pad(m)}:${pad(s%60)}`;
}

/* ─── TOKENS ───────────────────────────────────────────────── */
const C = {
  bg:      "#0a0a0a",
  surface: "#111111",
  border:  "#222222",
  text:    "#f0f0f0",
  muted:   "#666666",
  yellow:  "#f5e642",
  white:   "#ffffff",
};

const STATUS_CFG = {
  available:   { label:"FREE",    color:C.yellow,          short:"FREE"  },
  occupied:    { label:"IN PLAY", color:C.white,           short:"PLAY"  },
  reserved:    { label:"HOLD",    color:"#888888",         short:"HOLD"  },
  maintenance: { label:"DOWN",    color:"#444444",         short:"DOWN"  },
};

const BSTATUS = {
  confirmed:   { label:"CONF",   color:C.yellow },
  in_progress: { label:"LIVE",   color:C.white  },
  pending:     { label:"PEND",   color:"#888"   },
  completed:   { label:"DONE",   color:"#555"   },
  cancelled:   { label:"VOID",   color:"#333"   },
};

/* ─── COMPONENTS ───────────────────────────────────────────── */
function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display:"inline-block", padding:"1px 8px",
      border:`2px solid ${color}`,
      fontFamily:"'Share Tech Mono',monospace", fontSize:10,
      color, letterSpacing:"0.12em",
    }}>{label}</span>
  );
}

function Block({ children, style={} }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ border:`2px solid ${C.border}`, background:C.surface, ...style }}>
      {children}
    </div>
  );
}

function BlockHeader({ children }: { children: ReactNode }) {
  return (
    <div style={{
      borderBottom:`2px solid ${C.border}`, padding:"8px 14px",
      fontFamily:"'Share Tech Mono',monospace", fontSize:10,
      color:C.muted, letterSpacing:"0.14em",
      background:`repeating-linear-gradient(90deg, transparent, transparent 3px, ${C.border}22 3px, ${C.border}22 4px)`,
    }}>{children}</div>
  );
}

type BtnVariant = "primary" | "ghost" | "danger";
function Btn({ children, variant="primary", onClick, style={} }: { children: ReactNode; variant?: BtnVariant; onClick?: MouseEventHandler<HTMLButtonElement>; style?: CSSProperties }) {
  const s: Record<BtnVariant, CSSProperties> = {
    primary: { background:C.yellow, color:C.bg,     border:`2px solid ${C.yellow}` },
    ghost:   { background:"transparent", color:C.muted, border:`2px solid ${C.border}` },
    danger:  { background:"transparent", color:"#555",  border:`2px solid #333` },
  };
  return (
    <button onClick={onClick} style={{
      padding:"6px 14px", cursor:"pointer",
      fontFamily:"'Share Tech Mono',monospace", fontSize:10,
      letterSpacing:"0.1em", fontWeight:700, transition:"all 0.1s",
      ...s[variant], ...style,
    }}
    onMouseEnter={e=>{ e.currentTarget.style.opacity="0.7" }}
    onMouseLeave={e=>{ e.currentTarget.style.opacity="1" }}
    >{children}</button>
  );
}

/* ─── TABLE CARD ───────────────────────────────────────────── */
function TableCard({ t, now }: { t: typeof TABLES[0]; now: number }) {
  const cfg = STATUS_CFG[t.status as keyof typeof STATUS_CFG];
  const ms = t.status==="occupied"&&t.startTime ? now-t.startTime : null;
  const isActive = t.status==="occupied";

  return (
    <div style={{
      border:`2px solid ${isActive ? C.yellow : C.border}`,
      background: isActive ? `${C.yellow}08` : C.surface,
      padding:0, position:"relative",
    }}>
      {/* Status bar */}
      <div style={{
        background: isActive ? C.yellow : C.border,
        padding:"4px 12px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11,
          color: isActive ? C.bg : C.muted, fontWeight:700, letterSpacing:"0.1em" }}>
          {t.name}
        </span>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10,
          color: isActive ? C.bg : C.muted, letterSpacing:"0.1em" }}>
          {cfg.short}
        </span>
      </div>

      <div style={{ padding:"14px" }}>
        {/* Felt diagram — minimal grid */}
        <div style={{
          border:`1px solid ${isActive ? C.yellow+"44" : C.border}`,
          height:44, marginBottom:12, position:"relative", overflow:"hidden",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <div style={{ position:"absolute", inset:3, border:`1px solid ${C.border}` }}/>
          {[0,1,2,3,4,5].map(i=>{
            const pos = [{top:2,left:2},{top:2,left:"calc(50%-3px)"},{top:2,right:2},{bottom:2,left:2},{bottom:2,left:"calc(50%-3px)"},{bottom:2,right:2}];
            return <div key={i} style={{ position:"absolute", width:6, height:6,
              background:C.bg, border:`1px solid ${isActive?C.yellow+"66":C.border}`, ...pos[i] }}/>;
          })}
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9,
            color:isActive?C.yellow:C.muted, letterSpacing:"0.12em" }}>{t.type}</span>
          {isActive && <div style={{
            position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
            width:8,height:8,background:C.yellow, animation:"blink 1s steps(1) infinite",
          }}/>}
        </div>

        {t.player && (
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11,
            color:C.text, marginBottom:10, letterSpacing:"0.05em" }}>
            &gt; {t.player}
          </div>
        )}

        {ms !== null && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div style={{ border:`1px solid ${C.yellow}44`, padding:"6px 8px" }}>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:16, color:C.yellow, fontWeight:700 }}>{elapsedStr(ms)}</div>
              <div style={{ fontSize:8, color:C.muted, fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.1em", marginTop:2 }}>ELAPSED</div>
            </div>
            <div style={{ border:`1px solid ${C.border}`, padding:"6px 8px" }}>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:16, color:C.text, fontWeight:700 }}>£{((ms/3600000)*t.rate).toFixed(2)}</div>
              <div style={{ fontSize:8, color:C.muted, fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.1em", marginTop:2 }}>RUNNING</div>
            </div>
          </div>
        )}

        {t.status==="available" && (
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.muted }}>
            £{t.rate}/HR · READY
          </div>
        )}
      </div>
    </div>
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
      {/* Big title */}
      <div style={{ borderBottom:`2px solid ${C.yellow}`, paddingBottom:12, marginBottom:24,
        display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted,
            letterSpacing:"0.2em", marginBottom:4 }}>// SYSTEM STATUS</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:C.white,
            margin:0, letterSpacing:"0.05em", lineHeight:0.9 }}>OPERATIONS</h1>
        </div>
        <div style={{ textAlign:"right", fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:C.muted }}>
          <div>{new Date(now).toLocaleTimeString("en-GB")}</div>
          <div style={{ fontSize:9, marginTop:2 }}>THU 05-MAR-2026</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:2, marginBottom:24 }}>
        {[
          { v:occupied.length,                       l:"ACTIVE",    hi:true },
          { v:`£${revenue.toFixed(0)}`,              l:"LIVE REV",  hi:false },
          { v:BOOKINGS.filter(b=>b.date==="2026-03-05"&&b.status!=="cancelled").length, l:"BOOKED",  hi:false },
          { v:PLAYERS.length,                        l:"PLAYERS",   hi:false },
        ].map(({v,l,hi})=>(
          <div key={l} style={{ border:`2px solid ${hi?C.yellow:C.border}`, padding:"16px 20px",
            background:hi?`${C.yellow}0a`:C.surface }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, color:hi?C.yellow:C.text,
              lineHeight:1, letterSpacing:"0.05em" }}>{v}</div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted,
              letterSpacing:"0.14em", marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Status legend */}
      <div style={{ display:"flex", gap:0, marginBottom:16 }}>
        {Object.entries(STATUS_CFG).map(([k,v])=>(
          <div key={k} style={{ border:`1px solid ${C.border}`, borderRight:"none", padding:"4px 14px",
            display:"flex",alignItems:"center",gap:6, }}>
            {k==="occupied"&&<div style={{ width:8,height:8,background:C.yellow,animation:"blink 1s steps(1) infinite" }}/>}
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted, letterSpacing:"0.08em" }}>
              {TABLES.filter(t=>t.status===k).length} {v.short}
            </span>
          </div>
        ))}
        <div style={{ border:`1px solid ${C.border}`, flex:1 }}/>
      </div>

      {/* Table grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, marginBottom:28 }}>
        {TABLES.map(t=><TableCard key={t.id} t={t} now={now}/>)}
      </div>

      {/* Today schedule */}
      <Block>
        <BlockHeader>// TODAY SCHEDULE — 05-MAR-2026</BlockHeader>
        {BOOKINGS.filter(b=>b.date==="2026-03-05").map((b,i,arr)=>{
          const bs = BSTATUS[b.status as keyof typeof BSTATUS];
          return (
            <div key={b.id} style={{
              display:"grid", gridTemplateColumns:"60px 1fr 80px 60px 60px",
              alignItems:"center", padding:"10px 14px", gap:16,
              borderBottom: i<arr.length-1?`1px solid ${C.border}`:"none",
            }}>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:13, color:C.yellow }}>{b.time}</span>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:C.text, letterSpacing:"0.04em" }}>{b.player}</span>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.muted }}>{b.table}</span>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.muted }}>{b.duration}H</span>
              <Tag label={bs.label} color={bs.color}/>
            </div>
          );
        })}
      </Block>
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

  const visible = BOOKINGS.filter(b=>{
    const ms = filter==="all"||b.status===filter;
    const ss = b.player.toLowerCase().includes(search.toLowerCase())||b.table.toLowerCase().includes(search.toLowerCase());
    return ms&&ss;
  });

  return (
    <div>
      <div style={{ borderBottom:`2px solid ${C.yellow}`, paddingBottom:12, marginBottom:24,
        display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted, letterSpacing:"0.2em", marginBottom:4 }}>// BOOKING SYSTEM</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:C.white, margin:0, letterSpacing:"0.05em", lineHeight:0.9 }}>BOOKINGS</h1>
        </div>
        <Btn onClick={()=>setShowModal(true)}>+ NEW BOOKING</Btn>
      </div>

      {/* Filter row */}
      <div style={{ display:"flex", gap:2, marginBottom:2, flexWrap:"wrap" }}>
        {["all","confirmed","in_progress","pending","completed","cancelled"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:"5px 12px", cursor:"pointer",
            fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:"0.1em",
            border:`2px solid ${filter===f?C.yellow:C.border}`,
            background: filter===f?C.yellow:C.surface,
            color: filter===f?C.bg:C.muted,
            fontWeight: filter===f?700:400,
            transition:"all 0.1s",
          }}>
            {f.replace("_"," ").toUpperCase()} ({f==="all"?BOOKINGS.length:BOOKINGS.filter(b=>b.status===f).length})
          </button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="SEARCH..."
          style={{ marginLeft:"auto", padding:"5px 12px", background:C.surface, border:`2px solid ${C.border}`,
            color:C.text, fontFamily:"'Share Tech Mono',monospace", fontSize:10, outline:"none", width:180, letterSpacing:"0.05em" }}/>
      </div>

      {/* Table */}
      <Block>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${C.yellow}` }}>
              {["#ID","PLAYER","TABLE","DATE","TIME","DUR","STATUS",""].map(h=>(
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontFamily:"'Share Tech Mono',monospace",
                  fontSize:9, color:C.yellow, letterSpacing:"0.14em", fontWeight:700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((b,i)=>{
              const bs = BSTATUS[b.status as keyof typeof BSTATUS];
              return (
                <tr key={b.id} style={{ borderBottom:i<visible.length-1?`1px solid ${C.border}`:"none",
                  transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${C.yellow}08`}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:C.yellow }}>{b.id}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:C.text, letterSpacing:"0.04em" }}>{b.player}</div>
                    <div style={{ fontSize:9, color:C.muted, marginTop:2, fontFamily:"'Share Tech Mono',monospace" }}>{b.phone}</div>
                  </td>
                  <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:C.text }}>{b.table}</td>
                  <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.muted }}>{b.date}</td>
                  <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:C.text }}>{b.time}</td>
                  <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.muted }}>{b.duration}H</td>
                  <td style={{ padding:"12px 14px" }}><Tag label={bs.label} color={bs.color}/></td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:4 }}>
                      <Btn variant="ghost" style={{ padding:"3px 8px", fontSize:9 }}>EDIT</Btn>
                      {b.status!=="cancelled"&&b.status!=="completed"&&
                        <Btn variant="danger" style={{ padding:"3px 8px", fontSize:9 }}>VOID</Btn>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length===0&&<div style={{ padding:40, textAlign:"center", fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:C.muted }}>// NO RECORDS FOUND</div>}
      </Block>

      {/* Modal */}
      {showModal&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }} onClick={()=>setShowModal(false)}>
          <div style={{ border:`2px solid ${C.yellow}`, background:C.surface, padding:32, width:460, maxWidth:"90vw" }} onClick={e=>e.stopPropagation()}>
            <div style={{ borderBottom:`2px solid ${C.border}`, paddingBottom:12, marginBottom:24,
              display:"flex", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted, letterSpacing:"0.2em", marginBottom:2 }}>// INPUT FORM</div>
                <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:C.white, margin:0 }}>NEW BOOKING</h2>
              </div>
              <button onClick={()=>setShowModal(false)} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",
                fontFamily:"'Share Tech Mono',monospace",fontSize:16 }}>[X]</button>
            </div>
            {[{l:"PLAYER NAME",p:"FULL NAME"},{l:"TELEPHONE",p:"+44 7700…"},{l:"DATE",t:"date"},{l:"TIME",t:"time"}].map(f=>(
              <div key={f.l} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontFamily:"'Share Tech Mono',monospace", fontSize:8,
                  color:C.muted, letterSpacing:"0.16em", marginBottom:4 }}>{f.l} :</label>
                <input type={f.t||"text"} placeholder={f.p||""} style={{
                  width:"100%", padding:"9px 12px", background:C.bg, border:`2px solid ${C.border}`,
                  fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:C.text, outline:"none",
                  boxSizing:"border-box", letterSpacing:"0.05em", colorScheme:"dark",
                }}
                onFocus={e=>e.target.style.borderColor=C.yellow}
                onBlur={e=>e.target.style.borderColor=C.border}
                />
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
              {[{l:"TABLE"},{l:"DURATION"}].map(f=>(
                <div key={f.l}>
                  <label style={{ display:"block", fontFamily:"'Share Tech Mono',monospace", fontSize:8,
                    color:C.muted, letterSpacing:"0.16em", marginBottom:4 }}>{f.l} :</label>
                  <select style={{ width:"100%", padding:"9px 12px", background:C.bg, border:`2px solid ${C.border}`,
                    fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:C.text, outline:"none" }}>
                    {f.l==="TABLE"
                      ? TABLES.filter(t=>t.status==="available").map(t=><option key={t.id}>{t.name}</option>)
                      : [1,2,3,4].map(h=><option key={h}>{h}H</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={()=>setShowModal(false)} style={{ flex:1 }}>CONFIRM</Btn>
              <Btn variant="ghost" onClick={()=>setShowModal(false)} style={{ flex:1 }}>ABORT</Btn>
            </div>
          </div>
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

  const TIER_COLORS = { GOLD:"#c9a84c", SILVER:"#888", STD:C.muted };

  const visible = PLAYERS.filter(p=>{
    const mt = tierFilter==="all"||p.tier===tierFilter;
    const ms = p.name.toLowerCase().includes(search.toLowerCase())||p.id.toLowerCase().includes(search.toLowerCase());
    return mt&&ms;
  });

  return (
    <div>
      <div style={{ borderBottom:`2px solid ${C.yellow}`, paddingBottom:12, marginBottom:24,
        display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted, letterSpacing:"0.2em", marginBottom:4 }}>// PLAYER DATABASE</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:C.white, margin:0, letterSpacing:"0.05em", lineHeight:0.9 }}>PLAYERS</h1>
        </div>
        <Btn>+ ADD PLAYER</Btn>
      </div>

      {/* Tier stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, marginBottom:24 }}>
        {["GOLD","SILVER","STD"].map(tier=>(
          <div key={tier} style={{ border:`2px solid ${tier==="GOLD"?C.yellow:C.border}`,
            padding:"14px 18px", background:C.surface,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:TIER_COLORS[tier as keyof typeof TIER_COLORS], lineHeight:1 }}>
                {PLAYERS.filter(p=>p.tier===tier).length}
              </div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted, letterSpacing:"0.14em", marginTop:2 }}>
                TIER/{tier}
              </div>
            </div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:32, color:`${TIER_COLORS[tier as keyof typeof TIER_COLORS]}33` }}>
              {tier==="GOLD"?"◆":tier==="SILVER"?"◇":"○"}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:2, marginBottom:2 }}>
        {["all","GOLD","SILVER","STD"].map(t=>(
          <button key={t} onClick={()=>setTierFilter(t)} style={{
            padding:"5px 12px", cursor:"pointer",
            fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:"0.1em",
            border:`2px solid ${tierFilter===t?C.yellow:C.border}`,
            background:tierFilter===t?C.yellow:C.surface,
            color:tierFilter===t?C.bg:C.muted, fontWeight:tierFilter===t?700:400,
          }}>{t}</button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="SEARCH..."
          style={{ marginLeft:"auto", padding:"5px 12px", background:C.surface, border:`2px solid ${C.border}`,
            color:C.text, fontFamily:"'Share Tech Mono',monospace", fontSize:10, outline:"none", width:200, letterSpacing:"0.05em" }}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 320px":"1fr", gap:2 }}>
        <Block>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${C.yellow}` }}>
                {["ID","PLAYER","TIER","VISITS","SPENT","LAST SEEN",""].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontFamily:"'Share Tech Mono',monospace",
                    fontSize:9, color:C.yellow, letterSpacing:"0.14em", fontWeight:700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p,i)=>{
                const isSel = selected?.id===p.id;
                const tc = TIER_COLORS[p.tier as keyof typeof TIER_COLORS];
                return (
                  <tr key={p.id} onClick={()=>setSelected(isSel?null:p)}
                    style={{ borderBottom:i<visible.length-1?`1px solid ${C.border}`:"none",
                      cursor:"pointer", background:isSel?`${C.yellow}0d`:"transparent", transition:"background 0.1s" }}
                    onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background=`${C.yellow}08`}}
                    onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background=isSel?`${C.yellow}0d`:"transparent"}}>
                    <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.muted }}>{p.id}</td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:C.text, letterSpacing:"0.04em" }}>{p.name}</div>
                      <div style={{ fontSize:9, color:C.muted, fontFamily:"'Share Tech Mono',monospace", marginTop:2 }}>{p.email}</div>
                    </td>
                    <td style={{ padding:"12px 14px" }}><Tag label={p.tier} color={tc}/></td>
                    <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:C.text }}>{p.visits}</td>
                    <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:C.yellow }}>£{p.spent}</td>
                    <td style={{ padding:"12px 14px", fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.muted }}>{p.lastSeen}</td>
                    <td style={{ padding:"12px 14px" }}><Btn variant="ghost" style={{ padding:"3px 8px",fontSize:9 }}>VIEW</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Block>

        {selected&&(
          <div style={{ border:`2px solid ${C.yellow}`, background:C.surface, animation:"slideIn 0.15s ease" }}>
            <div style={{ background:C.yellow, padding:"8px 14px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.bg, fontWeight:700, letterSpacing:"0.1em" }}>
                PLAYER RECORD
              </span>
              <button onClick={()=>setSelected(null)} style={{ background:"none",border:"none",color:C.bg,cursor:"pointer",
                fontFamily:"'Share Tech Mono',monospace",fontSize:12,fontWeight:700 }}>[X]</button>
            </div>
            <div style={{ padding:"20px" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:C.white, letterSpacing:"0.05em", marginBottom:4 }}>
                {selected.name}
              </div>
              <Tag label={selected.tier} color={TIER_COLORS[selected.tier as keyof typeof TIER_COLORS]}/>

              <div style={{ borderTop:`1px solid ${C.border}`, marginTop:16, paddingTop:16,
                display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, marginBottom:16 }}>
                {[{l:"VISITS",v:selected.visits},{l:"SPENT",v:`£${selected.spent}`},{l:"SINCE",v:selected.joined},{l:"LAST",v:selected.lastSeen}].map(({l,v})=>(
                  <div key={l} style={{ border:`1px solid ${C.border}`, padding:"8px 10px" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:C.text }}>{v}</div>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.muted, letterSpacing:"0.14em" }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted, marginBottom:4 }}>{selected.email}</div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.muted }}>{selected.phone}</div>

              <div style={{ borderTop:`1px solid ${C.border}`, marginTop:16, paddingTop:14 }}>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.muted,
                  letterSpacing:"0.16em", marginBottom:10 }}>// BOOKING HISTORY</div>
                {BOOKINGS.filter(b=>b.player===selected.name).map(b=>{
                  const bs = BSTATUS[b.status as keyof typeof BSTATUS];
                  return (
                    <div key={b.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                      padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                      <div>
                        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.text }}>{b.date} {b.time}</div>
                        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.muted, marginTop:1 }}>{b.table} · {b.duration}H</div>
                      </div>
                      <Tag label={bs.label} color={bs.color}/>
                    </div>
                  );
                })}
              </div>
            </div>
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
  { id:"dashboard", label:"OPERATIONS" },
  { id:"bookings",  label:"BOOKINGS"   },
  { id:"players",   label:"PLAYERS"    },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const now = useNow();

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; }
        input::placeholder { color:${C.muted}; }
        select option { background:${C.surface}; color:${C.text}; }
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes slideIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:${C.bg}} ::-webkit-scrollbar-thumb{background:${C.border}}
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width:200, flexShrink:0, background:C.surface,
        borderRight:`2px solid ${C.border}`,
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, bottom:0, left:0, zIndex:50,
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px", borderBottom:`2px solid ${C.yellow}` }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.muted,
            letterSpacing:"0.2em", marginBottom:6 }}>// SYS v2.1.0</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:C.white,
            letterSpacing:"0.08em", lineHeight:1 }}>THE CUE</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:C.yellow,
            letterSpacing:"0.08em", lineHeight:1 }}>ROOM</div>
        </div>

        {/* Live indicator */}
        <div style={{ padding:"8px 16px", borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:6,height:6,background:C.yellow,animation:"blink 1s steps(1) infinite" }}/>
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.yellow, letterSpacing:"0.12em" }}>
            {TABLES.filter(t=>t.status==="occupied").length} TABLES LIVE
          </span>
        </div>

        {/* Nav */}
        <nav style={{ padding:"16px 0", flex:1 }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.muted,
            letterSpacing:"0.2em", paddingLeft:16, marginBottom:8 }}>// NAVIGATE</div>
          {NAV.map((n,i)=>{
            const active = page===n.id;
            return (
              <button key={n.id} onClick={()=>setPage(n.id)} style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"12px 16px", cursor:"pointer", textAlign:"left",
                background: active ? C.yellow : "transparent",
                border:"none", borderLeft: active ? `4px solid ${C.yellow}` : "4px solid transparent",
                color: active ? C.bg : C.muted,
                fontFamily:"'Share Tech Mono',monospace", fontSize:11,
                letterSpacing:"0.1em", fontWeight: active?700:400,
                transition:"all 0.1s",
              }}>
                <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9,
                  opacity:0.5 }}>{String(i+1).padStart(2,"0")}</span>
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.muted, letterSpacing:"0.1em" }}>
            ADMIN / LOGGED IN
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.text,
            marginTop:2, letterSpacing:"0.05em" }}>admin@cueroom.co</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:200, flex:1, padding:"28px 32px", minHeight:"100vh" }}>
        {page==="dashboard" && <DashboardPage now={now}/>}
        {page==="bookings"  && <BookingsPage/>}
        {page==="players"   && <PlayersPage/>}
      </main>
    </div>
  );
}
