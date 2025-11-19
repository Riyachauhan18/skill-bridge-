import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../lib/api";

export default function Navbar() {
  const location = useLocation();
  const search = location.search || "";
  const [openMenu, setOpenMenu] = useState(null); // 'internship' | 'contribution' | 'me' | null
  const navRef = useRef(null);
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem('role') || ''; } catch { return ''; }
  });
  const [openNotif, setOpenNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    function onDocClick(e) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target)) { setOpenMenu(null); setOpenNotif(false); }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    let t = setInterval(() => {
      try {
        const r = localStorage.getItem('role') || '';
        setRole((prev) => prev === r ? prev : r);
      } catch {}
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

  // Load notifications and poll
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/api/notifications');
        if (!mounted) return;
        setNotifs(res.data || []);
      } catch {}
    };
    load();
    const t = setInterval(load, 15000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const unread = notifs.filter(n => !n.read_at).length;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm text-slate-900">
      <div className="mx-auto max-w-7xl px-4">
        <div ref={navRef} className="flex items-center justify-between gap-6 py-3 md:py-4 min-h-[72px] md:min-h-[88px]">
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src="/JK_Lakshmipat_University_Logo.jpg"
              alt="JK Lakshmipat University"
              className="h-12 md:h-16 w-auto object-contain"
            />
            <div className="text-xl md:text-3xl font-semibold leading-tight">
              JK Lakshmipat University
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button
                className="px-3 py-2 rounded-lg text-slate-900 hover:bg-slate-100 transition text-base"
                aria-haspopup="menu"
                aria-expanded={openMenu === "internship"}
                onClick={() => toggle("internship")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") setOpenMenu("internship");
                }}
              >
                Internship
              </button>
              {openMenu === "internship" && (
                <div
                  role="menu"
                  aria-label="Internship"
                  className="absolute left-0 mt-2 w-44 rounded-lg border bg-white shadow-md"
                >
                  <Link role="menuitem" tabIndex={0} to={`/dashboard/ps1${search}`} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">PS1</Link>
                  <Link role="menuitem" tabIndex={0} to={`/dashboard/ps2${search}`} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">PS2</Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                aria-haspopup="menu"
                aria-expanded={openMenu === "contribution"}
                onClick={() => toggle("contribution")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") setOpenMenu("contribution");
                }}
              >
                Contribution
              </button>
              {openMenu === "contribution" && (
                <div
                  role="menu"
                  aria-label="Contribution"
                  className="absolute left-0 mt-2 w-48 rounded-lg border bg-white shadow-md"
                >
                  <Link role="menuitem" tabIndex={0} to={`/dashboard/hackathons${search}`} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Hackathons</Link>
                  <Link role="menuitem" tabIndex={0} to={`/dashboard/research${search}`} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Research Work</Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                aria-haspopup="menu"
                aria-expanded={openMenu === "me"}
                onClick={() => toggle("me")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") setOpenMenu("me");
                }}
              >
                <span>Me</span>
                {role && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-slate-300 bg-slate-100 text-slate-900">
                    {role}
                  </span>
                )}
              </button>
              {openMenu === "me" && (
                <div
                  role="menu"
                  aria-label="Me"
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-md"
                >
                  <Link role="menuitem" tabIndex={0} to={`/dashboard/edit-info${search}`} className="block px-3 py-2 text-sm text-slate-900 hover:bg-slate-100">Edit Information</Link>
                  <Link role="menuitem" tabIndex={0} to="/logout" className="block px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">Logout</Link>
                </div>
              )}
            </div>
          </nav>

          <div className="md:hidden">
            <div className="h-8 w-8 rounded-md bg-slate-100 grid place-items-center text-slate-600 text-sm font-medium">≡</div>
          </div>

          {/* Notifications bell */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button className="px-3 py-2 rounded-lg text-slate-900 hover:bg-slate-100 transition relative text-base" aria-haspopup="menu" aria-expanded={openNotif}
                onClick={() => { setOpenNotif(v=>!v); setOpenMenu(null); }}>
                <span>Notifications</span>
                {!!unread && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-amber-300/60 bg-amber-100 text-amber-700">{unread}</span>
                )}
              </button>
              {openNotif && (
                <div role="menu" aria-label="Notifications" className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-md p-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="text-sm font-medium text-slate-900">Notifications</div>
                    <button className="sb-btn-ghost-light text-xs" onClick={async ()=>{ try { await api.put('/api/notifications/read-all'); const res = await api.get('/api/notifications'); setNotifs(res.data||[]); } catch {} }}>Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-auto divide-y">
                    {(notifs||[]).slice(0,8).map(n => (
                      <div key={n.id} className="px-2 py-2 text-sm text-slate-900">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium text-slate-900">{n.title}</div>
                            {n.body && <div className="text-slate-600 text-xs mt-0.5">{n.body}</div>}
                            <div className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                          </div>
                          {!n.read_at && (
                            <button className="sb-btn-ghost-light text-xs" onClick={async ()=>{ try { await api.put(`/api/notifications/${n.id}/read`); const res = await api.get('/api/notifications'); setNotifs(res.data||[]); } catch {} }}>Read</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!notifs || notifs.length===0) && (
                      <div className="px-2 py-3 text-sm text-slate-500">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
