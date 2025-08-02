import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ArrowRight, Clock, Copy } from "lucide-react";
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
import { ToolPage } from "@/components/tool-page";

type TimestampUnit = "seconds" | "milliseconds";
type TimeFormat =
  | "local-readable"
  | "utc-readable"
  | "rfc3339"
  | "iso8601-basic"
  | "iso8601-extended"
  | "rfc2822";

interface TimestampOptions {
  unit: TimestampUnit;
  format: TimeFormat;
}

export function TimestampPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"timestamp-to-time" | "time-to-timestamp">(
    "timestamp-to-time",
  );
  const [options, setOptions] = useState<TimestampOptions>({
    unit: "seconds",
    format: "local-readable",
  });

  // Use Rust backend for timestamp conversion
  const handleConvert = async (
    inputText: string,
    from: "timestamp" | "time",
  ) => {
    if (!inputText.trim()) {
      if (from === "timestamp") setOutput("");
      if (from === "time") setOutput("");
      return;
    }
    try {
      const response = (await invoke("convert_timestamp", {
        request: {
          input: inputText,
          mode:
            from === "timestamp" ? "timestamp-to-time" : "time-to-timestamp",
          unit: options.unit,
          format: options.format,
        },
      })) as { success: boolean; result?: string; error?: string };
      if (response.success && response.result) {
        if (from === "timestamp") setOutput(response.result);
        if (from === "time") setOutput(response.result);
      } else {
        if (from === "timestamp") setOutput("");
        if (from === "time") setOutput("");
      }
    } catch (error) {
      toast.error(t("tools.timestamp.conversionError"), {
        description: (error as Error).message,
      });
      if (from === "timestamp") setOutput("");
      if (from === "time") setOutput("");
    }
  };

  // Only clear inputs when options change, not when mode changes
  useEffect(() => {
    setInput("");
    setOutput("");
  }, [options.unit, options.format]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Immediately clear output if input is empty
    if (!value.trim()) {
      setOutput("");
      return;
    }

    if (mode === "timestamp-to-time") {
      handleConvert(value, "timestamp");
    } else {
      handleConvert(value, "time");
    }
  };

  // Clear inputs when options change
  useEffect(() => {
    setInput("");
    setOutput("");
  }, [options.unit, options.format]);

  const handleSwapMode = () => {
    const newMode =
      mode === "timestamp-to-time" ? "time-to-timestamp" : "timestamp-to-time";
    setMode(newMode);
    // Swap input and output like Base64Page does
    setInput(output);
    setOutput(input);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("tools.timestamp.copySuccess"));
    } catch (error) {
      toast.error(t("tools.timestamp.copyError"), {
        description: (error as Error).message,
      });
    }
  };

  const getTimePlaceholder = () => {
    if (mode === "timestamp-to-time") {
      return t("tools.timestamp.timestampPlaceholder");
    } else {
      // Return different placeholders based on time format
      switch (options.format) {
        case "local-readable":
          return t("tools.timestamp.timePlaceholderLocalReadable");
        case "utc-readable":
          return t("tools.timestamp.timePlaceholderUtcReadable");
        case "rfc3339":
          return t("tools.timestamp.timePlaceholderRfc3339");
        case "iso8601-basic":
          return t("tools.timestamp.timePlaceholderIso8601Basic");
        case "iso8601-extended":
          return t("tools.timestamp.timePlaceholderIso8601Extended");
        case "rfc2822":
          return t("tools.timestamp.timePlaceholderRfc2822");
        default:
          return t("tools.timestamp.timePlaceholder");
      }
    }
  };

  const handleNow = async () => {
    try {
      if (mode === "timestamp-to-time") {
        // In timestamp-to-time mode, get current timestamp from backend
        const response = (await invoke("get_current_time", {
          unit: options.unit,
          format: null,
        })) as { success: boolean; result?: string; error?: string };

        if (response.success && response.result) {
          setInput(response.result);
          handleConvert(response.result, "timestamp");
        }
      } else {
        // In time-to-timestamp mode, get formatted time from backend
        const response = (await invoke("get_current_time", {
          unit: "formatted",
          format: options.format,
        })) as { success: boolean; result?: string; error?: string };

        if (response.success && response.result) {
          setInput(response.result);
          handleConvert(response.result, "time");
        }
      }
    } catch (error) {
      toast.error(t("tools.timestamp.conversionError"), {
        description: (error as Error).message,
      });
    }
  };

  return (
    <ToolPage
      title={t("tools.timestamp.title")}
      description={t("tools.timestamp.description")}
    >
      <div className="space-y-6">
        {/* Conversion area with integrated mode selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {t("tools.timestamp.title")}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 px-3"
                >
                  {t("common.clear")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNow}
                  className="h-8 px-3"
                >
                  {t("tools.timestamp.now")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSwapMode}
                  className="h-8 px-3"
                >
                  {mode === "timestamp-to-time"
                    ? t("tools.timestamp.timestampToTime")
                    : t("tools.timestamp.timeToTimestamp")}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configuration options */}
            <div className="flex w-full items-center gap-4 pb-4 border-b">
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("tools.timestamp.timestampUnit")}:
                </Label>
                <Select
                  value={options.unit}
                  onValueChange={(value: TimestampUnit) =>
                    setOptions((prev) => ({ ...prev, unit: value }))
                  }
                >
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">
                      {t("tools.timestamp.seconds")}
                    </SelectItem>
                    <SelectItem value="milliseconds">
                      {t("tools.timestamp.milliseconds")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {t("tools.timestamp.timeFormat")}:
                </Label>
                <Select
                  value={options.format}
                  onValueChange={(value: TimeFormat) =>
                    setOptions((prev) => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local-readable">
                      {t("tools.timestamp.localReadable")}
                    </SelectItem>
                    <SelectItem value="utc-readable">
                      {t("tools.timestamp.utcReadable")}
                    </SelectItem>
                    <SelectItem value="rfc3339">
                      {t("tools.timestamp.rfc3339")}
                    </SelectItem>
                    <SelectItem value="iso8601-basic">
                      {t("tools.timestamp.iso8601Basic")}
                    </SelectItem>
                    <SelectItem value="iso8601-extended">
                      {t("tools.timestamp.iso8601Extended")}
                    </SelectItem>
                    <SelectItem value="rfc2822">
                      {t("tools.timestamp.rfc2822")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Input/Output section */}
            <div className="flex items-base gap-4">
              {/* Input section */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {mode === "timestamp-to-time"
                      ? t("tools.timestamp.timestampInput")
                      : t("tools.timestamp.timeInput")}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(input)}
                    disabled={!input}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {t("common.copy")}
                  </Button>
                </div>
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={getTimePlaceholder()}
                  className="text-base"
                />
              </div>

              {/* Direction indicator */}
              <div className="flex items-end pb-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Output section */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {mode === "timestamp-to-time"
                      ? t("tools.timestamp.timeOutput")
                      : t("tools.timestamp.timestampOutput")}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output)}
                    disabled={!output}
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {t("common.copy")}
                  </Button>
                </div>
                <Input
                  value={output}
                  readOnly
                  placeholder={
                    mode === "timestamp-to-time"
                      ? t("tools.timestamp.timeOutputPlaceholder")
                      : t("tools.timestamp.timestampOutputPlaceholder")
                  }
                  className="text-base bg-muted/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
