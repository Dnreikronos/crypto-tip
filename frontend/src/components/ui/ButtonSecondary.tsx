import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonSecondaryProps {
  children: ReactNode;
  href: string;
  className?: string;
}

export default function ButtonSecondary({ children, href, className = '' }: ButtonSecondaryProps) {
  return (
    <Link 
      href={href}
      className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium text-cyan-400 bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700 hover:border-cyan-500/50 rounded-lg transition-all duration-200 transform hover:scale-105 ${className}`}
    >
      {children}
    </Link>
  );
}