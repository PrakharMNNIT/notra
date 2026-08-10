export function resolveActiveNavLink(
  pathname: string,
  slug: string,
  links: readonly string[]
): string | null {
  const root = `/${slug}`;
  let active: string | null = null;
  for (const link of links) {
    const href = `${root}${link}`;
    if (link === "") {
      if (pathname === root || pathname === `${root}/`) {
        active = active ?? link;
      }
      continue;
    }
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (matches && (active === null || link.length > active.length)) {
      active = link;
    }
  }
  return active;
}
