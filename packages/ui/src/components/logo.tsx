"use client";

import { cn } from "@scrutis/ui/lib/utils";
/**
 * Renders the "Scrutis" S-shaped logo.
 * It uses a purple-to-teal gradient by default, or `currentColor` if `uniColor` is true.
 */
const Logo = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-auto", className)} // Default size, can be overridden
      aria-label="Scrutis Logo"
    >
      <defs>
        {/* Gradient definition for the logo */}
        <linearGradient
          id="logo-gradient"
          x1="50"
          y1="0"
          x2="50"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
      {/* This is the bold "S" path */}
      <path
        d="M62.5 0C44.5 0 32.2222 10.2206 25 21.6033V0H0V45.2066C0 63.2066 12.2222 73.4272 25 84.79L24.975 84.77C25.3 85.06 25.75 85.45 26.25 85.87C31.25 90.17 37.5 95.33 37.5 100H62.5C62.5 82 50.2778 71.7794 37.5 60.3967V100H100V54.7934C100 36.7934 87.778 26.5728 75 15.21L75.025 15.23C74.7 14.94 74.25 14.55 73.75 14.13C68.75 9.83 62.5 4.67 62.5 0Z"
        fill={uniColor ? "currentColor" : "url(#logo-gradient)"}
      />
    </svg>
  );
};

export default Logo;

