import { useState } from "react";
import { Copy, RotateCcw, Check, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToolPage } from "@/components/tool-page";
import { JsonViewer } from "@/components/json-viewer";

export function JsonFormatterPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState("2");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
  } | null>(null);

  // Format JSON with pretty printing
  const formatJson = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize));
      setOutput(formatted);
      toast.success(t("tools.json.formatSuccess"));
    } catch (error) {
      toast.error(t("tools.json.invalidJson"), {
        description: (error as Error).message,
      });
      setOutput("");
    }
  };

  // Minify JSON by removing whitespace
  const minifyJson = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      toast.success(t("tools.json.minifySuccess"));
    } catch (error) {
      toast.error(t("tools.json.invalidJson"), {
        description: (error as Error).message,
      });
      setOutput("");
    }
  };

  // Validate JSON and show detailed error information
  const validateJson = () => {
    if (!input.trim()) {
      setValidationResult(null);
      return;
    }

    try {
      JSON.parse(input);
      setValidationResult({ isValid: true });
      toast.success(t("tools.json.validJson"));
    } catch (error) {
      const errorMessage = (error as Error).message;
      setValidationResult({ isValid: false, error: errorMessage });
      toast.error(t("tools.json.invalidJsonTitle"), {
        description: errorMessage,
      });
    }
  };

  // Copy output to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("common.copy") + " " + t("common.success").toLowerCase());
    } catch {
      toast.error(t("tools.base64.copyError"));
    }
  };

  // Clear all inputs
  const clearAll = () => {
    setInput("");
    setOutput("");
    setValidationResult(null);
  };

  return (
    <ToolPage
      title={t("tools.json.title")}
      description={t("tools.json.description")}
    >
      <Tabs defaultValue="format" className="w-full">
        <TabsList>
          <TabsTrigger value="format">{t("tools.json.format")}</TabsTrigger>
          <TabsTrigger value="minify">{t("tools.json.minify")}</TabsTrigger>
          <TabsTrigger value="validate">{t("tools.json.validate")}</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tools.json.formatTool")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Configuration */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="indent-size">
                    {t("tools.json.indentSize")}
                  </Label>
                  <Select value={indentSize} onValueChange={setIndentSize}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={formatJson} size="sm">
                    {t("tools.json.format")}
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {t("common.clear")}
                  </Button>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label>{t("tools.json.inputJson")}</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("tools.json.inputPlaceholder")}
                  className="min-h-[200px] font-mono"
                />
              </div>

              {/* Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("tools.json.formatResult")}</Label>
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
                <JsonViewer
                  value={output}
                  placeholder={t("tools.json.formatPlaceholder")}
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tools.json.minifyTool")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={minifyJson} size="sm">
                  {t("tools.json.minify")}
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {t("common.clear")}
                </Button>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label>{t("tools.json.inputJson")}</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("tools.json.inputPlaceholder")}
                  className="min-h-[200px] font-mono"
                />
              </div>

              {/* Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("tools.json.minifyResult")}</Label>
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
                <JsonViewer
                  value={output}
                  placeholder={t("tools.json.minifyPlaceholder")}
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tools.json.validateTool")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={validateJson} size="sm">
                  {t("tools.json.validate")}
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {t("common.clear")}
                </Button>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label>{t("tools.json.inputJson")}</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("tools.json.validatePlaceholder")}
                  className="min-h-[200px] font-mono"
                />
              </div>

              {/* Validation Result */}
              {validationResult && (
                <Card
                  className={`border-2 ${
                    validationResult.isValid
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-red-500 bg-red-50 dark:bg-red-950/20"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      {validationResult.isValid ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            validationResult.isValid
                              ? "text-green-700 dark:text-green-300"
                              : "text-red-700 dark:text-red-300"
                          }`}
                        >
                          {validationResult.isValid
                            ? t("tools.json.validJson")
                            : t("tools.json.invalidJsonTitle")}
                        </p>
                        {validationResult.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {validationResult.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolPage>
  );
}
