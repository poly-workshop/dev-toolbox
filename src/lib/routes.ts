export interface RouteConfig {
  path: string;
  title: string;
  category: string;
  component?: string;
}

export const routes: RouteConfig[] = [
  // 编码工具
  { path: '/encoders/json', title: 'JSON 格式化', category: '编码工具' },
  { path: '/encoders/base64', title: 'Base64 编解码', category: '编码工具' },
  { path: '/encoders/url', title: 'URL 编解码', category: '编码工具' },
  
  // 哈希工具
  { path: '/hash/md5', title: 'MD5', category: '哈希工具' },
  { path: '/hash/sha256', title: 'SHA256', category: '哈希工具' },
  { path: '/hash/sha512', title: 'SHA512', category: '哈希工具' },
  
  // 加密工具
  { path: '/crypto/aes', title: 'AES 加解密', category: '加密工具' },
  { path: '/crypto/rsa', title: 'RSA 加解密', category: '加密工具' },
  
  // 生成工具
  { path: '/generators/uuid', title: 'UUID 生成', category: '生成工具' },
  { path: '/generators/password', title: '密码生成', category: '生成工具' },
  { path: '/generators/qrcode', title: '二维码生成', category: '生成工具' },
  
  // 文本工具
  { path: '/text/formatter', title: '文本格式化', category: '文本工具' },
  { path: '/text/counter', title: '字符统计', category: '文本工具' },
  
  // 转换工具
  { path: '/converters/timestamp', title: '时间戳转换', category: '转换工具' },
  { path: '/converters/number', title: '进制转换', category: '转换工具' },
  
  // 颜色工具
  { path: '/color/picker', title: '颜色选择器', category: '颜色工具' },
  { path: '/color/converter', title: '颜色转换', category: '颜色工具' },
];

export const getRoutesByCategory = (category: string) => {
  return routes.filter(route => route.category === category);
};
