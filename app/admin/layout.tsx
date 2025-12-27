'use client';

import type React from 'react';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  TableProperties,
  Users,
  Scale,
  FileText,
  LogOut,
  Shield,
  User,
  Pickaxe,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAuthenticated, logout, hasHydrated } = useAuth();
  console.log('hasHydrated===>', hasHydrated);
  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated && pathname !== '/admin') {
      router.push('/admin');
    }
  }, [isAuthenticated, pathname, router, hasHydrated]);

  if (pathname === '/admin') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const isMainAdmin = admin?.role === 'main';

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/admin/score-entry',
      label: 'Score Entry',
      icon: TableProperties,
      show: true,
    },
    {
      href: '/admin/players',
      label: 'Players',
      icon: Users,
      show: isMainAdmin,
    },
    {
      href: '/admin/admins',
      label: 'Admins',
      icon: Shield,
      show: isMainAdmin,
    },
    {
      href: '/admin/judges',
      label: 'Judges',
      icon: Scale,
      show: isMainAdmin,
    },
    {
      href: '/admin/criteria',
      label: 'Criteria',
      icon: FileText,
      show: isMainAdmin,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <nav className="bg-slate-900/50 border-b border-purple-500/20 backdrop-blur-sm animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <Pickaxe className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold text-white">
                  Admin Panel
                </span>
              </Link>

              <div className="flex gap-1">
                {navItems
                  .filter((item) => item.show)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={`gap-2 transition-all duration-300 ${
                            isActive
                              ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-105'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-950/50 rounded-lg border border-slate-700/50 animate-fade-in">
                {isMainAdmin ? (
                  <Shield className="w-4 h-4 text-purple-400" />
                ) : (
                  <User className="w-4 h-4 text-cyan-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {admin?.name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {admin?.role} Admin
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="gap-2 text-slate-400 hover:text-white hover:bg-red-500/10 transition-all duration-300 hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
