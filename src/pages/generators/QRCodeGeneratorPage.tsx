import { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Download, RotateCcw } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
import { Textarea } from "@/components/ui/textarea";
import { ToolPage } from "@/components/tool-page";

interface QRCodeOptions {
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  margin: number;
  width: number;
  color: {
    dark: string;
    light: string;
  };
}

export function QRCodeGeneratorPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [options, setOptions] = useState<QRCodeOptions>({
    errorCorrectionLevel: "M",
    margin: 4,
    width: 256,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = useCallback(async () => {
    if (!input.trim()) {
      setQrDataUrl("");
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, input, {
          errorCorrectionLevel: options.errorCorrectionLevel,
          margin: options.margin,
          width: options.width,
          color: options.color,
        });

        // Convert canvas to data URL for display and download
        const dataUrl = canvas.toDataURL("image/png");
        setQrDataUrl(dataUrl);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error generating QR code:", error);
      toast.error(t("tools.qrcode.generateError"));
      setQrDataUrl("");
    } finally {
      setIsGenerating(false);
    }
  }, [input, options]);

  // Generate QR code when input or options change
  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const handleClear = () => {
    setInput("");
    setQrDataUrl("");
  };

  const handleCopyImage = async () => {
    if (!qrDataUrl) {
      toast.error(t("tools.qrcode.noQrCodeToCopy"));
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      toast.success(t("tools.qrcode.qrCodeCopied"));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error copying QR code:", error);
      toast.error(t("tools.qrcode.copyError"));
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) {
      toast.error(t("tools.qrcode.noQrCodeToDownload"));
      return;
    }

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrDataUrl;
    link.click();
    toast.success(t("tools.qrcode.qrCodeDownloaded"));
  };

  return (
    <ToolPage
      title={t("tools.qrcode.title")}
      description={t("tools.qrcode.description")}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">{t("common.input")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-input">{t("tools.qrcode.textOrUrl")}</Label>
              <Textarea
                id="qr-input"
                placeholder={t("tools.qrcode.inputPlaceholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[100px] resize-y"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!input}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("common.clear")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">{t("tools.base64.configOptions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="error-correction">纠错级别</Label>
                <Select
                  value={options.errorCorrectionLevel}
                  onValueChange={(value: "L" | "M" | "Q" | "H") =>
                    setOptions((prev) => ({
                      ...prev,
                      errorCorrectionLevel: value,
                    }))
                  }
                >
                  <SelectTrigger id="error-correction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">低 (L) - ~7%</SelectItem>
                    <SelectItem value="M">中 (M) - ~15%</SelectItem>
                    <SelectItem value="Q">高 (Q) - ~25%</SelectItem>
                    <SelectItem value="H">最高 (H) - ~30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-width">尺寸 (像素)</Label>
                <Input
                  id="qr-width"
                  type="number"
                  min="100"
                  max="1000"
                  step="50"
                  value={options.width}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      width: parseInt(e.target.value) || 256,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-margin">边距</Label>
                <Input
                  id="qr-margin"
                  type="number"
                  min="0"
                  max="20"
                  value={options.margin}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      margin: parseInt(e.target.value) || 4,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-color-dark">前景色</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-color-dark"
                    type="color"
                    value={options.color.dark}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        color: { ...prev.color, dark: e.target.value },
                      }))
                    }
                    className="w-16 h-9 p-1"
                  />
                  <Input
                    type="text"
                    value={options.color.dark}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        color: { ...prev.color, dark: e.target.value },
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-color-light">背景色</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-color-light"
                    type="color"
                    value={options.color.light}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        color: { ...prev.color, light: e.target.value },
                      }))
                    }
                    className="w-16 h-9 p-1"
                  />
                  <Input
                    type="text"
                    value={options.color.light}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        color: { ...prev.color, light: e.target.value },
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">{t("tools.qrcode.generatedQrCode")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Hidden canvas for QR code generation */}
              <canvas
                ref={canvasRef}
                style={{ position: "absolute", left: "-9999px" }}
              />

              <div className="flex justify-center items-center min-h-[200px] border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                {isGenerating ? (
                  <div className="text-muted-foreground">生成中...</div>
                ) : input && qrDataUrl ? (
                  <div className="text-center space-y-4">
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-muted-foreground">
                      {t("tools.qrcode.autoGenerate")}
                    </div>
                  </div>
                )}
              </div>

              {qrDataUrl && (
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleCopyImage}>
                    <Copy className="w-4 h-4 mr-2" />
                    复制图片
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-medium mb-2">支持的内容类型</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    • <strong>纯文本:</strong> 任何文本内容
                  </li>
                  <li>
                    • <strong>URL:</strong> 网址链接
                  </li>
                  <li>
                    • <strong>邮箱:</strong> mailto:example@domain.com
                  </li>
                  <li>
                    • <strong>电话:</strong> tel:+1234567890
                  </li>
                  <li>
                    • <strong>WiFi:</strong> WIFI:T:WPA;S:network;P:password;;
                  </li>
                  <li>
                    • <strong>地理位置:</strong> geo:lat,lng
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">纠错级别说明</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    • <strong>低 (L):</strong> 可恢复约 7% 的数据，适合清晰环境
                  </li>
                  <li>
                    • <strong>中 (M):</strong> 可恢复约 15% 的数据，推荐使用
                  </li>
                  <li>
                    • <strong>高 (Q):</strong> 可恢复约 25% 的数据，适合工业环境
                  </li>
                  <li>
                    • <strong>最高 (H):</strong> 可恢复约 30%
                    的数据，适合恶劣环境
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
