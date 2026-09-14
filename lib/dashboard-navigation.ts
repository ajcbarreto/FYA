export function isDashboardLinkActive(
  pathname: string,
  href: string,
  root: string,
) {
  const path = pathname.replace(/\/$/, "");
  return path === href || (href !== root && path.startsWith(`${href}/`));
}
