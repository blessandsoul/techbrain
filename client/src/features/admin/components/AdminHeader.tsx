'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction, setLoggingOut } from '@/features/auth/store/authSlice';
import { authService } from '@/features/auth/services/auth.service';
import { ROUTES } from '@/lib/constants/routes';

export function AdminHeader(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const isOrders = pathname.startsWith('/admin/orders');
  const isInquiries = pathname.startsWith('/admin/inquiries');
  const isArticles = pathname.startsWith('/admin/articles');
  const isProjects = pathname.startsWith('/admin/projects');
  // TODO: reactivate catalog-settings when needed
  // const isCatalog = pathname.startsWith('/admin/catalog-settings');
  const isSiteSettings = pathname.startsWith('/admin/site-settings');
  const isProducts = !isOrders && !isInquiries && !isArticles && !isProjects && !isSiteSettings && (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/products'));

  const handleLogout = useCallback(async (): Promise<void> => {
    dispatch(setLoggingOut(true));
    try {
      await authService.logout();
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      dispatch(logoutAction());
      toast.success('გამოსვლა წარმატებით');
      router.push(ROUTES.ADMIN.LOGIN);
    }
  }, [dispatch, router]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLink = (href: string, active: boolean, label: string): React.ReactElement => (
    <Link
      href={href}
      className={`relative text-xs xl:text-sm px-1.5 lg:px-2 xl:px-3 py-1 xl:py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
        active
          ? 'text-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full bg-primary" />
      )}
    </Link>
  );

  const mobileNavLink = (href: string, active: boolean, label: string): React.ReactElement => (
    <Link
      href={href}
      className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? 'text-foreground font-medium bg-muted/50'
          : 'text-muted-foreground active:bg-muted/50'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-border bg-card px-3 lg:px-4 xl:px-6 py-2 xl:py-3 relative">
      {/* Desktop header (md+) */}
      <div className="max-w-screen-2xl mx-auto hidden md:flex items-center justify-between gap-2 lg:gap-3 xl:gap-4">
        <nav className="flex items-center gap-0 lg:gap-0.5 xl:gap-1 overflow-x-auto shrink min-w-0" style={{ scrollbarWidth: 'none' }}>
          {navLink('/admin/dashboard', isProducts, 'პროდუქტები')}
          {navLink(ROUTES.ADMIN.ORDERS, isOrders, 'შეკვეთები')}
          {navLink(ROUTES.ADMIN.INQUIRIES, isInquiries, 'მოთხოვნები')}
          {navLink(ROUTES.ADMIN.ARTICLES, isArticles, 'სტატიები')}
          {navLink(ROUTES.ADMIN.PROJECTS, isProjects, 'პროექტები')}
          {/* TODO: reactivate catalog-settings when needed */}
          {/* {navLink(ROUTES.ADMIN.CATALOG_SETTINGS, isCatalog, 'კატალოგი')} */}
          {navLink(ROUTES.ADMIN.SITE_SETTINGS, isSiteSettings, 'პარამეტრები')}
        </nav>

        <div className="flex items-center gap-1 xl:gap-2 shrink-0">
          {isProducts && (
            <Button size="sm" asChild>
              <Link href={ROUTES.ADMIN.PRODUCTS_NEW} className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden xl:inline">პროდუქტის დამატება</span>
              </Link>
            </Button>
          )}
          {isArticles && (
            <Button size="sm" asChild>
              <Link href={ROUTES.ADMIN.ARTICLES_NEW} className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden xl:inline">ახალი სტატია</span>
              </Link>
            </Button>
          )}
          {isProjects && (
            <Button size="sm" asChild>
              <Link href={ROUTES.ADMIN.PROJECTS_NEW} className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden xl:inline">ახალი პროექტი</span>
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.HOME} className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              <span className="hidden xl:inline">საიტზე გადასვლა</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            გასვლა
          </Button>
        </div>
      </div>

      {/* Mobile header (<md) */}
      <div className="flex md:hidden items-center justify-between">
        <span className="text-sm font-medium text-foreground">ადმინი</span>
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'დახურვა' : 'მენიუ'}
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </Button>
      </div>

      {/* Mobile dropdown menu — grid row transition for smooth open/close */}
      <div
        className="md:hidden grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: mobileMenuOpen ? '1fr' : '0fr' }}
      >
        <nav className="overflow-hidden">
          <div className="mt-2 pb-1 flex flex-col gap-0.5 border-t border-border/50 pt-3">
            {mobileNavLink('/admin/dashboard', isProducts, 'პროდუქტები')}
            {mobileNavLink(ROUTES.ADMIN.ORDERS, isOrders, 'შეკვეთები')}
            {mobileNavLink(ROUTES.ADMIN.INQUIRIES, isInquiries, 'მოთხოვნები')}
            {mobileNavLink(ROUTES.ADMIN.ARTICLES, isArticles, 'სტატიები')}
            {mobileNavLink(ROUTES.ADMIN.PROJECTS, isProjects, 'პროექტები')}
            {mobileNavLink(ROUTES.ADMIN.SITE_SETTINGS, isSiteSettings, 'პარამეტრები')}

            <div className="border-t border-border/50 mt-1 pt-2 flex flex-col gap-0.5">
              {isProducts && (
                <Link href={ROUTES.ADMIN.PRODUCTS_NEW} className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary font-medium rounded-lg active:bg-muted/50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  პროდუქტის დამატება
                </Link>
              )}
              {isArticles && (
                <Link href={ROUTES.ADMIN.ARTICLES_NEW} className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary font-medium rounded-lg active:bg-muted/50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  ახალი სტატია
                </Link>
              )}
              {isProjects && (
                <Link href={ROUTES.ADMIN.PROJECTS_NEW} className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary font-medium rounded-lg active:bg-muted/50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  ახალი პროექტი
                </Link>
              )}
              <Link href={ROUTES.HOME} className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground rounded-lg active:bg-muted/50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                საიტზე გადასვლა
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-destructive rounded-lg active:bg-muted/50 text-left"
              >
                გასვლა
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
