import { Link } from "react-router-dom";
import Navigation from "./Navigation";

const LogoHeader = () => (
  <header className="w-full px-4 py-2 flex items-center justify-between">
    {/* Logo */}
    <Link to="/" className="flex items-center gap-2">
      <img
        src="/logoTemp_nobackground.png"
        alt="Astroloqueer Logo"
        className="h-20 w-auto"
      />
    </Link>

    {/* Navigation */}
    <Navigation position="header" />
  </header>
);

export default LogoHeader;
