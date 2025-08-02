import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolPage } from "@/components/tool-page";

export function JsonFormatterPage() {
  return (
    <ToolPage title="JSON 格式化" description="格式化、压缩和验证 JSON 数据">
      <Tabs defaultValue="format" className="w-full">
        <TabsList>
          <TabsTrigger value="format">格式化</TabsTrigger>
          <TabsTrigger value="minify">压缩</TabsTrigger>
          <TabsTrigger value="validate">验证</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON 格式化工具</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                这里将实现 JSON 格式化功能
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON 压缩工具</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">这里将实现 JSON 压缩功能</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON 验证工具</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">这里将实现 JSON 验证功能</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolPage>
  );
}
