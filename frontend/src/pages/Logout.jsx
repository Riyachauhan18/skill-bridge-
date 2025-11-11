import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("rollno");
    } catch {}
    // Small delay to show feedback if needed in future
    const t = setTimeout(() => navigate("/login", { replace: true }), 50);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="grid place-items-center min-h-[60vh]">
      <div className="sb-card sb-card-pad text-center">
        <div className="text-lg font-semibold text-slate-900">Signing you out…</div>
        <p className="text-slate-600 mt-2">Redirecting to login</p>
      </div>
    </div>
  );
}
