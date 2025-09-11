import { TimestampPage } from "@/pages/converters/TimestampPage";
import { AESPage } from "@/pages/crypto/AESPage";
import { RSAPage } from "@/pages/crypto/RSAPage";
import { Base64Page } from "@/pages/encoders/Base64Page";
import { JsonFormatterPage } from "@/pages/encoders/JsonFormatterPage";
import { UrlEncoderPage } from "@/pages/encoders/UrlEncoderPage";
import { QRCodeGeneratorPage } from "@/pages/generators/QRCodeGeneratorPage";
import { UuidGeneratorPage } from "@/pages/generators/UuidGeneratorPage";
import { HomePage } from "@/pages/HomePage";
// import { useTranslation } from "react-i18next"; // Commented out - not needed when ComingSoonPage is not used
import { Navigate, Route, Routes } from "react-router-dom";

// Temporary placeholder component - commented out as all unimplemented features are hidden
// function ComingSoonPage({ title }: { title: string }) {
//   const { t } = useTranslation();
//
//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg">
//         <div className="text-center">
//           <h2 className="text-lg font-semibold text-muted-foreground">
//             {title}
//           </h2>
//           <p className="text-sm text-muted-foreground mt-2">
//             {t("common.comingSoon")}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

export function AppRoutes() {
  // const { t } = useTranslation(); // Commented out - not needed when ComingSoonPage is not used

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Encoding Tools */}
      <Route path="/encoders/json" element={<JsonFormatterPage />} />
      <Route path="/encoders/base64" element={<Base64Page />} />
      <Route path="/encoders/url" element={<UrlEncoderPage />} />

      {/* Hash Tools - Commented out until implemented */}
      {/* TODO: Implement hash tools */}
      {/* <Route
        path="/hash/md5"
        element={<ComingSoonPage title={t("routes.md5")} />}
      />
      <Route
        path="/hash/sha256"
        element={<ComingSoonPage title={t("routes.sha256")} />}
      />
      <Route
        path="/hash/sha512"
        element={<ComingSoonPage title={t("routes.sha512")} />}
      /> */}

      {/* Crypto Tools */}
      <Route path="/crypto/aes" element={<AESPage />} />
      <Route path="/crypto/rsa" element={<RSAPage />} />

      {/* Generator Tools */}
      <Route path="/generators/uuid" element={<UuidGeneratorPage />} />
      {/* TODO: Implement password generator */}
      {/* <Route
        path="/generators/password"
        element={<ComingSoonPage title={t("routes.passwordGenerator")} />}
      /> */}
      <Route path="/generators/qrcode" element={<QRCodeGeneratorPage />} />

      {/* Text Tools - Commented out until implemented */}
      {/* TODO: Implement text tools */}
      {/* <Route
        path="/text/formatter"
        element={<ComingSoonPage title={t("routes.textFormatter")} />}
      />
      <Route
        path="/text/counter"
        element={<ComingSoonPage title={t("routes.characterCounter")} />}
      /> */}

      {/* Converter Tools */}
      <Route path="/converters/timestamp" element={<TimestampPage />} />
      {/* TODO: Implement number converter */}
      {/* <Route
        path="/converters/number"
        element={<ComingSoonPage title={t("routes.numberConverter")} />}
      /> */}

      {/* Color Tools - Commented out until implemented */}
      {/* TODO: Implement color tools */}
      {/* <Route
        path="/color/picker"
        element={<ComingSoonPage title={t("routes.colorPicker")} />}
      />
      <Route
        path="/color/converter"
        element={<ComingSoonPage title={t("routes.colorConverter")} />}
      /> */}

      {/* Other Pages - Commented out until implemented */}
      {/* TODO: Implement settings and help pages */}
      {/* <Route
        path="/settings"
        element={<ComingSoonPage title={t("common.settings")} />}
      />
      <Route
        path="/help"
        element={<ComingSoonPage title={t("common.help")} />}
      />
      <Route
        path="/text"
        element={<ComingSoonPage title={t("categories.textTools")} />}
      /> */}
      <Route
        path="/converters"
        element={<Navigate to="/converters/timestamp" replace />}
      />
      {/* TODO: Implement color tools page */}
      {/* <Route
        path="/color"
        element={<ComingSoonPage title={t("categories.colorTools")} />}
      /> */}
    </Routes>
  );
}
