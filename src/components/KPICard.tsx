import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  glowClass: string;
  gradientClass: string;
}

const KPICard = ({ title, value, subtitle, icon, glowClass, gradientClass }: KPICardProps) => (
  <div className={`glass-card p-6 ${glowClass} transition-all duration-300 hover:scale-[1.02]`}>
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={`${gradientClass} p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default KPICard;
