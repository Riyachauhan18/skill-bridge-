import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar.jsx";
import Navbar from "../layout/Navbar.jsx";

export default function Dashboard() {
  return (
    <div className="min-h-screen h-full flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="py-6">
          <div className="sb-container px-4 space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
