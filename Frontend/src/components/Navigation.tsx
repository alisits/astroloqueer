import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAstrology } from "@/context/AstrologyContext";
import { toast } from "sonner";

interface NavigationProps {
  position?: 'header' | 'navbar';
}

export default function Navigation({ position = 'header' }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { userInfo, bigThree } = useAstrology();

  const hasUserData = userInfo && bigThree;

  const navigateTo = (path: string, anchor?: string) => {
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

  const handleProtectedNavigation = (path: string, requiredData: string) => {
    if (!hasUserData) {
      toast.error(`You need to fill out your birth details first to access ${requiredData}.`, {
        action: {
          label: 'Fill Form',
          onClick: () => navigateTo('/', 'daily-form')
        }
      });
      return;
    }
    navigateTo(path);
  };

  return (
    <div className={`relative ${position === 'navbar' ? 'px-4 pt-1' : ''}`}>
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
          className={`absolute ${position === 'navbar' ? 'left-0' : 'right-0'} mt-2 w-48 rounded-lg bg-black/70 backdrop-blur-md
                     py-3 space-y-2 z-50 border border-white/10`}
        >
          <button
            onClick={() => navigateTo("/")}
            className="block w-full text-left px-4 py-1 text-gray-100 hover:text-cosmic-pink transition-colors"
          >
            Home
          </button>
          
          <button
            onClick={() => navigateTo("/", "daily-form")}
            className="block w-full text-left px-4 py-1 text-gray-100 hover:text-cosmic-pink transition-colors"
          >
            Daily Horoscope
          </button>
          
          <button
            onClick={() => handleProtectedNavigation("/reading", "your horoscope")}
            className={`block w-full text-left px-4 py-1 transition-colors ${
              hasUserData 
                ? 'text-gray-100 hover:text-cosmic-pink' 
                : 'text-gray-500 cursor-not-allowed'
            }`}
            disabled={!hasUserData}
          >
            Your Reading {!hasUserData && '(Fill form first)'}
          </button>
          
          <button
            onClick={() => handleProtectedNavigation("/natal-chart", "your natal chart")}
            className={`block w-full text-left px-4 py-1 transition-colors ${
              hasUserData 
                ? 'text-gray-100 hover:text-cosmic-pink' 
                : 'text-gray-500 cursor-not-allowed'
            }`}
            disabled={!hasUserData}
          >
            Natal Chart {!hasUserData && '(Fill form first)'}
          </button>
          
          <div className="border-t border-white/10 pt-2 mt-2">
            <Link
              to="/privacy"
              onClick={() => setOpen(false)}
              className="block px-4 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
