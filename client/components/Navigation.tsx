import { useRouter } from "next/router";
import Link from "next/link";

import { NAV_ROUTES } from "~data";
import useUserContext from "~hooks/useUserContext";

export default function Navigation() {
  const { isAuthenticated, user } = useUserContext();

  const router = useRouter();

  const navRoutes = NAV_ROUTES.map((route) => {
    const { href, name, security } = route;

    // Hide route that explicitly requires NO authentication.
    if (security === "no-auth" && isAuthenticated) return null;

    if (["auth", "admin"].includes(security)) {
      if (!isAuthenticated) return null;

      if (
        security === "admin" &&
        !["admin", "owner"].includes(user?.account_status || "")
      ) {
        return null;
      }
    }

    const isActive = router.asPath === href;
    const linkHref =
      typeof href === "string"
        ? href
        : href(isAuthenticated ? user?.id : undefined);

    /* Classes for icons [Mobile] */
    const mobOnlyActive =
      "translate-y-[-1.75rem] outline outline-zinc-100 dark:outline-slate-900 bg-orange-400 dark:bg-orange-500 text-white";
    const mobOnlyHover =
      "group-hover:translate-y-[-1.75rem] group-hover:outline outline-white group-hover:outline-zinc-100 dark:outline-slate-800 dark:group-hover:outline-slate-900 bg-white group-hover:bg-orange-400 dark:bg-slate-800 dark:group-hover:bg-orange-500 group-hover:text-white";
    const iconMobClass = isActive ? mobOnlyActive : mobOnlyHover;

    /* Classes for icons [Desktop] */
    const iconDeskClass = isActive
      ? "md:bg-orange-500 md:text-white"
      : "md:hover:bg-orange-400 md:hover:text-white";

    return (
      <li
        key={name}
        className={`group relative w-16 md:w-full transition text-center text-2xl md:text-3xl md:my-2 `}
      >
        <Link
          href={linkHref}
          className={`flex flex-col md:flex-row justify-center md:justify-start items-center md:gap-4 md:px-2 md:py-3 md:rounded-xl ${iconDeskClass}`}
        >
          <span
            className={`md:hidden navItemTransitions w-min h-min p-2 rounded-full outline-[6px] ${iconMobClass}`}
          >
            <route.icon />
          </span>
          <span className="hidden md:block">
            <route.icon />
          </span>
          <span className="max-[400px]:hidden text-sm md:text-2xl font-medium md:font-normal">
            {name}
          </span>
        </Link>
      </li>
    );
  });

  return (
    <nav className="z-50 fixed md:sticky md:top-0 bottom-0 md:bottom-auto w-full md:w-60 md:h-screen md:flex md:items-center bg-white dark:bg-slate-800 shadow-inner md:shadow-xl dark:shadow-xl shadow-neutral-200 dark:shadow-slate-600">
      <ul className="w-full flex md:flex-col justify-evenly items-center md:items-start gap-2 md:gap-4 p-2">
        {navRoutes}
      </ul>
    </nav>
  );
}
