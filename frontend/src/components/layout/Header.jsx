import { Bell, Search } from "lucide-react";

function Header({ user }) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Welcome back, {user?.name || "User"}!
        </h2>
        <p className="text-sm text-slate-500">
          Here's what's happening with your complaints today.
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 md:flex">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-36 bg-transparent text-sm outline-none"
          />
        </div>

        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={21} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}

export default Header;
