export function getDashboardRoot(pathname: string) {
  if (pathname.startsWith('/staffdashboard')) {
    return '/staffdashboard';
  }

  if (pathname.startsWith('/admindashboard')) {
    return '/admindashboard';
  }

  return '/studashboard';
}

export function getMarketplaceBase(pathname: string) {
  return `${getDashboardRoot(pathname)}/main-menu/marketplace`;
}
