import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiPlus,
  FiLock,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { clearAuth, getUser } from "../utils/auth";

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  function handleNavigate(path) {
    navigate(path);
    setMobileMenuOpen(false);
  }

  const navItems = [
    {
      label: "Dashboard",
      path: "/notes",
      icon: FiHome,
    },
    {
      label: "Create Note",
      path: "/create",
      icon: FiPlus,
    },
  ];

  const SidebarContent = () => (
    <>
      <div>
        <div className="px-4 sm:px-6 py-5 sm:py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <FiLock className="text-white text-lg" />
            </div>

            <div>
              <h1 className="text-[18px] font-semibold leading-none">SecureNotes</h1>
              <p className="text-xs text-white/55 mt-1">End-to-end encrypted</p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.path === "/notes"
                ? location.pathname.startsWith("/notes")
                : location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={[
                  "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition",
                  active
                    ? "bg-white/8 text-white shadow-inner"
                    : "text-white/75 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <Icon className="text-[17px]" />
                <span className="text-[15px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-white/70 hover:bg-white/5 hover:text-red-400 transition"
        >
          <FiLogOut className="text-[17px]" />
          <span className="text-[15px] font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#050506] text-white flex">
      <aside className="hidden md:flex w-[260px] bg-[#0b0c0f] border-r border-white/10 flex-col justify-between">
        <SidebarContent />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-[#0b0c0f] border-r border-white/10 flex flex-col justify-between">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="h-[72px] border-b border-white/10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
            >
              <FiMenu className="text-[18px]" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <FiLock className="text-[14px]" />
              <span className="hidden sm:inline">All notes are encrypted</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium leading-none">
                {user?.username || "User"}
              </div>
              <div className="text-xs text-white/45 mt-1 truncate max-w-[180px]">
                {user?.email || ""}
              </div>
            </div>

            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <FiUser className="text-white text-[18px]" />
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
