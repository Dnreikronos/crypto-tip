'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Coins } from 'lucide-react';

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const menuVariants = {
		hidden: { opacity: 0, height: 0 },
		visible: {
			opacity: 1,
			height: 'auto',
			transition: {
				duration: 0.3,
				ease: 'easeInOut'
			}
		},
		exit: {
			opacity: 0,
			height: 0,
			transition: {
				duration: 0.3,
				ease: 'easeInOut'
			}
		}
	};

	return (
		<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
			}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<Link href="/" className="flex items-center">
						<div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 mr-2 flex items-center justify-center">
							<Coins className="h-4 w-4 text-white" />
						</div>
						<span className="text-xl font-bold text-white">CryptoTip</span>
					</Link>


					<div className="hidden md:flex items-center space-x-4">
						<Link
							href="/login"
							className="text-gray-300 hover:text-white transition-colors"
						>
							Login
						</Link>
						<Link
							href="/register"
							className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105"
						>
							Create Account
						</Link>
					</div>

					<button
						className="md:hidden text-gray-300 hover:text-white"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
					>
						{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
						className="md:hidden bg-gray-900/95 backdrop-blur-lg"
					>
						<div className="px-4 py-6 space-y-4">
							<div className="pt-4 flex flex-col space-y-4">
								<Link
									href="#login"
									className="text-gray-300 hover:text-white transition-colors"
									onClick={() => setIsMenuOpen(false)}
								>
									Login
								</Link>
								<Link
									href="#signup"
									className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105"
									onClick={() => setIsMenuOpen(false)}
								>
									Create Account
								</Link>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
