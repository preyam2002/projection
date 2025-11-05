"use client";

import { useEffect, useState } from "react";

interface ShuffleTextProps {
  text: string;
  duration?: number;
  delay?: number;
  className?: string;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

export default function ShuffleText({
  text,
  duration = 1,
  delay = 0,
  className = "",
}: ShuffleTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const startAnimation = () => {
      let startTime: number | null = null;
      let animationFrame: number;

      const shuffle = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          // Generate random characters
          const shuffled = text
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              // More likely to show correct character as we progress
              const charProgress = Math.min(progress * 1.5, 1);
              if (Math.random() < charProgress) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("");
          setDisplayText(shuffled);
          animationFrame = requestAnimationFrame(shuffle);
        } else {
          // Animation complete, show final text
          setDisplayText(text);
        }
      };

      animationFrame = requestAnimationFrame(shuffle);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    };

    if (delay > 0) {
      const delayTimer = setTimeout(startAnimation, delay * 1000);
      return () => clearTimeout(delayTimer);
    } else {
      return startAnimation();
    }
  }, [text, duration, delay, isMounted]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
}

