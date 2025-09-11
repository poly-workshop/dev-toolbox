import { useState } from "react";
import { Copy, RotateCcw, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToolPage } from "@/components/tool-page";

type EncodingMode = "encode" | "decode";
type EncodingType = "component" | "uri" | "uri-component";

export function UrlEncoderPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<EncodingMode>("encode");
  const [encodingType, setEncodingType] = useState<EncodingType>("component");

  // URL encoding functions
  const urlEncode = (text: string, type: EncodingType): string => {
    try {
      switch (type) {
        case "component":
          return encodeURIComponent(text);
        case "uri":
          return encodeURI(text);
        case "uri-component":
          return encodeURIComponent(text).replace(
            /[!'()*]/g,
            (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
          );
        default:
          return encodeURIComponent(text);
      }
    } catch (error) {
      throw new Error(t("tools.url.encodeError") + (error as Error).message);
    }
  };

  // URL decoding functions
  const urlDecode = (text: string, type: EncodingType): string => {
    try {
      switch (type) {
        case "component":
        case "uri-component":
          return decodeURIComponent(text);
        case "uri":
          return decodeURI(text);
        default:
          return decodeURIComponent(text);
      }
    } catch (error) {
      throw new Error(t("tools.url.decodeError") + (error as Error).message);
    }
  };

  // Process the input based on current mode
  const processInput = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      let result: string;
      if (mode === "encode") {
        result = urlEncode(input, encodingType);
        toast.success(t("tools.url.encodeSuccess"));
      } else {
        result = urlDecode(input, encodingType);
        toast.success(t("tools.url.decodeSuccess"));
      }
      setOutput(result);
    } catch (error) {
      toast.error(t("tools.url.processingError"), {
        description: (error as Error).message,
      });
      setOutput("");
    }
  };

  // Toggle between encode and decode modes
  const toggleMode = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    // Swap input and output when toggling mode
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  // Copy output to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("tools.base64.copySuccess"));
    } catch {
      toast.error(t("tools.base64.copyError"));
    }
  };

  // Clear all inputs
  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  // Auto-process when input or settings change
  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      try {
        let result: string;
        if (mode === "encode") {
          result = urlEncode(value, encodingType);
        } else {
          result = urlDecode(value, encodingType);
        }
        setOutput(result);
      } catch {
        setOutput("");
      }
    } else {
      setOutput("");
    }
  };

  const getEncodingTypeDescription = (type: EncodingType): string => {
    switch (type) {
      case "component":
        return t("tools.url.componentDesc");
      case "uri":
        return t("tools.url.uriDesc");
      case "uri-component":
        return t("tools.url.strictComponentDesc");
      default:
        return "";
    }
  };

  return (
    <ToolPage
      title={t("tools.url.title")}
      description={t("tools.url.description")}
    >
      <div className="space-y-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{t("tools.base64.configOptions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label>{t("tools.url.mode")}</Label>
                <Button
                  onClick={toggleMode}
                  variant="outline"
                  size="sm"
                  className="min-w-[100px]"
                >
                  <ArrowUpDown className="w-4 h-4 mr-1" />
                  {mode === "encode"
                    ? t("tools.url.encode")
                    : t("tools.url.decode")}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Label>{t("tools.url.encodingType")}</Label>
                <Select
                  value={encodingType}
                  onValueChange={(value: EncodingType) =>
                    setEncodingType(value)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="component">
                      {t("tools.url.component")}
                    </SelectItem>
                    <SelectItem value="uri">{t("tools.url.uri")}</SelectItem>
                    <SelectItem value="uri-component">
                      {t("tools.url.strictComponent")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button onClick={processInput} size="sm">
                  {mode === "encode"
                    ? t("tools.url.encode")
                    : t("tools.url.decode")}
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {t("common.clear")}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>{t("tools.url.currentMode")}</strong>{" "}
              {getEncodingTypeDescription(encodingType)}
            </div>
          </CardContent>
        </Card>

        {/* Input/Output */}
        <Card>
          <CardHeader>
            <CardTitle>
              URL{" "}
              {mode === "encode"
                ? t("tools.url.encode")
                : t("tools.url.decode")}
              {t("tools.url.tool")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input */}
            <div className="space-y-2">
              <Label>
                {t("tools.url.input")} (
                {mode === "encode"
                  ? t("tools.url.originalText")
                  : t("tools.url.encodedText")}
                ):
              </Label>
              <Textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  mode === "encode"
                    ? t("tools.url.encodePlaceholder")
                    : t("tools.url.decodePlaceholder")
                }
                className="min-h-[120px] font-mono"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {t("tools.url.output")} (
                  {mode === "encode"
                    ? t("tools.url.encodeResult")
                    : t("tools.url.decodeResult")}
                  ):
                </Label>
                {output && (
                  <Button
                    onClick={() => copyToClipboard(output)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {t("common.copy")}
                  </Button>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder={
                  mode === "encode"
                    ? t("tools.url.encodeOutputPlaceholder")
                    : t("tools.url.decodeOutputPlaceholder")
                }
                className="min-h-[120px] font-mono bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>{t("tools.url.usage")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">
                  {t("tools.url.typeDescription")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <strong>{t("tools.url.component")}:</strong>{" "}
                    {t("tools.url.componentUsage")}
                  </li>
                  <li>
                    <strong>{t("tools.url.uri")}:</strong>{" "}
                    {t("tools.url.uriUsage")}
                  </li>
                  <li>
                    <strong>{t("tools.url.strictComponent")}:</strong>{" "}
                    {t("tools.url.strictUsage")}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  {t("tools.url.commonUseCases")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t("tools.url.urlParams")}</li>
                  <li>• {t("tools.url.queryString")}</li>
                  <li>• {t("tools.url.apiParams")}</li>
                  <li>• {t("tools.url.formData")}</li>
                  <li>• {t("tools.url.filename")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
