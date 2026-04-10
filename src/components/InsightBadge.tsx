import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

type InsightType = "positive" | "negative" | "warning" | "neutral";

interface InsightBadgeProps {
  text: string;
  type: InsightType;
}

const config: Record<InsightType, { icon: typeof TrendingUp; bg: string; text: string }> = {
  positive: { icon: CheckCircle, bg: "bg-accent/10", text: "text-accent" },
  negative: { icon: TrendingDown, bg: "bg-destructive/10", text: "text-destructive" },
  warning: { icon: AlertTriangle, bg: "bg-warning/10", text: "text-warning" },
  neutral: { icon: TrendingUp, bg: "bg-primary/10", text: "text-primary" },
};

const InsightBadge = ({ text, type }: InsightBadgeProps) => {
  const { icon: Icon, bg, text: textColor } = config[type];
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bg}`}>
      <Icon className={`w-4 h-4 ${textColor}`} />
      <span className={`text-xs font-medium ${textColor}`}>{text}</span>
    </div>
  );
};

export default InsightBadge;
