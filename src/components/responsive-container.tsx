import React from "react";

import { useDeviceType } from "@/hooks/use-mobile";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({
  children,
  className = "",
}: ResponsiveContainerProps) {
  const deviceType = useDeviceType();

  const containerClasses = {
    mobile: "px-3 py-4 space-y-4",
    tablet: "px-4 py-5 space-y-5",
    desktop: "px-6 py-6 space-y-6",
    unknown: "px-4 py-4 space-y-4",
  };

  return (
    <div
      className={`w-full max-w-7xl mx-auto ${containerClasses[deviceType]} ${className}`}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveGrid({
  children,
  className = "",
  cols = { mobile: 1, tablet: 2, desktop: 2 },
}: ResponsiveGridProps) {
  // Map numbers to specific Tailwind classes to ensure they are included in the build
  const getGridClass = (colCount: number) => {
    switch (colCount) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 6:
        return "grid-cols-6";
      default:
        return "grid-cols-1";
    }
  };

  const mobileClass = getGridClass(cols.mobile || 1);
  const tabletClass = `md:${getGridClass(cols.tablet || 2)}`;
  const desktopClass = `lg:${getGridClass(cols.desktop || 2)}`;

  return (
    <div
      className={`grid gap-4 ${mobileClass} ${tabletClass} ${desktopClass} ${className}`}
    >
      {children}
    </div>
  );
}

interface ResponsiveTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  deviceType?: "mobile" | "tablet" | "desktop" | "unknown";
}

export function ResponsiveTextarea({
  deviceType: propDeviceType,
  className = "",
  ...props
}: ResponsiveTextareaProps) {
  const detectedDeviceType = useDeviceType();
  const deviceType = propDeviceType || detectedDeviceType;

  const heightClasses = {
    mobile: "h-20",
    tablet: "h-24",
    desktop: "h-32",
    unknown: "h-24",
  };

  const paddingClasses = {
    mobile: "p-2",
    tablet: "p-2.5",
    desktop: "p-3",
    unknown: "p-2.5",
  };

  const textClasses = {
    mobile: "text-sm",
    tablet: "text-sm",
    desktop: "text-base",
    unknown: "text-sm",
  };

  return (
    <textarea
      className={`w-full border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring ${heightClasses[deviceType]} ${paddingClasses[deviceType]} ${textClasses[deviceType]} ${className}`}
      {...props}
    />
  );
}
