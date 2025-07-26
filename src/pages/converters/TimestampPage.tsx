import { ToolPage } from '@/components/tool-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveGrid, ResponsiveTextarea } from '@/components/responsive-container';
import { useState, useEffect } from 'react';
import { Copy, RotateCcw, Clock } from 'lucide-react';
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
  const handleConvert = async (inputText?: string) => {
    const textToProcess = inputText !== undefined ? inputText : input;
    
    if (!textToProcess.trim()) {
      setOutput('');
      return;
    }

    try {
      const response = await invoke('convert_timestamp', {
        request: {
          input: textToProcess,
          mode: mode,
          unit: options.unit,
          format: mode === 'timestamp-to-time' ? options.format : undefined
        }
      }) as { success: boolean; result?: string; error?: string };

      if (response.success && response.result) {
        setOutput(response.result);
      } else {
        const errorMessage = response.error || t('tools.timestamp.conversionError');
        toast.error(errorMessage);
        setOutput('');
      }
    } catch (error) {
      toast.error(t('tools.timestamp.conversionError') + ': ' + (error as Error).message);
      setOutput('');
    }
  };

  // Re-convert when options change
  useEffect(() => {
    if (input.trim()) {
      handleConvert();
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
    } else {
      setInput(now.toISOString());
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('tools.timestamp.operationMode')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={mode === 'timestamp-to-time' ? 'default' : 'outline'}
                onClick={() => setMode('timestamp-to-time')}
              >
                {t('tools.timestamp.timestampToTime')}
              </Button>
              <Button
                variant={mode === 'time-to-timestamp' ? 'default' : 'outline'}
                onClick={() => setMode('time-to-timestamp')}
              >
                {t('tools.timestamp.timeToTimestamp')}
              </Button>
            </div>
            
            {/* Configuration options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('tools.timestamp.timestampUnit')}</Label>
                <Select
                  value={options.unit}
                  onValueChange={(value: TimestampUnit) => 
                    setOptions(prev => ({ ...prev, unit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">{t('tools.timestamp.seconds')}</SelectItem>
                    <SelectItem value="milliseconds">{t('tools.timestamp.milliseconds')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {mode === 'timestamp-to-time' && (
                <div className="space-y-2">
                  <Label>{t('tools.timestamp.timeFormat')}</Label>
                  <Select
                    value={options.format}
                    onValueChange={(value: TimeFormat) => 
                      setOptions(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">{t('tools.timestamp.local')}</SelectItem>
                      <SelectItem value="utc">{t('tools.timestamp.utc')}</SelectItem>
                      <SelectItem value="iso">{t('tools.timestamp.iso')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input/Output area */}
        <ResponsiveGrid>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {mode === 'timestamp-to-time' 
                  ? t('tools.timestamp.timestampInput') 
                  : t('tools.timestamp.timeInput')
                }
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNow}
                    className="h-8"
                  >
                    {t('tools.timestamp.now')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwapMode}
                    className="h-8"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'timestamp-to-time'
                    ? t('tools.timestamp.timestampPlaceholder')
                    : t('tools.timestamp.timePlaceholder')
                }
                className="min-h-[120px]"
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
                readOnly
                placeholder={
                  mode === 'timestamp-to-time'
                    ? t('tools.timestamp.timeOutputPlaceholder')
                    : t('tools.timestamp.timestampOutputPlaceholder')
                }
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={() => handleConvert()}>
            {t('tools.timestamp.convert')}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            {t('common.clear')}
          </Button>
        </div>
      </div>
    </ToolPage>
  );
} 