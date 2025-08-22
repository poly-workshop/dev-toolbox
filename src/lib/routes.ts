export interface RouteConfig {
  path: string;
  titleKey: string; // Changed from title to titleKey
  categoryKey: string; // Changed from category to categoryKey
  component?: string;
}

export const routes: RouteConfig[] = [
  // Encoding Tools
  {
    path: "/encoders/json",
    titleKey: "routes.jsonFormatter",
    categoryKey: "categories.encodingTools",
  },
  {
    path: "/encoders/base64",
    titleKey: "routes.base64",
    categoryKey: "categories.encodingTools",
  },
  {
    path: "/encoders/url",
    titleKey: "routes.urlEncode",
    categoryKey: "categories.encodingTools",
  },

  // Hash Tools
  {
    path: "/hash/md5",
    titleKey: "routes.md5",
    categoryKey: "categories.hashTools",
  },
  {
    path: "/hash/sha256",
    titleKey: "routes.sha256",
    categoryKey: "categories.hashTools",
  },
  {
    path: "/hash/sha512",
    titleKey: "routes.sha512",
    categoryKey: "categories.hashTools",
  },

  // Crypto Tools
  {
    path: "/crypto/aes",
    titleKey: "routes.aes",
    categoryKey: "categories.cryptoTools",
  },
  {
    path: "/crypto/rsa",
    titleKey: "routes.rsa",
    categoryKey: "categories.cryptoTools",
  },

  // Generator Tools
  {
    path: "/generators/uuid",
    titleKey: "routes.uuidGenerator",
    categoryKey: "categories.generatorTools",
  },
  {
    path: "/generators/password",
    titleKey: "routes.passwordGenerator",
    categoryKey: "categories.generatorTools",
  },
  {
    path: "/generators/qrcode",
    titleKey: "routes.qrcodeGenerator",
    categoryKey: "categories.generatorTools",
  },

  // Text Tools
  {
    path: "/text/formatter",
    titleKey: "routes.textFormatter",
    categoryKey: "categories.textTools",
  },
  {
    path: "/text/counter",
    titleKey: "routes.characterCounter",
    categoryKey: "categories.textTools",
  },

  // Converter Tools
  {
    path: "/converters/timestamp",
    titleKey: "routes.timestampConverter",
    categoryKey: "categories.converterTools",
  },
  {
    path: "/converters/number",
    titleKey: "routes.numberConverter",
    categoryKey: "categories.converterTools",
  },

  // Color Tools
  {
    path: "/color/picker",
    titleKey: "routes.colorPicker",
    categoryKey: "categories.colorTools",
  },
  {
    path: "/color/converter",
    titleKey: "routes.colorConverter",
    categoryKey: "categories.colorTools",
  },
];

export const getRoutesByCategory = (categoryKey: string) => {
  return routes.filter((route) => route.categoryKey === categoryKey);
};
