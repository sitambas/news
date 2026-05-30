'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiHome, FiFileText, FiUsers, FiTag, FiBarChart2, FiSettings,
  FiMenu, FiX, FiLogOut, FiBell, FiSearch, FiChevronDown, FiEdit,
  FiPlusCircle, FiTrendingUp, FiAlertCircle
} from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'डैशबोर्ड', href: '/admin', icon: FiHome },
  { label: 'लेख', href: '/admin/articles', icon: FiFileText },
  { label: 'नया लेख', href: '/admin/articles/new', icon: FiPlusCircle },
  { label: 'श्रेणियाँ', href: '/admin/categories', icon: FiTag },
  { label: 'उपयोगकर्ता', href: '/admin/users', icon: FiUsers },
  { label: 'विश्लेषण', href: '/admin/analytics', icon: FiBarChart2 },
  { label: 'सेटिंग्स', href: '/admin/settings', icon: FiSettings },
];

function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-tight">CG</span>
            </div>
            <span className="font-bold text-white tracking-tight">CG<span className="text-red-400">FILE</span> एडमिन</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                isActive(item.href)
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
            <FiHome className="w-4 h-4" />
            वेबसाइट पर वापस
          </Link>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login?callbackUrl=/admin');
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('लॉगआउट हो गए');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold text-gray-900 dark:text-white text-sm hidden sm:block">
              एडमिन डैशबोर्ड
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="त्वरित खोज..."
                className="w-48 pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <FiBell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Logout">
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
