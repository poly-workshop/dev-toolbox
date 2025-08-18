import { useEffect, useState, useRef } from "react";
import { Copy, RotateCcw, Upload, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveGrid,
  ResponsiveTextarea,
} from "@/components/responsive-container";
import { ToolPage } from "@/components/tool-page";

type Base64Variant =
  | "standard"
  | "url-safe"
  | "no-padding"
  | "url-safe-no-padding";

interface Base64Options {
  variant: Base64Variant;
}

type InputMode = "text" | "file";

export function Base64Page() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<Base64Options>({
    variant: "standard",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size limit: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const base64Encode = (text: string, variant: Base64Variant): string => {
    try {
      // Use TextEncoder to handle UTF-8 encoding
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // Convert to string for base64 encoding
      let binary = "";
      data.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });

      let encoded = btoa(binary);

      switch (variant) {
        case "url-safe":
          return encoded.replace(/\+/g, "-").replace(/\//g, "_");
        case "no-padding":
          return encoded.replace(/=/g, "");
        case "url-safe-no-padding":
          return encoded
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
        default:
          return encoded;
      }
    } catch (error) {
      throw new Error(
        t("tools.base64.encodeError") + ": " + (error as Error).message,
      );
    }
  };

  const base64Decode = (encoded: string, variant: Base64Variant): string => {
    try {
      let normalized = encoded;

      // Normalize input based on variant
      switch (variant) {
        case "url-safe":
          normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
          break;
        case "no-padding":
          normalized = encoded;
          break;
        case "url-safe-no-padding":
          normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
          break;
      }

      // Add necessary padding
      const padding = normalized.length % 4;
      if (padding > 0) {
        normalized += "=".repeat(4 - padding);
      }

      const decoded = atob(normalized);

      // Use TextDecoder to handle UTF-8 decoding
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }

      const decoder = new TextDecoder("utf-8");
      return decoder.decode(bytes);
    } catch (error) {
      throw new Error(
        t("tools.base64.decodeError") + ": " + (error as Error).message,
      );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("tools.base64.fileTooLarge"));
      return;
    }

    setSelectedFile(file);
    if (mode === "encode") {
      handleFileEncode(file);
    }
  };

  const handleFileEncode = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (result instanceof ArrayBuffer) {
          // Convert ArrayBuffer to binary string
          const bytes = new Uint8Array(result);
          let binary = "";
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const encoded = btoa(binary);

          // Apply variant formatting
          let finalResult: string;
          switch (options.variant) {
            case "url-safe":
              finalResult = encoded.replace(/\+/g, "-").replace(/\//g, "_");
              break;
            case "no-padding":
              finalResult = encoded.replace(/=/g, "");
              break;
            case "url-safe-no-padding":
              finalResult = encoded
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=/g, "");
              break;
            default:
              finalResult = encoded;
          }

          setOutput(finalResult);
        }
      } catch (error) {
        toast.error(t("tools.base64.fileReadError"), {
          description: (error as Error).message,
        });
        setOutput("");
      }
    };
    reader.onerror = () => {
      toast.error(t("tools.base64.fileReadError"));
      setOutput("");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileDownload = () => {
    if (!output.trim()) {
      toast.error(t("tools.base64.downloadError"));
      return;
    }

    try {
      // Normalize Base64 string based on variant
      let normalized = output;
      switch (options.variant) {
        case "url-safe":
          normalized = output.replace(/-/g, "+").replace(/_/g, "/");
          break;
        case "no-padding":
          normalized = output;
          break;
        case "url-safe-no-padding":
          normalized = output.replace(/-/g, "+").replace(/_/g, "/");
          break;
      }

      // Add necessary padding
      const padding = normalized.length % 4;
      if (padding > 0) {
        normalized += "=".repeat(4 - padding);
      }

      // Convert base64 to binary
      const binaryString = atob(normalized);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create download
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedFile?.name || "decoded_file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t("tools.base64.downloadSuccess"));
    } catch (error) {
      toast.error(t("tools.base64.downloadError"), {
        description: (error as Error).message,
      });
    }
  };

  const handleConvert = (inputText?: string) => {
    const textToProcess = inputText !== undefined ? inputText : input;

    if (!textToProcess.trim()) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        const result = base64Encode(textToProcess, options.variant);
        setOutput(result);
      } else {
        const result = base64Decode(textToProcess, options.variant);
        setOutput(result);
      }
    } catch (error) {
      toast.error((error as Error).message);
      setOutput("");
    }
  };

  // Re-convert when options change
  useEffect(() => {
    if (inputMode === "text" && input.trim()) {
      handleConvert();
    } else if (inputMode === "file" && selectedFile && mode === "encode") {
      handleFileEncode(selectedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.variant]);

  // Clear data when switching input modes
  useEffect(() => {
    setInput("");
    setOutput("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [inputMode]);

  const handleSwapMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);

    // For text mode, swap input and output
    if (inputMode === "text") {
      setInput(output);
      setOutput(input);
    } else {
      // For file mode, clear everything when swapping modes
      setSelectedFile(null);
      setOutput("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("tools.base64.copySuccess"));
    } catch (error) {
      toast.error(t("tools.base64.copyError"), {
        description: (error as Error).message,
      });
    }
  };

  const variantDescriptions = {
    standard: t("tools.base64.variantDescriptions.standard"),
    "url-safe": t("tools.base64.variantDescriptions.urlSafe"),
    "no-padding": t("tools.base64.variantDescriptions.noPadding"),
    "url-safe-no-padding": t(
      "tools.base64.variantDescriptions.urlSafeNoPadding",
    ),
  };

  return (
    <ToolPage
      title={t("tools.base64.title")}
      description={t("tools.base64.description")}
    >
      <div className="space-y-6">
        {/* Configuration Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              {t("tools.base64.configOptions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label className="text-xs sm:text-sm">
                  {t("tools.base64.base64Variant")}
                </Label>
                <Select
                  value={options.variant}
                  onValueChange={(value: Base64Variant) =>
                    setOptions({ variant: value })
                  }
                >
                  <SelectTrigger className="h-8 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      {t("tools.base64.variants.standard")}
                    </SelectItem>
                    <SelectItem value="url-safe">
                      {t("tools.base64.variants.urlSafe")}
                    </SelectItem>
                    <SelectItem value="no-padding">
                      {t("tools.base64.variants.noPadding")}
                    </SelectItem>
                    <SelectItem value="url-safe-no-padding">
                      {t("tools.base64.variants.urlSafeNoPadding")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {variantDescriptions[options.variant]}
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                <Label className="text-xs sm:text-sm">
                  {t("tools.base64.operationMode")}
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={mode === "encode" ? "default" : "outline"}
                    onClick={() => {
                      if (mode !== "encode") {
                        handleSwapMode();
                      }
                    }}
                    className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    {t("common.encode")}
                  </Button>
                  <Button
                    variant={mode === "decode" ? "default" : "outline"}
                    onClick={() => {
                      if (mode !== "decode") {
                        handleSwapMode();
                      }
                    }}
                    className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    {t("common.decode")}
                  </Button>
                </div>
              </div>
            </div>
            {/* Show variant description on mobile */}
            <div className="sm:hidden">
              <p className="text-xs text-muted-foreground">
                {variantDescriptions[options.variant]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Input/Output Area */}
        <ResponsiveGrid cols={{ mobile: 1, tablet: 1, desktop: 2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm sm:text-base">
                {mode === "encode"
                  ? t("tools.base64.originalText")
                  : t("tools.base64.base64Encoded")}
              </CardTitle>
              <div className="flex gap-1 sm:gap-2">
                <Button size="sm" variant="outline" onClick={handleSwapMode}>
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClear}
                  className="hidden sm:flex"
                >
                  {t("common.clear")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClear}
                  className="sm:hidden"
                >
                  <span className="text-xs">{t("common.clear").charAt(0)}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                value={inputMode}
                onValueChange={(value) => setInputMode(value as InputMode)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">
                    {t("tools.base64.textInput")}
                  </TabsTrigger>
                  <TabsTrigger value="file">
                    {t("tools.base64.fileInput")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-2">
                  <ResponsiveTextarea
                    value={input}
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData("text/plain");
                      setInput(text);
                      handleConvert(text);
                    }}
                    onChange={(e) => {
                      setInput(e.target.value);
                      handleConvert(e.target.value);
                    }}
                    placeholder={
                      mode === "encode"
                        ? t("tools.base64.inputPlaceholder.encode")
                        : t("tools.base64.inputPlaceholder.decode")
                    }
                  />
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>
                      {input.length} {t("tools.base64.characters")}
                    </span>
                    {input && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(input)}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-2">
                  {mode === "encode" ? (
                    <div className="space-y-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("tools.base64.fileSizeLimit")}
                      </p>
                      {selectedFile && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">{selectedFile.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ResponsiveTextarea
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          handleConvert(e.target.value);
                        }}
                        placeholder={t("tools.base64.inputPlaceholder.decode")}
                      />
                      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                        <span>
                          {input.length} {t("tools.base64.characters")}
                        </span>
                        {input && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(input)}
                            className="h-6 px-2"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm sm:text-base">
                {mode === "encode"
                  ? t("tools.base64.base64Encoded")
                  : t("tools.base64.decodedResult")}
              </CardTitle>
              <div className="flex gap-1 sm:gap-2">
                {output && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(output)}
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    {mode === "decode" && inputMode === "file" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleFileDownload}
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">
                          {t("tools.base64.downloadFile")}
                        </span>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <ResponsiveTextarea
                  value={output}
                  readOnly
                  placeholder={
                    mode === "encode"
                      ? t("tools.base64.outputPlaceholder.encode")
                      : t("tools.base64.outputPlaceholder.decode")
                  }
                  className="bg-muted"
                />
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>
                    {output.length} {t("tools.base64.characters")}
                  </span>
                  {output && mode === "encode" && input && (
                    <span>
                      {t("tools.base64.compressionRatio")}:{" "}
                      {((output.length / input.length) * 100).toFixed(1)}%
                    </span>
                  )}
                  {output && mode === "encode" && selectedFile && (
                    <span>
                      {t("tools.base64.compressionRatio")}:{" "}
                      {((output.length / selectedFile.size) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              {t("tools.base64.usage.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-medium mb-2">
                  {t("tools.base64.usage.variantTitle")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <strong>{t("tools.base64.variants.standard")}:</strong>{" "}
                    {t("tools.base64.usage.standardDesc")}
                  </li>
                  <li>
                    <strong>{t("tools.base64.variants.urlSafe")}:</strong>{" "}
                    {t("tools.base64.usage.urlSafeDesc")}
                  </li>
                  <li>
                    <strong>{t("tools.base64.variants.noPadding")}:</strong>{" "}
                    {t("tools.base64.usage.noPaddingDesc")}
                  </li>
                  <li>
                    <strong>
                      {t("tools.base64.variants.urlSafeNoPadding")}:
                    </strong>{" "}
                    {t("tools.base64.usage.urlSafeNoPaddingDesc")}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  {t("tools.base64.usage.featuresTitle")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t("tools.base64.usage.utf8Support")}</li>
                  <li>• {t("tools.base64.usage.fileSupport")}</li>
                  <li>• {t("tools.base64.usage.realtime")}</li>
                  <li>• {t("tools.base64.usage.oneClickCopy")}</li>
                  <li>• {t("tools.base64.usage.modeSwitch")}</li>
                  <li>• {t("tools.base64.usage.errorHandling")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
