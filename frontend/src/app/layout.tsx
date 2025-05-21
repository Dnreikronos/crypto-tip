import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from 'sonner'
import Providers from "@/providers/Providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/providers/WalletProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Crypto Tip",
	description: "Donations with Crypto",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<WalletProvider>
					<Providers>
						<AuthProvider>
							<Navbar />
							{children}
							<Toaster
								position="top-right"
								toastOptions={{
									style: {
										background: 'rgba(23, 23, 23, 0.95)',
										color: '#ffffff',
										border: '1px solid rgba(255, 255, 255, 0.08)',
										backdropFilter: 'blur(12px)',
										boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
										borderRadius: '1rem',
										padding: '1rem 1.25rem',
										fontFamily: 'var(--font-geist-sans)',
										transform: 'translateY(0)',
										opacity: '1',
										transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
									},
									className: 'crypto-toast',
									classNames: {
										toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
										description: "group-[.toast]:text-muted-foreground text-sm mt-1",
										actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
										cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
										success: "group-[.toast]:bg-[#10B981] group-[.toast]:text-white group-[.toast]:border-l-4 group-[.toast]:border-l-[#059669] group-[.toast]:shadow-lg group-[.toast]:shadow-[#10B981]/20",
										error: "group-[.toast]:bg-[#EF4444] group-[.toast]:text-white group-[.toast]:border-l-4 group-[.toast]:border-l-[#DC2626] group-[.toast]:shadow-lg group-[.toast]:shadow-[#EF4444]/20",
										info: "group-[.toast]:bg-[#3B82F6] group-[.toast]:text-white group-[.toast]:border-l-4 group-[.toast]:border-l-[#2563EB] group-[.toast]:shadow-lg group-[.toast]:shadow-[#3B82F6]/20",
										warning: "group-[.toast]:bg-[#F59E0B] group-[.toast]:text-white group-[.toast]:border-l-4 group-[.toast]:border-l-[#D97706] group-[.toast]:shadow-lg group-[.toast]:shadow-[#F59E0B]/20",
									},
									duration: 4000,
									closeButton: true,
								}}
							/>
							<Footer />
						</AuthProvider>
					</Providers>
				</WalletProvider>
			</body>
		</html>
	);
}
