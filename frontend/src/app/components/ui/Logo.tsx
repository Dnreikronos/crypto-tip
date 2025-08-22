import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({
  size = 40,
  className = "",
  showText = false,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.png"
        alt="CryptoTip Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          CryptoTip
        </span>
      )}
    </div>
  );
}
