import { ToolPage } from '@/components/tool-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveGrid, ResponsiveTextarea } from '@/components/responsive-container';
import { useState, useEffect } from 'react';
import { Copy, RotateCcw, Clock, Hash, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';

type TimestampUnit = 'seconds' | 'milliseconds';
type TimeFormat = 'local' | 'utc' | 'iso';

interface TimestampOptions {
  unit: TimestampUnit;
  format: TimeFormat;
}

export function TimestampPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'timestamp-to-time' | 'time-to-timestamp'>('timestamp-to-time');
  const [options, setOptions] = useState<TimestampOptions>({ 
    unit: 'seconds', 
    format: 'local' 
  });

  // Use Rust backend for timestamp conversion
  const handleConvert = async (inputText: string, from: 'timestamp' | 'time') => {
    if (!inputText.trim()) {
      if (from === 'timestamp') setOutput('');
      if (from === 'time') setInput('');
      return;
    }
    try {
      const response = await invoke('convert_timestamp', {
        request: {
          input: inputText,
          mode: from === 'timestamp' ? 'timestamp-to-time' : 'time-to-timestamp',
          unit: options.unit,
          format: from === 'timestamp' ? options.format : undefined
        }
      }) as { success: boolean; result?: string; error?: string };
      if (response.success && response.result) {
        if (from === 'timestamp') setOutput(response.result);
        if (from === 'time') setInput(response.result);
      } else {
        if (from === 'timestamp') setOutput('');
        if (from === 'time') setInput('');
      }
    } catch {
      if (from === 'timestamp') setOutput('');
      if (from === 'time') setInput('');
    }
  };

  // 只允许一个输入框可编辑，另一个只读，切换模式时自动清空
  useEffect(() => {
    setInput('');
    setOutput('');
  }, [mode, options.unit, options.format]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    if (mode === 'timestamp-to-time') {
      handleConvert(value, 'timestamp');
    } else {
      handleConvert(value, 'time');
    }
  };

  // Re-convert when options change
  useEffect(() => {
    if (input.trim()) {
      handleConvert(input, 'timestamp');
    }
  }, [options.unit, options.format, mode]);

  const handleSwapMode = () => {
    const newMode = mode === 'timestamp-to-time' ? 'time-to-timestamp' : 'timestamp-to-time';
    setMode(newMode);
    setInput(output);
    setOutput(input);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('tools.timestamp.copySuccess'));
    } catch (error) {
      toast.error(t('tools.timestamp.copyError'));
    }
  };

  const handleNow = () => {
    const now = new Date();
    const timestamp = options.unit === 'seconds' 
      ? Math.floor(now.getTime() / 1000).toString()
      : now.getTime().toString();
    if (mode === 'timestamp-to-time') {
      setInput(timestamp);
      handleConvert(timestamp, 'timestamp');
    } else {
      const nowStr = now.toISOString();
      setOutput(nowStr);
      handleConvert(nowStr, 'time');
    }
  };

  return (
    <ToolPage 
      title={t('tools.timestamp.title')} 
      description={t('tools.timestamp.description')}
    >
      <div className="space-y-6">
        {/* Operation mode selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {t('tools.timestamp.operationMode')}
              </div>
              <Button
                variant="default"
                onClick={handleSwapMode}
                className="h-8 px-4 text-sm"
              >
                {mode === 'timestamp-to-time' 
                  ? t('tools.timestamp.timestampToTime') 
                  : t('tools.timestamp.timeToTimestamp')
                }
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Configuration options */}
            <div className="border-t pt-4">
              <div className="flex w-full items-center">
                <div className="flex items-center gap-3 pl-6 w-[260px]">
                  <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {t('tools.timestamp.timestampUnit')}:
                  </Label>
                  <Select
                    value={options.unit}
                    onValueChange={(value: TimestampUnit) => 
                      setOptions(prev => ({ ...prev, unit: value }))
                    }
                  >
                    <SelectTrigger className="h-10 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">{t('tools.timestamp.seconds')}</SelectItem>
                      <SelectItem value="milliseconds">{t('tools.timestamp.milliseconds')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1" />
                <div className={`flex items-center gap-3 pr-6 w-[260px] justify-end ${mode !== 'timestamp-to-time' ? 'opacity-50' : ''}`}> 
                  <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {t('tools.timestamp.timeFormat')}:
                  </Label>
                  <Select
                    value={options.format}
                    onValueChange={(value: TimeFormat) => 
                      setOptions(prev => ({ ...prev, format: value }))
                    }
                    disabled={mode !== 'timestamp-to-time'}
                  >
                    <SelectTrigger className="h-10 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">{t('tools.timestamp.local')}</SelectItem>
                      <SelectItem value="utc">{t('tools.timestamp.utc')}</SelectItem>
                      <SelectItem value="iso">{t('tools.timestamp.iso')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input/Output area */}
        <ResponsiveGrid>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mode === 'timestamp-to-time' ? (
                    <Hash className="h-5 w-5 text-green-600" />
                  ) : (
                    <Calendar className="h-5 w-5 text-green-600" />
                  )}
                  {mode === 'timestamp-to-time' 
                    ? t('tools.timestamp.timestampInput') 
                    : t('tools.timestamp.timeInput')
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 px-3"
                  >
                    {t('common.clear')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNow}
                    className="h-8 px-3"
                  >
                    {t('tools.timestamp.now')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwapMode}
                    className="h-8 px-3"
                    title="Swap mode"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveTextarea
                value={input}
                onChange={handleInputChange}
                readOnly={mode === 'time-to-timestamp'}
                placeholder={
                  mode === 'timestamp-to-time'
                    ? t('tools.timestamp.timestampPlaceholder')
                    : t('tools.timestamp.timePlaceholder')
                }
                className="min-h-[140px] resize-none text-base"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {mode === 'timestamp-to-time' 
                  ? t('tools.timestamp.timeOutput') 
                  : t('tools.timestamp.timestampOutput')
                }
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(output)}
                  disabled={!output}
                  className="h-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveTextarea
                value={output}
                readOnly={mode === 'timestamp-to-time'}
                onChange={handleInputChange}
                placeholder={
                  mode === 'timestamp-to-time'
                    ? t('tools.timestamp.timeOutputPlaceholder')
                    : t('tools.timestamp.timestampOutputPlaceholder')
                }
                className="min-h-[140px] resize-none text-base bg-muted/50"
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>
      </div>
    </ToolPage>
  );
} 