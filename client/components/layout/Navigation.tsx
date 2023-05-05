import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import { NAV_ROUTES } from "~data";
import { RouteObjType } from "~utils/types";
import GitInspire from "~public/assets/gitinspire.svg";
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
          className="max-w-fit rounded-full bg-slate-800 dark:bg-white"
        />
      ),
    };
  }).filter((item): item is RouteObjType => !!item);

  return (
    <nav className="fixed bottom-0 z-50 w-full bg-white shadow-inner shadow-neutral-200 dark:bg-slate-800 dark:shadow-xl dark:shadow-slate-600 sm:sticky sm:top-0 sm:bottom-auto sm:flex sm:h-screen sm:w-24 sm:flex-col sm:items-center sm:gap-3 sm:overflow-y-auto sm:shadow-xl">
      <GitInspire
        aria-label="GitInspire logo"
        className="my-5 hidden max-h-[64px] max-w-[64px] sm:block shrink-0"
      />

      <ul className="flex h-full w-full items-center justify-evenly gap-3 p-2 sm:flex-col sm:items-start sm:justify-start">
        {navRoutes.map((route) => (
          <NavItem
            key={route.name}
            routeInfo={route}
            /* To match navlink with routes with query params */
            isActive={
              route.href !== "/"
                ? router.asPath.startsWith(route.href)
                : router.asPath === route.href
            }
          />
        ))}
      </ul>
    </nav>
  );
}

interface NavItemProps {
  routeInfo: RouteObjType;
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
      className="group relative w-16 text-center text-2xl transition sm:w-full"
    >
      <Link
        href={href}
        className={`flex flex-col items-center justify-center sm:gap-2 sm:rounded-xl sm:p-1.5 sm:py-2 ${iconDeskClass}`}
      >
        <span
          className={`navItemTransitions rounded-full p-1 outline-[6px] sm:hidden ${iconMobClass}`}
        >
          {icon}
        </span>
        <span
          className={`hidden sm:block ${
            isActive
              ? "text-white"
              : "text-slate-500 group-hover:text-white dark:text-zinc-400"
          }`}
        >
          {icon}
        </span>
        <span className="text-sm max-[400px]:hidden sm:text-base sm:font-medium">
          {name}
        </span>
      </Link>
    </li>
  );
};
