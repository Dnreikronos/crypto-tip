"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Coins,
  LogOut,
  Briefcase,
  LayoutDashboard,
  UserPlus,
  LogIn as LogInIcon,
} from "lucide-react";
import { getCurrentUser, logoutUser, User } from "@/lib/auth";


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsMenuOpen(false);
    router.push("/login");
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

  const navInteractiveBaseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer";
  const navButtonGradientColors =
    "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 focus:ring-cyan-300 text-white";

  const navButtonStylesDesktop = `${navInteractiveBaseStyles} ${navButtonGradientColors} px-3 py-2 text-sm`;
  const textLinkStylesDesktop =
    "text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors";

  const mobileMenuItemSharedSizeStyles = "w-full px-4 h-12 text-base";

  const navButtonStylesMobile = `${navInteractiveBaseStyles} ${navButtonGradientColors} ${mobileMenuItemSharedSizeStyles}`;
  const mobileLogoutButtonStyles = `${navInteractiveBaseStyles} ${mobileMenuItemSharedSizeStyles} text-white bg-red-600 hover:bg-red-700 focus:ring-red-400`;
  const mobileCreateAccountButtonStyles = `${navInteractiveBaseStyles} ${mobileMenuItemSharedSizeStyles} text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-400`;
  const mobileLoginLinkStyles = `${navInteractiveBaseStyles} ${mobileMenuItemSharedSizeStyles} text-gray-100 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-gray-900/80 backdrop-blur-lg shadow-lg" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mr-2 flex items-center justify-center">
                <Coins className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CryptoTip</span>
            </Link>
          </div>

          <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center space-x-3 lg:space-x-4">
            {user && (
              <Link href="/projects" className={navButtonStylesDesktop}>
                <Briefcase className="h-4 w-4 mr-2" />
                Projects
              </Link>
            )}
            {user && (
              <Link href="/my-projects" className={navButtonStylesDesktop}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                My Projects
              </Link>
            )}
          </div>

          <div className="hidden md:flex flex-shrink-0 items-center space-x-4">
            
            {user ? (
              <button
                onClick={handleLogout}
                className={`${navInteractiveBaseStyles} text-white bg-red-600 hover:bg-red-700 focus:ring-red-400 px-4 py-2 text-sm`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
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
                  href="/projects"
                  className={navButtonStylesMobile}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Briefcase className="h-5 w-5 mr-2" />
                  Projects
                </Link>
              )}
              {user && (
                <Link
                  href="/my-projects"
                  className={navButtonStylesMobile}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  My Projects
                </Link>
              )}

            

              {user ? (
                <button
                  onClick={handleLogout}
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
  );
}
