import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Navbar component
 *
 * - Reads current user from localStorage (key: "user") safely.
 * - Shows Dashboard / Logout when user exists.
 * - NO Register button.
 * - Mobile menu + smooth scroll support.
 */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const parseUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    setUser(parseUser());

    const onStorage = (e) => {
      if (e.key === "user") setUser(parseUser());
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    setUser(parseUser());
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/#" + id);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const links = [
    { name: "Home", to: "/", type: "link" },
    { name: "Features", id: "features", type: "scroll" },
    { name: "How It Works", id: "how-it-works", type: "scroll" },
    { name: "About", to: "/about", type: "link" },
  ];

  const navItem =
    "px-3 py-2 rounded-md font-medium transition-all duration-200 relative";
  const navBase = "text-gray-700 hover:text-gray-900";

  const menuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { when: "beforeChildren", staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, #2563eb, #06b6d4, #7c3aed)",
              animation: "bgShift 6s ease infinite",
            }}
          >
            <span className="text-white font-extrabold text-lg">FS</span>
          </div>

          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-semibold text-gray-900">
              FinSafe
            </span>
            <span className="text-xs text-gray-500">
              KYC & AML Automation
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <motion.div key={l.name} whileHover={{ y: -2 }}>
              {l.type === "link" ? (
                <NavLink
                  to={l.to}
                  end
                  className={({ isActive }) =>
                    `${navItem} ${navBase} ${
                      isActive ? "text-gray-900" : ""
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {l.name}
                </NavLink>
              ) : (
                <button
                  onClick={() => {
                    scrollToSection(l.id);
                    setOpen(false);
                  }}
                  className={`${navItem} ${navBase}`}
                >
                  {l.name}
                </button>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <>
              <NavLink
                to="/user/dashboard"
                className="px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </NavLink>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700"
              >
                Logout
              </button>

              <span className="text-sm text-gray-600">
                Hi, {user.name || user.phone || "User"}
              </span>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md border bg-white shadow-sm"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            className="md:hidden px-4 pb-4"
          >
            <motion.div className="mt-2 bg-white border rounded-md shadow-sm p-2">
              {links.map((l) => (
                <motion.div key={l.name} variants={itemVariants}>
                  {l.type === "link" ? (
                    <NavLink
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      {l.name}
                    </NavLink>
                  ) : (
                    <button
                      onClick={() => {
                        scrollToSection(l.id);
                        setOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      {l.name}
                    </button>
                  )}
                </motion.div>
              ))}

              {user && (
                <div className="border-t mt-2 pt-2">
                  <NavLink
                    to="/user/dashboard"
                    onClick={() => setOpen(false)}
                    className="block text-center px-4 py-3 text-sm hover:bg-gray-50 rounded-md"
                  >
                    Dashboard
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/");
                    }}
                    className="block w-full px-4 py-3 text-sm bg-gray-100 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </header>
  );
}
