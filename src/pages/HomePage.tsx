import { useTranslation } from "react-i18next";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-muted-foreground/25 rounded-lg mx-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-muted-foreground">
          {t("home.welcome")}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("home.selectTool")}
        </p>
      </div>
    </div>
  );
}
