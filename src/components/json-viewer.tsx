import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface JsonViewerProps {
  value: string;
  placeholder?: string;
  className?: string;
}

export function JsonViewer({ value, placeholder, className }: JsonViewerProps) {
  const { theme } = useTheme();

  // Use dark theme for dark mode, light theme for light mode
  const syntaxTheme = theme === "dark" ? oneDark : oneLight;

  // If no value, show placeholder
  if (!value.trim()) {
    return (
      <div
        className={`min-h-[200px] font-mono bg-muted rounded-md border px-3 py-2 text-muted-foreground flex items-start ${className || ""}`}
      >
        {placeholder || "No content to display..."}
      </div>
    );
  }

  return (
    <div className={`rounded-md border overflow-hidden ${className || ""}`}>
      <SyntaxHighlighter
        language="json"
        style={syntaxTheme}
        customStyle={{
          margin: 0,
          minHeight: "200px",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
        wrapLongLines={true}
        showLineNumbers={false}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
