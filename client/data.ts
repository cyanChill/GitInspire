import {
  FaChartBar,
  FaCog,
  FaCompass,
  FaHome,
  FaUserCircle,
} from "react-icons/fa";
import { IoCreate } from "react-icons/io5";

import { SelectOption } from "~components/form/Select";

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
    href: "/contribute",
    icon: IoCreate,
    name: "Contribute",
    security: "auth",
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
  { href: "/misc", icon: FaCog, name: "Misc.", security: "" },
];

export const REPORT_TYPE_OPTIONS: SelectOption[] = [
  { label: "Repository", value: "repository" },
  { label: "Tag", value: "tag" },
  { label: "User", value: "user" },
  { label: "Bug", value: "bug" },
  { label: "Suggestion", value: "suggestion" },
  { label: "Other", value: "other" },
];

export const REPORT_REASON_OPTIONS: SelectOption[] = [
  { label: "Abuse/Inappropriate", value: "abuse" },
  { label: "Maintain Link", value: "maintain_link" },
  { label: "Incorrect Information", value: "incorrect_info" },
  { label: "Update Information", value: "update_info" },
  { label: "Other", value: "other" },
];
