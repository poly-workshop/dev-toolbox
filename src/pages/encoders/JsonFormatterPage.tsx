import { useState } from "react";
import { Copy, RotateCcw, Check, X } from "lucide-react";
import { toast } from "sonner";

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

export function JsonFormatterPage() {
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
      toast.success("JSON formatted successfully");
    } catch (error) {
      toast.error("Invalid JSON", {
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
      toast.success("JSON minified successfully");
    } catch (error) {
      toast.error("Invalid JSON", {
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
      toast.success("JSON is valid");
    } catch (error) {
      const errorMessage = (error as Error).message;
      setValidationResult({ isValid: false, error: errorMessage });
      toast.error("JSON is invalid", {
        description: errorMessage,
      });
    }
  };

  // Copy output to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Clear all inputs
  const clearAll = () => {
    setInput("");
    setOutput("");
    setValidationResult(null);
  };

  return (
    <ToolPage title="JSON 格式化" description="格式化、压缩和验证 JSON 数据">
      <Tabs defaultValue="format" className="w-full">
        <TabsList>
          <TabsTrigger value="format">格式化</TabsTrigger>
          <TabsTrigger value="minify">压缩</TabsTrigger>
          <TabsTrigger value="validate">验证</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON 格式化工具</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Configuration */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="indent-size">缩进大小:</Label>
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
                    格式化
                  </Button>
                  <Button onClick={clearAll} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    清空
                  </Button>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label>输入 JSON:</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="粘贴或输入 JSON 数据..."
                  className="min-h-[200px] font-mono"
                />
              </div>

              {/* Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>格式化结果:</Label>
                  {output && (
                    <Button
                      onClick={() => copyToClipboard(output)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </Button>
                  )}
                </div>
                <Textarea
                  value={output}
                  readOnly
                  placeholder="格式化后的 JSON 将显示在这里..."
                  className="min-h-[200px] font-mono bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON 压缩工具</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={minifyJson} size="sm">
                  压缩
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  清空
                </Button>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label>输入 JSON:</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="粘贴或输入 JSON 数据..."
                  className="min-h-[200px] font-mono"
                />
              </div>

              {/* Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>压缩结果:</Label>
                  {output && (
                    <Button
                      onClick={() => copyToClipboard(output)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </Button>
                  )}
                </div>
                <Textarea
                  value={output}
                  readOnly
                  placeholder="压缩后的 JSON 将显示在这里..."
                  className="min-h-[200px] font-mono bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON 验证工具</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={validateJson} size="sm">
                  验证
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  清空
                </Button>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label>输入 JSON:</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="粘贴或输入需要验证的 JSON 数据..."
                  className="min-h-[200px] font-mono"
                />
              </div>

              {/* Validation Result */}
              {validationResult && (
                <Card className={`border-2 ${
                  validationResult.isValid 
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                    : "border-red-500 bg-red-50 dark:bg-red-950/20"
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      {validationResult.isValid ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          validationResult.isValid ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                        }`}>
                          {validationResult.isValid ? "JSON 格式正确" : "JSON 格式错误"}
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
