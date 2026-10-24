import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // helpers ---------------------------------------------------
  const goto = (path: string, anchor?: string) => {
    navigate(path);
    setTimeout(() => {
      if (anchor) {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 60);
    setOpen(false);
  };

  // -----------------------------------------------------------
  return (
    /*  no bg / shadow; sits in normal flow under LogoHeader  */
    <nav className="relative px-4 pt-1">
      {/* hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-white/10 focus:outline-none"
        aria-label="Toggle navigation"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* dropdown panel */}
      {open && (
        <div
          className="absolute left-0 mt-2 w-48 rounded-lg bg-black/70 backdrop-blur-md
                     py-3 space-y-2 z-50 border border-white/10"
        >
          <button
            onClick={() => goto("/")}
            className="block w-full text-left px-4 py-1 text-gray-100 hover:text-cosmic-pink"
          >
            Home
          </button>
          <button
            onClick={() => goto("/", "daily-form")}
            className="block w-full text-left px-4 py-1 text-gray-100 hover:text-cosmic-pink"
          >
            Daily Horoscope
          </button>
          <Link
            to="/natal-chart"
            onClick={() => setOpen(false)}
            className="block px-4 py-1 text-gray-100 hover:text-cosmic-pink"
          >
            Natal Chart
          </Link>
        </div>
      )}
    </nav>
  );
}
