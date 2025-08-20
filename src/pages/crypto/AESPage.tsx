import { useEffect, useState } from "react";
import { Copy, RotateCcw, Key } from "lucide-react";
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
import {
  ResponsiveGrid,
  ResponsiveTextarea,
} from "@/components/responsive-container";
import { ToolPage } from "@/components/tool-page";

type AESKeySize = 128 | 192 | 256;
type AESMode = "GCM" | "CBC";

interface AESOptions {
  keySize: AESKeySize;
  mode: AESMode;
}

export function AESPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [key, setKey] = useState("");
  const [iv, setIv] = useState("");
  const [options, setOptions] = useState<AESOptions>({
    keySize: 256,
    mode: "GCM",
  });

  // Generate a random key
  const generateKey = async () => {
    try {
      const keyBytes = options.keySize / 8;
      const randomKey = crypto.getRandomValues(new Uint8Array(keyBytes));
      const keyBase64 = btoa(String.fromCharCode(...randomKey));
      setKey(keyBase64);
      toast.success(t("tools.aes.keyGenerated"));
    } catch (error) {
      toast.error(t("tools.aes.keyGenerationError"), {
        description: (error as Error).message,
      });
    }
  };

  // Generate a random IV
  const generateIV = async () => {
    try {
      const ivBytes = options.mode === "GCM" ? 12 : 16; // GCM uses 12 bytes, CBC uses 16 bytes
      const randomIV = crypto.getRandomValues(new Uint8Array(ivBytes));
      const ivBase64 = btoa(String.fromCharCode(...randomIV));
      setIv(ivBase64);
      toast.success(t("tools.aes.ivGenerated"));
    } catch (error) {
      toast.error(t("tools.aes.ivGenerationError"), {
        description: (error as Error).message,
      });
    }
  };

  // Convert base64 string to ArrayBuffer
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Convert Uint8Array to base64 string
  const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
    return btoa(String.fromCharCode(...bytes));
  };

  // Import key for Web Crypto API
  const importKey = async (keyBase64: string): Promise<CryptoKey> => {
    const keyBuffer = base64ToArrayBuffer(keyBase64);
    return await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: `AES-${options.mode}` },
      false,
      ["encrypt", "decrypt"],
    );
  };

  // AES encryption
  const aesEncrypt = async (text: string): Promise<string> => {
    try {
      if (!key.trim()) {
        throw new Error(t("tools.aes.keyRequired"));
      }

      if (!iv.trim()) {
        throw new Error(t("tools.aes.ivRequired"));
      }

      const cryptoKey = await importKey(key);
      const ivBuffer = base64ToArrayBuffer(iv);
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      const algorithm =
        options.mode === "GCM"
          ? { name: "AES-GCM", iv: ivBuffer }
          : { name: "AES-CBC", iv: ivBuffer };

      const encrypted = await crypto.subtle.encrypt(algorithm, cryptoKey, data);
      return uint8ArrayToBase64(new Uint8Array(encrypted));
    } catch (error) {
      throw new Error(
        t("tools.aes.encryptError") + ": " + (error as Error).message,
      );
    }
  };

  // AES decryption
  const aesDecrypt = async (encryptedBase64: string): Promise<string> => {
    try {
      if (!key.trim()) {
        throw new Error(t("tools.aes.keyRequired"));
      }

      if (!iv.trim()) {
        throw new Error(t("tools.aes.ivRequired"));
      }

      const cryptoKey = await importKey(key);
      const ivBuffer = base64ToArrayBuffer(iv);
      const encryptedBuffer = base64ToArrayBuffer(encryptedBase64);

      const algorithm =
        options.mode === "GCM"
          ? { name: "AES-GCM", iv: ivBuffer }
          : { name: "AES-CBC", iv: ivBuffer };

      const decrypted = await crypto.subtle.decrypt(
        algorithm,
        cryptoKey,
        encryptedBuffer,
      );
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error(
        t("tools.aes.decryptError") + ": " + (error as Error).message,
      );
    }
  };

  // Process input based on current mode
  useEffect(() => {
    const processInput = async () => {
      if (!input.trim()) {
        setOutput("");
        return;
      }

      try {
        if (mode === "encrypt") {
          const result = await aesEncrypt(input);
          setOutput(result);
        } else {
          const result = await aesDecrypt(input);
          setOutput(result);
        }
      } catch {
        setOutput("");
        // Don't show error toast for empty/invalid input during typing
      }
    };

    const debounceTimer = setTimeout(processInput, 300);
    return () => clearTimeout(debounceTimer);
  }, [input, mode, key, iv, options]);

  // Swap between encrypt/decrypt modes
  const handleSwapMode = () => {
    const newMode = mode === "encrypt" ? "decrypt" : "encrypt";
    setMode(newMode);
    // Swap input and output
    setInput(output);
    setOutput(input);
  };

  // Clear all fields
  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("tools.aes.copySuccess"));
    } catch (error) {
      toast.error(t("tools.aes.copyError"), {
        description: (error as Error).message,
      });
    }
  };

  return (
    <ToolPage
      title={t("tools.aes.title")}
      description={t("tools.aes.description")}
    >
      <div className="space-y-6">
        {/* Configuration Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              {t("tools.aes.configOptions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }}>
              <div className="space-y-2">
                <Label htmlFor="keySize">{t("tools.aes.keySize")}</Label>
                <Select
                  value={options.keySize.toString()}
                  onValueChange={(value) =>
                    setOptions({
                      ...options,
                      keySize: parseInt(value) as AESKeySize,
                    })
                  }
                >
                  <SelectTrigger id="keySize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">AES-128</SelectItem>
                    <SelectItem value="192">AES-192</SelectItem>
                    <SelectItem value="256">AES-256</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">{t("tools.aes.mode")}</Label>
                <Select
                  value={options.mode}
                  onValueChange={(value) =>
                    setOptions({ ...options, mode: value as AESMode })
                  }
                >
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GCM">GCM</SelectItem>
                    <SelectItem value="CBC">CBC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSwapMode}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {mode === "encrypt"
                    ? t("common.decrypt")
                    : t("common.encode")}
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="w-full"
                >
                  {t("common.clear")}
                </Button>
              </div>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Key and IV Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              {t("tools.aes.keyConfiguration")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="key">{t("tools.aes.key")} (Base64)</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateKey}
                  className="h-8"
                >
                  <Key className="h-3 w-3 mr-1" />
                  {t("tools.aes.generate")}
                </Button>
              </div>
              <Input
                id="key"
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={t("tools.aes.keyPlaceholder")}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="iv">
                  {t("tools.aes.iv")} (Base64) -{" "}
                  {options.mode === "GCM" ? "12 bytes" : "16 bytes"}
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateIV}
                  className="h-8"
                >
                  <Key className="h-3 w-3 mr-1" />
                  {t("tools.aes.generate")}
                </Button>
              </div>
              <Input
                id="iv"
                type="text"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                placeholder={t("tools.aes.ivPlaceholder")}
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Input/Output Area */}
        <ResponsiveGrid cols={{ mobile: 1, tablet: 1, desktop: 2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm sm:text-base">
                {mode === "encrypt"
                  ? t("tools.aes.plaintext")
                  : t("tools.aes.ciphertext")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "encrypt"
                    ? t("tools.aes.plaintextPlaceholder")
                    : t("tools.aes.ciphertextPlaceholder")
                }
                className="h-full resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm sm:text-base">
                {mode === "encrypt"
                  ? t("tools.aes.ciphertext")
                  : t("tools.aes.plaintext")}
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(output)}
                disabled={!output}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveTextarea
                value={output}
                readOnly
                placeholder={t("tools.aes.outputPlaceholder")}
                className="h-full resize-none bg-muted/50"
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              {t("tools.aes.usage.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">
                  {t("tools.aes.usage.modesTitle")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <strong>GCM:</strong> {t("tools.aes.usage.gcmDesc")}
                  </li>
                  <li>
                    <strong>CBC:</strong> {t("tools.aes.usage.cbcDesc")}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  {t("tools.aes.usage.featuresTitle")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t("tools.aes.usage.keyGeneration")}</li>
                  <li>• {t("tools.aes.usage.secureRandom")}</li>
                  <li>• {t("tools.aes.usage.realtime")}</li>
                  <li>• {t("tools.aes.usage.webCrypto")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
