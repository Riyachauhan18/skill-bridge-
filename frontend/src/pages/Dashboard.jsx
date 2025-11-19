import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "../layout/Sidebar.jsx";
import Navbar from "../layout/Navbar.jsx";
import api from "../lib/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMessagesRoute = location.pathname.startsWith("/dashboard/messages");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/me");
        if (!mounted) return;
        const me = res.data || {};
        try {
          localStorage.setItem("me", JSON.stringify(me));
          if (me?.role) localStorage.setItem("role", me.role);
          if (me?.roll_number) localStorage.setItem("rollno", me.roll_number);
        } catch {}
      } catch (err) {
        navigate("/login", { replace: true });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);
  return (
    <div className="min-h-screen h-full flex bg-gradient-to-b from-[#FFF9E8] via-[#F6F8FB] to-[#F3F6FC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className={isMessagesRoute ? "flex-1 px-0 py-0" : "py-8 px-4 md:px-8"}>
          {isMessagesRoute ? (
            <Outlet />
          ) : (
            <div className="mx-auto max-w-5xl lg:max-w-6xl space-y-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
