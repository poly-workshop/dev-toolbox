import React from "react";

interface ToolPageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ToolPage({ title, description, children }: ToolPageProps) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}
