"use client";

interface SectionTransitionProps {
  type?: "particles" | "wave" | "geometric" | "energy" | "flow";
  className?: string;
}

export default function SectionTransition({
  className = "",
}: SectionTransitionProps) {
  // Apenas um espaçador entre seções, sem animações de background
  return <div className={`h-px ${className}`} />;
}
