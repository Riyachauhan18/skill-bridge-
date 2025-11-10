import { User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
      <div className="font-semibold text-gray-800">Welcome, Student</div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <User className="h-5 w-5" />
        <span>Student</span>
      </div>
    </header>
  );
}
