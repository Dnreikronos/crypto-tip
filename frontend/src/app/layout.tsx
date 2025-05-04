import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from 'sonner'
import Providers from "@/providers/Providers";
import { AuthProvider } from "@/contexts/AuthContext";

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
				<Providers>
					<AuthProvider>
						<Navbar />
						{children}
						<Toaster
							position="top-right"
							toastOptions={{
								style: {
									background: 'var(--crypto-dark-2)',
									color: 'white',
									border: '1px solid rgba(var(--crypto-glow-rgb), 0.1)',
								},
								className: 'crypto-toast',
							}}
						/>
						<Footer />
					</AuthProvider>
				</Providers>
			</body>
		</html>
	);
}
