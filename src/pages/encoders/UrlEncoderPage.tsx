import { useState } from "react";
import { Copy, RotateCcw, ArrowUpDown } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ToolPage } from "@/components/tool-page";

type EncodingMode = "encode" | "decode";
type EncodingType = "component" | "uri" | "uri-component";

export function UrlEncoderPage() {
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
      throw new Error("编码失败: " + (error as Error).message);
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
      throw new Error("解码失败: " + (error as Error).message);
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
        toast.success("编码成功");
      } else {
        result = urlDecode(input, encodingType);
        toast.success("解码成功");
      }
      setOutput(result);
    } catch (error) {
      toast.error("处理失败", {
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
      toast.success("已复制到剪贴板");
    } catch (error) {
      toast.error("复制失败");
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
      } catch (error) {
        setOutput("");
      }
    } else {
      setOutput("");
    }
  };

  const getEncodingTypeDescription = (type: EncodingType): string => {
    switch (type) {
      case "component":
        return "适用于 URL 参数值的编码，会编码所有特殊字符";
      case "uri":
        return "适用于完整 URI 的编码，保留 URI 结构字符";
      case "uri-component":
        return "严格的组件编码，包括 !'()*";
      default:
        return "";
    }
  };

  return (
    <ToolPage title="URL 编解码" description="对 URL 和 URL 组件进行编码和解码">
      <div className="space-y-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>配置选项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label>模式:</Label>
                <Button
                  onClick={toggleMode}
                  variant="outline"
                  size="sm"
                  className="min-w-[100px]"
                >
                  <ArrowUpDown className="w-4 h-4 mr-1" />
                  {mode === "encode" ? "编码" : "解码"}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Label>编码类型:</Label>
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
                    <SelectItem value="component">URL 组件 (推荐)</SelectItem>
                    <SelectItem value="uri">完整 URI</SelectItem>
                    <SelectItem value="uri-component">严格组件</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button onClick={processInput} size="sm">
                  {mode === "encode" ? "编码" : "解码"}
                </Button>
                <Button onClick={clearAll} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  清空
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>当前模式:</strong>{" "}
              {getEncodingTypeDescription(encodingType)}
            </div>
          </CardContent>
        </Card>

        {/* Input/Output */}
        <Card>
          <CardHeader>
            <CardTitle>URL {mode === "encode" ? "编码" : "解码"}工具</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input */}
            <div className="space-y-2">
              <Label>输入 ({mode === "encode" ? "原文" : "编码文本"}):</Label>
              <Textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  mode === "encode"
                    ? "输入需要编码的 URL 或文本..."
                    : "输入需要解码的 URL 编码文本..."
                }
                className="min-h-[120px] font-mono"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  输出 ({mode === "encode" ? "编码结果" : "解码结果"}):
                </Label>
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
                placeholder={
                  mode === "encode"
                    ? "编码后的结果将显示在这里..."
                    : "解码后的结果将显示在这里..."
                }
                className="min-h-[120px] font-mono bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">编码类型说明</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <strong>URL 组件:</strong> 适用于 URL 参数值，如
                    ?param=value
                  </li>
                  <li>
                    <strong>完整 URI:</strong> 适用于完整的 URL，保留 :/?#[]
                    等字符
                  </li>
                  <li>
                    <strong>严格组件:</strong> 更严格的编码，包括 !'()* 字符
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">常见使用场景</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• URL 参数值编码</li>
                  <li>• 查询字符串处理</li>
                  <li>• API 请求参数编码</li>
                  <li>• 表单数据编码</li>
                  <li>• 文件名URL编码</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
