import { ToolPage } from '@/components/tool-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UuidGeneratorPage() {
  return (
    <ToolPage 
      title="UUID 生成器" 
      description="生成各种版本的 UUID"
    >
      <Card>
        <CardHeader>
          <CardTitle>UUID 生成</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            这里将实现 UUID 生成功能
          </p>
        </CardContent>
      </Card>
    </ToolPage>
  );
}
