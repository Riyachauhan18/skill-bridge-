import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const search = location.search || "";
  const [openMenu, setOpenMenu] = useState(null); // 'internship' | 'contribution' | 'me' | null
  const navRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target)) setOpenMenu(null);
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

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-7xl px-4">
        <div ref={navRef} className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/JK_Lakshmipat_University_Logo.jpg"
              alt="JK Lakshmipat University"
              className="h-8 w-auto object-contain"
            />
            <div className="text-sm md:text-base font-semibold text-slate-900">
              JK Lakshmipat University
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button
                className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition"
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
                Me
              </button>
              {openMenu === "me" && (
                <div
                  role="menu"
                  aria-label="Me"
                  className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-md"
                >
                  <Link role="menuitem" tabIndex={0} to={`/dashboard/edit-info${search}`} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit Information</Link>
                  <Link role="menuitem" tabIndex={0} to="/logout" className="block px-3 py-2 text-sm text-red-600 hover:bg-red-50">Logout</Link>
                </div>
              )}
            </div>
          </nav>

          <div className="md:hidden">
            <div className="h-8 w-8 rounded-md bg-slate-100 grid place-items-center text-slate-600 text-sm font-medium">≡</div>
          </div>
        </div>
      </div>
    </header>
  );
}
