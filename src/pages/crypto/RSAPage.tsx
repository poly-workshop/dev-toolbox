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

type RSAKeySize = 2048 | 3072 | 4096;
type RSAOperation = "encrypt" | "decrypt" | "sign" | "verify";

interface RSAOptions {
  keySize: RSAKeySize;
}

export function RSAPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [operation, setOperation] = useState<RSAOperation>("encrypt");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [signature, setSignature] = useState("");
  const [options, setOptions] = useState<RSAOptions>({
    keySize: 2048,
  });

  // Generate RSA key pair
  const generateKeyPair = async () => {
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: options.keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"],
      );

      const publicKeyBuffer = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey,
      );
      const privateKeyBuffer = await crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey,
      );

      const publicKeyBase64 = formatKey(
        btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer))),
        "PUBLIC",
      );
      const privateKeyBase64 = formatKey(
        btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer))),
        "PRIVATE",
      );

      setPublicKey(publicKeyBase64);
      setPrivateKey(privateKeyBase64);
      toast.success(t("tools.rsa.keyPairGenerated"));
    } catch (error) {
      toast.error(t("tools.rsa.keyGenerationError"), {
        description: (error as Error).message,
      });
    }
  };

  // Format key as PEM
  const formatKey = (base64Key: string, type: "PUBLIC" | "PRIVATE"): string => {
    const keyType = type === "PUBLIC" ? "PUBLIC KEY" : "PRIVATE KEY";
    const formatted = base64Key.match(/.{1,64}/g)?.join("\n") || base64Key;
    return `-----BEGIN ${keyType}-----\n${formatted}\n-----END ${keyType}-----`;
  };

  // Parse PEM key to base64
  const parseKey = (pemKey: string): string => {
    return pemKey
      .replace(/-----BEGIN [^-]+-----/, "")
      .replace(/-----END [^-]+-----/, "")
      .replace(/\s/g, "");
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

  // Convert ArrayBuffer to base64 string
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  // Import RSA public key
  const importPublicKey = async (pemKey: string): Promise<CryptoKey> => {
    const keyData = base64ToArrayBuffer(parseKey(pemKey));
    return await crypto.subtle.importKey(
      "spki",
      keyData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"],
    );
  };

  // Import RSA private key
  const importPrivateKey = async (pemKey: string): Promise<CryptoKey> => {
    const keyData = base64ToArrayBuffer(parseKey(pemKey));
    return await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"],
    );
  };

  // RSA encryption
  const rsaEncrypt = async (text: string): Promise<string> => {
    try {
      if (!publicKey.trim()) {
        throw new Error(t("tools.rsa.publicKeyRequired"));
      }

      const cryptoKey = await importPublicKey(publicKey);
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // RSA-OAEP has size limitations, check if text is too long
      const maxLength = Math.floor(options.keySize / 8 - 42); // OAEP padding overhead
      if (data.length > maxLength) {
        throw new Error(
          t("tools.rsa.textTooLong", { maxLength: maxLength.toString() }),
        );
      }

      const encrypted = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        cryptoKey,
        data,
      );
      return arrayBufferToBase64(encrypted);
    } catch (error) {
      throw new Error(
        t("tools.rsa.encryptError") + ": " + (error as Error).message,
      );
    }
  };

  // RSA decryption
  const rsaDecrypt = async (encryptedBase64: string): Promise<string> => {
    try {
      if (!privateKey.trim()) {
        throw new Error(t("tools.rsa.privateKeyRequired"));
      }

      const cryptoKey = await importPrivateKey(privateKey);
      const encryptedData = base64ToArrayBuffer(encryptedBase64);

      const decrypted = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        cryptoKey,
        encryptedData,
      );
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error(
        t("tools.rsa.decryptError") + ": " + (error as Error).message,
      );
    }
  };

  // Import RSA key for signing
  const importSigningKey = async (pemKey: string): Promise<CryptoKey> => {
    const keyData = base64ToArrayBuffer(parseKey(pemKey));
    return await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );
  };

  // Import RSA key for verification
  const importVerifyingKey = async (pemKey: string): Promise<CryptoKey> => {
    const keyData = base64ToArrayBuffer(parseKey(pemKey));
    return await crypto.subtle.importKey(
      "spki",
      keyData,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      false,
      ["verify"],
    );
  };

  // RSA signing
  const rsaSign = async (text: string): Promise<string> => {
    try {
      if (!privateKey.trim()) {
        throw new Error(t("tools.rsa.privateKeyRequired"));
      }

      const cryptoKey = await importSigningKey(privateKey);
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      const signature = await crypto.subtle.sign(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        cryptoKey,
        data,
      );
      return arrayBufferToBase64(signature);
    } catch (error) {
      throw new Error(
        t("tools.rsa.signError") + ": " + (error as Error).message,
      );
    }
  };

  // RSA signature verification
  const rsaVerify = async (
    text: string,
    signatureBase64: string,
  ): Promise<boolean> => {
    try {
      if (!publicKey.trim()) {
        throw new Error(t("tools.rsa.publicKeyRequired"));
      }

      if (!signatureBase64.trim()) {
        throw new Error(t("tools.rsa.signatureRequired"));
      }

      const cryptoKey = await importVerifyingKey(publicKey);
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const signatureData = base64ToArrayBuffer(signatureBase64);

      const isValid = await crypto.subtle.verify(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        cryptoKey,
        signatureData,
        data,
      );
      return isValid;
    } catch (error) {
      throw new Error(
        t("tools.rsa.verifyError") + ": " + (error as Error).message,
      );
    }
  };

  // Process input based on current operation
  useEffect(() => {
    const processInput = async () => {
      if (!input.trim()) {
        setOutput("");
        return;
      }

      try {
        switch (operation) {
          case "encrypt": {
            const encrypted = await rsaEncrypt(input);
            setOutput(encrypted);
            break;
          }
          case "decrypt": {
            const decrypted = await rsaDecrypt(input);
            setOutput(decrypted);
            break;
          }
          case "sign": {
            const signed = await rsaSign(input);
            setOutput(signed);
            setSignature(signed);
            break;
          }
          case "verify": {
            const isValid = await rsaVerify(input, signature);
            setOutput(
              isValid
                ? t("tools.rsa.signatureValid")
                : t("tools.rsa.signatureInvalid"),
            );
            break;
          }
        }
      } catch {
        setOutput("");
        // Don't show error toast for empty/invalid input during typing
      }
    };

    const debounceTimer = setTimeout(processInput, 300);
    return () => clearTimeout(debounceTimer);
  }, [input, operation, publicKey, privateKey, signature, options]);

  // Swap between operations
  const handleSwapMode = () => {
    if (operation === "encrypt") {
      setOperation("decrypt");
    } else if (operation === "decrypt") {
      setOperation("encrypt");
    } else if (operation === "sign") {
      setOperation("verify");
    } else {
      setOperation("sign");
    }
    // Swap input and output for encrypt/decrypt
    if (operation === "encrypt" || operation === "decrypt") {
      setInput(output);
      setOutput(input);
    }
  };

  // Clear all fields
  const handleClear = () => {
    setInput("");
    setOutput("");
    setSignature("");
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("tools.rsa.copySuccess"));
    } catch (error) {
      toast.error(t("tools.rsa.copyError"), {
        description: (error as Error).message,
      });
    }
  };

  const getMaxTextLength = () => {
    return Math.floor(options.keySize / 8 - 42); // OAEP padding overhead
  };

  return (
    <ToolPage
      title={t("tools.rsa.title")}
      description={t("tools.rsa.description")}
    >
      <div className="space-y-6">
        {/* Configuration Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              {t("tools.rsa.configOptions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }}>
              <div className="space-y-2">
                <Label htmlFor="keySize">{t("tools.rsa.keySize")}</Label>
                <Select
                  value={options.keySize.toString()}
                  onValueChange={(value) =>
                    setOptions({
                      ...options,
                      keySize: parseInt(value) as RSAKeySize,
                    })
                  }
                >
                  <SelectTrigger id="keySize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2048">2048 bits</SelectItem>
                    <SelectItem value="3072">3072 bits</SelectItem>
                    <SelectItem value="4096">4096 bits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation">{t("tools.rsa.operation")}</Label>
                <Select
                  value={operation}
                  onValueChange={(value) => setOperation(value as RSAOperation)}
                >
                  <SelectTrigger id="operation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encrypt">
                      {t("tools.rsa.encrypt")}
                    </SelectItem>
                    <SelectItem value="decrypt">
                      {t("tools.rsa.decrypt")}
                    </SelectItem>
                    <SelectItem value="sign">{t("tools.rsa.sign")}</SelectItem>
                    <SelectItem value="verify">
                      {t("tools.rsa.verify")}
                    </SelectItem>
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
                  {operation === "encrypt" || operation === "sign"
                    ? t("tools.rsa.switchToOpposite")
                    : t("tools.rsa.switchToOpposite")}
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

        {/* Key Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm sm:text-base">
              {t("tools.rsa.keyConfiguration")}
            </CardTitle>
            <Button onClick={generateKeyPair} variant="outline" className="h-8">
              <Key className="h-3 w-3 mr-1" />
              {t("tools.rsa.generateKeyPair")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publicKey">
                {t("tools.rsa.publicKey")} (PEM)
              </Label>
              <ResponsiveTextarea
                id="publicKey"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder={t("tools.rsa.publicKeyPlaceholder")}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privateKey">
                {t("tools.rsa.privateKey")} (PEM)
              </Label>
              <ResponsiveTextarea
                id="privateKey"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder={t("tools.rsa.privateKeyPlaceholder")}
                className="font-mono text-xs"
              />
            </div>

            {operation === "verify" && (
              <div className="space-y-2">
                <Label htmlFor="signature">
                  {t("tools.rsa.signature")} (Base64)
                </Label>
                <Input
                  id="signature"
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder={t("tools.rsa.signaturePlaceholder")}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Text Length Warning */}
        {operation === "encrypt" && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="pt-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️{" "}
                {t("tools.rsa.textLengthWarning", {
                  maxLength: getMaxTextLength().toString(),
                })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Input/Output Area */}
        <ResponsiveGrid cols={{ mobile: 1, tablet: 1, desktop: 2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm sm:text-base">
                {operation === "encrypt" || operation === "sign"
                  ? t("tools.rsa.input")
                  : operation === "decrypt"
                    ? t("tools.rsa.ciphertext")
                    : t("tools.rsa.message")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  operation === "encrypt" || operation === "sign"
                    ? t("tools.rsa.inputPlaceholder")
                    : operation === "decrypt"
                      ? t("tools.rsa.ciphertextPlaceholder")
                      : t("tools.rsa.messagePlaceholder")
                }
                className="h-full resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm sm:text-base">
                {operation === "encrypt"
                  ? t("tools.rsa.ciphertext")
                  : operation === "decrypt"
                    ? t("tools.rsa.plaintext")
                    : operation === "sign"
                      ? t("tools.rsa.signature")
                      : t("tools.rsa.verificationResult")}
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
                placeholder={t("tools.rsa.outputPlaceholder")}
                className="h-full resize-none bg-muted/50"
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              {t("tools.rsa.usage.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">
                  {t("tools.rsa.usage.operationsTitle")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <strong>{t("tools.rsa.encrypt")}:</strong>{" "}
                    {t("tools.rsa.usage.encryptDesc")}
                  </li>
                  <li>
                    <strong>{t("tools.rsa.decrypt")}:</strong>{" "}
                    {t("tools.rsa.usage.decryptDesc")}
                  </li>
                  <li>
                    <strong>{t("tools.rsa.sign")}:</strong>{" "}
                    {t("tools.rsa.usage.signDesc")}
                  </li>
                  <li>
                    <strong>{t("tools.rsa.verify")}:</strong>{" "}
                    {t("tools.rsa.usage.verifyDesc")}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">
                  {t("tools.rsa.usage.featuresTitle")}
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t("tools.rsa.usage.keyGeneration")}</li>
                  <li>• {t("tools.rsa.usage.pemFormat")}</li>
                  <li>• {t("tools.rsa.usage.webCrypto")}</li>
                  <li>• {t("tools.rsa.usage.secureAlgorithms")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}
