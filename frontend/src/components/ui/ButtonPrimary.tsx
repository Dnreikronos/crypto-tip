import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonPrimaryProps {
  children: ReactNode;
  href: string;
  className?: string;
}

export default function ButtonPrimary({ children, href, className = '' }: ButtonPrimaryProps) {
  return (
    <Link 
      href={href}
      className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 ${className}`}
    >
      {children}
    </Link>
  );
}
