import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import { NAV_ROUTES } from "~data";
import { RouteObj } from "~utils/types";
import Repot from "~public/assets/repot.svg";
import useUserContext from "~hooks/useUserContext";

export default function Navigation() {
  const { isAuthenticated, user } = useUserContext();

  const router = useRouter();

  const navRoutes = NAV_ROUTES.map((route) => {
    const { href, name, security } = route;
    // Hide route that explicitly requires NO authentication.
    if (security === "no-auth" && isAuthenticated) return undefined;
    if (security === "auth" && !isAuthenticated) return undefined;
    const isAdmin = ["admin", "owner"].includes(user?.account_status || "");
    if (security === "admin" && !isAdmin) return undefined;
    if (security === "owner" && user?.account_status !== "owner")
      return undefined;

    const linkHref =
      typeof href === "string"
        ? href
        : href(isAuthenticated ? user?.id : undefined);

    return {
      name,
      href: linkHref,
      icon: route.icon ? (
        <route.icon />
      ) : (
        <Image
          src={user?.avatar_url ?? "/assets/default_avatar.png"}
          alt={`${user?.username} profile picture`}
          width={24}
          height={24}
          className="max-w-fit bg-slate-800 dark:bg-white rounded-full"
        />
      ),
    };
  }).filter((item): item is RouteObj => !!item);

  return (
    <nav className="z-50 sm:overflow-y-auto fixed sm:sticky sm:top-0 bottom-0 sm:bottom-auto w-full sm:w-24 sm:h-screen sm:flex sm:flex-col sm:items-center sm:gap-3 bg-white dark:bg-slate-800 shadow-inner sm:shadow-xl dark:shadow-xl shadow-neutral-200 dark:shadow-slate-600">
      <Repot
        aria-label="Repot logo"
        className="hidden sm:block max-w-[64px] max-h-[64px] my-5"
      />

      <ul className="w-full h-full flex sm:flex-col justify-evenly sm:justify-start items-center sm:items-start gap-3 p-2">
        {navRoutes.map((route) => (
          <NavItem
            key={route.name}
            routeInfo={route}
            isActive={router.asPath === route.href}
          />
        ))}
      </ul>
    </nav>
  );
}

interface NavItemProps {
  routeInfo: RouteObj;
  isActive: boolean;
}

const NavItem = ({ routeInfo, isActive }: NavItemProps) => {
  const { href, icon, name } = routeInfo;

  /* Classes for icons [Mobile] */
  const mobOnlyActive =
    "translate-y-[-1.5rem] outline outline-zinc-100 dark:outline-slate-900 bg-orange-500 text-white";
  const mobOnlyHover =
    "group-hover:translate-y-[-1.5rem] group-hover:outline outline-white group-hover:outline-zinc-100 dark:outline-slate-800 dark:group-hover:outline-slate-900 bg-white group-hover:bg-orange-400 dark:bg-slate-800 text-slate-500 dark:text-zinc-400 group-hover:text-white";
  const iconMobClass = isActive ? mobOnlyActive : mobOnlyHover;

  /* Classes for icons [Desktop] */
  const iconDeskClass = isActive
    ? "sm:bg-gradient-to-r sm:from-orange-500 sm:to-amber-500 sm:text-white"
    : "sm:hover:bg-gradient-to-r sm:from-orange-400 sm:to-amber-400 sm:hover:text-white";

  return (
    <li
      key={name}
      className="group relative w-16 sm:w-full transition text-center text-2xl"
    >
      <Link
        href={href}
        className={`flex flex-col justify-center items-center sm:gap-2 sm:p-1.5 sm:py-2 sm:rounded-xl ${iconDeskClass}`}
      >
        <span
          className={`sm:hidden navItemTransitions p-1 rounded-full outline-[6px] ${iconMobClass}`}
        >
          {icon}
        </span>
        <span
          className={`hidden sm:block ${
            isActive
              ? "text-white"
              : "text-slate-500 dark:text-zinc-400 group-hover:text-white"
          }`}
        >
          {icon}
        </span>
        <span className="max-[400px]:hidden text-sm sm:text-base sm:font-medium">{name}</span>
      </Link>
    </li>
  );
};
