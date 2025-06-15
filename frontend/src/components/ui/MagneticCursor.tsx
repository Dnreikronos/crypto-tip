"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface CursorState {
  isHovering: boolean;
  isClicking: boolean;
  text: string;
  type: "default" | "pointer" | "text" | "magnetic";
}

export default function MagneticCursor() {
  const [cursorState, setCursorState] = useState<CursorState>({
    isHovering: false,
    isClicking: false,
    text: "",
    type: "default",
  });

  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const trailRef = useRef<Array<{ x: number; y: number; timestamp: number }>>(
    [],
  );

  useEffect(() => {
    // Detectar se é um dispositivo touch
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.innerWidth <= 768, // Também considerar telas pequenas
      );
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);

    return () => {
      window.removeEventListener("resize", checkTouchDevice);
    };
  }, []);

  useEffect(() => {
    // Não inicializar o cursor em dispositivos touch
    if (isTouchDevice) return;

    const updateCursor = (e: MouseEvent) => {
      // Seguir diretamente o cursor sem bounce
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Add to trail
      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });

      // Keep only recent trail points
      trailRef.current = trailRef.current.filter(
        (point) => Date.now() - point.timestamp < 500,
      );

      const target = e.target as HTMLElement;
      const magneticElement = target.closest("[data-magnetic]");
      const clickableElement = target.closest(
        'button, a, [role="button"], input, textarea, select',
      );

      if (magneticElement) {
        const rect = magneticElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2),
        );

        if (distance < 100) {
          const magneticText =
            magneticElement.getAttribute("data-magnetic-text") || "";
          setCursorState((prev) => ({
            ...prev,
            isHovering: true,
            text: magneticText,
            type: "magnetic",
          }));
          return;
        }
      }

      if (clickableElement) {
        setCursorState((prev) => ({
          ...prev,
          isHovering: true,
          type: "pointer",
          text: "",
        }));
      } else if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        setCursorState((prev) => ({
          ...prev,
          isHovering: true,
          type: "text",
          text: "",
        }));
      } else {
        setCursorState((prev) => ({
          ...prev,
          isHovering: false,
          type: "default",
          text: "",
        }));
      }
    };

    const handleMouseDown = () => {
      setCursorState((prev) => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = () => {
      setCursorState((prev) => ({ ...prev, isClicking: false }));
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: -100, y: -100 });
    };

    document.addEventListener("mousemove", updateCursor);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isTouchDevice]);

  // Não renderizar nada em dispositivos touch
  if (isTouchDevice) {
    return null;
  }

  const getCursorVariants = () => {
    const baseVariants = {
      default: {
        scale: 1,
        backgroundColor: "rgba(0, 229, 255, 0.8)",
        border: "2px solid rgba(0, 229, 255, 0.3)",
      },
      pointer: {
        scale: 1.2,
        backgroundColor: "rgba(147, 51, 234, 0.8)",
        border: "2px solid rgba(147, 51, 234, 0.5)",
      },
      text: {
        scale: 1,
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        border: "2px solid rgba(34, 197, 94, 0.5)",
      },
      magnetic: {
        scale: 1.2,
        backgroundColor: "rgba(255, 107, 53, 0.9)",
        border: "2px solid rgba(255, 107, 53, 0.6)",
      },
    };

    if (cursorState.isClicking) {
      return {
        ...baseVariants[cursorState.type],
        scale: (baseVariants[cursorState.type].scale as number) * 0.8,
      };
    }

    return baseVariants[cursorState.type];
  };

  return (
    <>
      {/* Trail Effect */}
      {trailRef.current.map((point, index) => (
        <motion.div
          key={`${point.timestamp}-${index}`}
          className="fixed top-0 left-0 w-1 h-1 bg-cyan-400/30 rounded-full pointer-events-none z-[9998]"
          style={{
            left: point.x - 2,
            top: point.y - 2,
          }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Main Cursor - Segue diretamente o cursor original */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9990]"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
        animate={getCursorVariants()}
        transition={{
          duration: 0.1,
          ease: "easeOut",
        }}
      >
        {/* Pulsing ring for pointer state */}
        {cursorState.type === "pointer" && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400/50"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Pulsing ring for magnetic state */}
        {cursorState.type === "magnetic" && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-orange-400/50"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* Cursor Text Label */}
      {cursorState.text && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9991] bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y - 40,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {cursorState.text}
        </motion.div>
      )}
    </>
  );
}
