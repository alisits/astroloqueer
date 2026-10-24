import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function MenuButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path: string, anchor?: string) => {
    navigate(path);
    setTimeout(() => {
      if (anchor) {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* hamburger / close icon */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        className="p-2 rounded-lg hover:bg-white/10 focus:outline-none"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg bg-black/70 backdrop-blur-md
                     py-3 space-y-2 z-50 border border-white/10"
        >
          <button
            onClick={() => go("/")}
            className="block w-full text-left px-4 py-1 text-gray-100 hover:text-cosmic-pink"
          >
            Home
          </button>
          <button
            onClick={() => go("/", "daily-form")}
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
    </div>
  );
}
