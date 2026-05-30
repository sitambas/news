'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FiSearch, FiSun, FiMoon, FiBell, FiUser, FiMenu, FiX,
  FiBookmark, FiLogOut, FiSettings, FiChevronDown, FiTrendingUp
} from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'होम', href: '/' },
  { label: 'राजनीति', href: '/category/politics' },
  { label: 'तकनीक', href: '/category/technology' },
  { label: 'व्यापार', href: '/category/business' },
  { label: 'विज्ञान', href: '/category/science' },
  { label: 'खेल', href: '/category/sports' },
  { label: 'स्वास्थ्य', href: '/category/health' },
  { label: 'विश्व', href: '/category/world' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md' : 'bg-white dark:bg-gray-900'
    } border-b border-gray-200 dark:border-gray-800`}>
      {/* Top Bar */}
      <div className="bg-red-600 text-white py-1 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-medium">📰 न्यूज़हब — ब्रेकिंग न्यूज़ का आपका विश्वसनीय स्रोत</span>
          <span className="hidden sm:block">{new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">
              न्यूज़<span className="text-red-600">हब</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <form onSubmit={handleSearch}>
                      <div className="flex items-center gap-2">
                        <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="खबर खोजें..."
                          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                        />
                        <button type="submit" className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">
                          खोजें
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Auth Area — only render after hydration to avoid mismatch */}
            {!mounted ? (
              <div className="w-20 h-8" />
            ) : isAuthenticated() ? (
              <div className="flex items-center space-x-1">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <FiBell className="w-5 h-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notifCount}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <FiChevronDown className="w-3 h-3 text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <FiUser className="w-4 h-4" /> मेरी प्रोफाइल
                        </Link>
                        <Link href="/bookmarks" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <FiBookmark className="w-4 h-4" /> बुकमार्क
                        </Link>
                        {user?.role && ['admin', 'editor'].includes(user.role) && (
                          <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <FiSettings className="w-4 h-4" /> एडमिन डैशबोर्ड
                          </Link>
                        )}
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <FiLogOut className="w-4 h-4" /> लॉगआउट
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/auth/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 px-3 py-1.5">
                  लॉगिन
                </Link>
                <Link href="/auth/register" className="text-sm font-medium bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                  साइन अप
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.href)
                      ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {mounted && !isAuthenticated() && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                    लॉगिन
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 text-sm bg-red-600 text-white rounded-lg">
                    साइन अप
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
