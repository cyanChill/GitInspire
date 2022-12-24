import {
  FaChartBar,
  FaCog,
  FaCompass,
  FaHome,
  FaUserCircle,
} from "react-icons/fa";

export const NAV_ROUTES = [
  { href: "/", icon: FaHome, name: "Home", security: "" },
  { href: "/discover", icon: FaCompass, name: "Discover", security: "" },
  {
    href: "/auth/login",
    icon: FaUserCircle,
    name: "Login",
    security: "no-auth",
  },
  {
    href: (userId?: number) => `/profile/${userId}`,
    icon: null,
    name: "Profile",
    security: "auth",
  },
  {
    href: "/admin",
    icon: FaChartBar,
    name: "Admin",
    security: "admin",
  },
  { href: "/settings", icon: FaCog, name: "Settings", security: "" },
];
