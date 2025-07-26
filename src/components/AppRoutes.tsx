import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { JsonFormatterPage } from '@/pages/encoders/JsonFormatterPage';
import { Base64Page } from '@/pages/encoders/Base64Page';
import { UuidGeneratorPage } from '@/pages/generators/UuidGeneratorPage';
import { useTranslation } from 'react-i18next';

// 临时占位组件
function ComingSoonPage({ title }: { title: string }) {
  const { t } = useTranslation();
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-muted-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-2">{t('common.comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}

export function AppRoutes() {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      
      {/* 编码工具 */}
      <Route path="/encoders/json" element={<JsonFormatterPage />} />
      <Route path="/encoders/base64" element={<Base64Page />} />
      <Route path="/encoders/url" element={<ComingSoonPage title={t('routes.urlEncode')} />} />
      
      {/* 哈希工具 */}
      <Route path="/hash/md5" element={<ComingSoonPage title={t('routes.md5')} />} />
      <Route path="/hash/sha256" element={<ComingSoonPage title={t('routes.sha256')} />} />
      <Route path="/hash/sha512" element={<ComingSoonPage title={t('routes.sha512')} />} />
      
      {/* 加密工具 */}
      <Route path="/crypto/aes" element={<ComingSoonPage title={t('routes.aes')} />} />
      <Route path="/crypto/rsa" element={<ComingSoonPage title={t('routes.rsa')} />} />
      
      {/* 生成工具 */}
      <Route path="/generators/uuid" element={<UuidGeneratorPage />} />
      <Route path="/generators/password" element={<ComingSoonPage title={t('routes.passwordGenerator')} />} />
      <Route path="/generators/qrcode" element={<ComingSoonPage title={t('routes.qrcodeGenerator')} />} />
      
      {/* 文本工具 */}  
      <Route path="/text/formatter" element={<ComingSoonPage title={t('routes.textFormatter')} />} />
      <Route path="/text/counter" element={<ComingSoonPage title={t('routes.characterCounter')} />} />
      
      {/* 转换工具 */}
      <Route path="/converters/timestamp" element={<ComingSoonPage title={t('routes.timestampConverter')} />} />
      <Route path="/converters/number" element={<ComingSoonPage title={t('routes.numberConverter')} />} />
      
      {/* 颜色工具 */}
      <Route path="/color/picker" element={<ComingSoonPage title={t('routes.colorPicker')} />} />
      <Route path="/color/converter" element={<ComingSoonPage title={t('routes.colorConverter')} />} />
      
      {/* 其他页面 */}
      <Route path="/settings" element={<ComingSoonPage title={t('common.settings')} />} />
      <Route path="/help" element={<ComingSoonPage title={t('common.help')} />} />
      <Route path="/text" element={<ComingSoonPage title={t('categories.textTools')} />} />
      <Route path="/converters" element={<ComingSoonPage title={t('categories.converterTools')} />} />
      <Route path="/color" element={<ComingSoonPage title={t('categories.colorTools')} />} />
    </Routes>
  );
}
