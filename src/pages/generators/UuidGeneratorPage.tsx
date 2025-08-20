import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolPage } from "@/components/tool-page";
import { useTranslation } from "react-i18next";

export function UuidGeneratorPage() {
  const { t } = useTranslation();

  return (
    <ToolPage
      title={t("tools.uuid.title")}
      description={t("tools.uuid.description")}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("tools.uuid.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("common.comingSoon")}</p>
        </CardContent>
      </Card>
    </ToolPage>
  );
}
