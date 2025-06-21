"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  UserPlus,
  LogIn as LogInIcon,
  User as UserIcon,
  Plus,
  ChevronDown,
} from "lucide-react";
import { getCurrentUser, logoutUser, User } from "@/lib/auth";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      console.log(
        "Navbar: Fetching user state on mount or pathname change:",
        pathname,
      );
      const current = await getCurrentUser();
      setUser(current);
    }
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setShowLogoutConfirm(false);
    router.push("/login");
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const menuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const navInteractiveBaseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer";

  const textLinkStylesDesktop =
    "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors";

  const mobileMenuItemSharedSizeStyles = "w-full px-4 h-12 text-base";
  const mobileLogoutButtonStyles = `${navInteractiveBaseStyles} ${mobileMenuItemSharedSizeStyles} text-white bg-red-600 hover:bg-red-700 focus:ring-red-400`;
  const mobileCreateAccountButtonStyles = `${navInteractiveBaseStyles} ${mobileMenuItemSharedSizeStyles} text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-400`;
  const mobileLoginLinkStyles = `${navInteractiveBaseStyles} ${mobileMenuItemSharedSizeStyles} text-gray-100 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-gray-900/80 backdrop-blur-lg shadow-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center py-4">
            <div className="flex-shrink-0">
              <Link
                href={user ? "/projects" : "/"}
                className="flex items-center"
              >
                <Logo size={32} showText={true} />
              </Link>
            </div>

            <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center space-x-3 lg:space-x-4">
              {/* Projects button removed */}
            </div>

            <div className="hidden md:flex flex-shrink-0 items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/create-project"
                    className={`${navInteractiveBaseStyles} text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:ring-cyan-300 px-4 py-2 text-sm animate-[heartbeat_2s_ease-in-out_infinite] hover:animate-none`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Link>

                  <div className="relative profile-dropdown">
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className={`${navInteractiveBaseStyles} text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500 px-3 py-2 text-sm`}
                    >
                      <UserIcon className="h-4 w-4 mr-1" />
                      <ChevronDown className="h-3 w-3" />
                    </button>

                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2"
                        >
                          <Link
                            href="/my-projects"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3" />
                            My Projects
                          </Link>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              confirmLogout();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login" className={textLinkStylesDesktop}>
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`${navInteractiveBaseStyles} text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-400 px-4 py-2 text-sm`}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden bg-gray-900/95 backdrop-blur-lg shadow-xl"
            >
              <div className="px-4 pt-4 pb-5 space-y-3">
                {user && (
                  <Link
                    href="/create-project"
                    className={`${navInteractiveBaseStyles} ${mobileMenuItemSharedSizeStyles} text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:ring-cyan-300 animate-[heartbeat_2s_ease-in-out_infinite] hover:animate-none`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Project
                  </Link>
                )}
                {user && (
                  <Link
                    href="/my-projects"
                    className={`${navInteractiveBaseStyles} ${mobileMenuItemSharedSizeStyles} text-gray-100 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    My Projects
                  </Link>
                )}

                {user ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      confirmLogout();
                    }}
                    className={mobileLogoutButtonStyles}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={mobileLoginLinkStyles}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogInIcon className="h-5 w-5 mr-2" />
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={mobileCreateAccountButtonStyles}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 max-w-sm mx-4"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Confirm Logout
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Are you sure you want to logout? You will need to sign in
                  again to access your account.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
