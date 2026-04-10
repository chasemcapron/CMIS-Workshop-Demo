import { useEffect, useState } from "react";
import { Ticket, parseCSV, groupBy, avg } from "@/lib/parseTickets";
import KPICard from "@/components/KPICard";
import ChartCard from "@/components/ChartCard";
import InsightBadge from "@/components/InsightBadge";
import { Ticket as TicketIcon, Clock, Star, AlertCircle, Users, BarChart3, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Treemap
} from "recharts";

const COLORS = [
  "hsl(210, 100%, 56%)", "hsl(160, 84%, 44%)", "hsl(38, 92%, 55%)",
  "hsl(280, 65%, 60%)", "hsl(350, 80%, 60%)", "hsl(190, 90%, 50%)"
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-border/50">
      <p className="text-foreground font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="mt-1">
          {p.name}: <span className="font-semibold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const Index = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch("/data/support_tickets.csv")
      .then(r => r.text())
      .then(csv => setTickets(parseCSV(csv)));
  }, []);

  if (!tickets.length) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
    </div>
  );

  // KPIs
  const totalTickets = tickets.length;
  const avgResolution = avg(tickets.map(t => t.resolution_time_hours));
  const avgCSAT = avg(tickets.map(t => t.csat_score));
  const openTickets = tickets.filter(t => t.status === "In Progress" || t.status === "Open").length;
  const highPriority = tickets.filter(t => t.priority === "High" || t.priority === "Critical").length;

  // By Region
  const byRegion = Object.entries(groupBy(tickets, t => t.region)).map(([name, items]) => ({
    name, count: items.length, avgCSAT: +avg(items.map(t => t.csat_score)).toFixed(1),
    avgResolution: +avg(items.map(t => t.resolution_time_hours)).toFixed(1)
  }));

  // By Priority
  const byPriority = Object.entries(groupBy(tickets, t => t.priority)).map(([name, items]) => ({
    name, value: items.length
  }));

  // By Status
  const byStatus = Object.entries(groupBy(tickets, t => t.status)).map(([name, items]) => ({
    name, value: items.length
  }));

  // By Category
  const byCategory = Object.entries(groupBy(tickets, t => t.issue_category)).map(([name, items]) => ({
    name, count: items.length, avgResolution: +avg(items.map(t => t.resolution_time_hours)).toFixed(1)
  })).sort((a, b) => b.count - a.count);

  // By Channel
  const byChannel = Object.entries(groupBy(tickets, t => t.channel)).map(([name, items]) => ({
    name, count: items.length, avgCSAT: +avg(items.map(t => t.csat_score)).toFixed(1)
  }));

  // By Product Line
  const byProduct = Object.entries(groupBy(tickets, t => t.product_line)).map(([name, items]) => ({
    name, count: items.length, avgResolution: +avg(items.map(t => t.resolution_time_hours)).toFixed(1)
  }));

  // By Agent Team
  const byTeam = Object.entries(groupBy(tickets, t => t.agent_team)).map(([name, items]) => ({
    name, tickets: items.length,
    avgCSAT: +avg(items.map(t => t.csat_score)).toFixed(1),
    avgResolution: +avg(items.map(t => t.resolution_time_hours)).toFixed(1),
    resolved: items.filter(t => t.status === "Resolved" || t.status === "Closed").length
  }));

  // By Customer Segment
  const bySegment = Object.entries(groupBy(tickets, t => t.customer_segment)).map(([name, items]) => ({
    name, count: items.length, avgCSAT: +avg(items.map(t => t.csat_score)).toFixed(1)
  }));

  // Monthly trend
  const byMonth = Object.entries(groupBy(tickets, t => t.created_at.slice(0, 7)))
    .map(([month, items]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }),
      tickets: items.length,
      avgResolution: +avg(items.map(t => t.resolution_time_hours)).toFixed(1),
      avgCSAT: +avg(items.map(t => t.csat_score)).toFixed(1)
    })).sort((a, b) => a.month.localeCompare(b.month));

  // Treemap data for subcategories
  const treemapData = Object.entries(groupBy(tickets, t => t.issue_subcategory)).map(([name, items]) => ({
    name, size: items.length
  })).sort((a, b) => b.size - a.size);

  // Insights
  const bestTeam = byTeam.reduce((a, b) => a.avgCSAT > b.avgCSAT ? a : b);
  const worstCategory = byCategory.reduce((a, b) => a.avgResolution > b.avgResolution ? a : b);
  const bestChannel = byChannel.reduce((a, b) => a.avgCSAT > b.avgCSAT ? a : b);

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="gradient-primary p-2 rounded-lg">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Support Operations Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Q1 2026 • {totalTickets} tickets across {byRegion.length} regions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <InsightBadge text={`Top team: ${bestTeam.name} (${bestTeam.avgCSAT} CSAT)`} type="positive" />
          <InsightBadge text={`Slowest category: ${worstCategory.name} (${worstCategory.avgResolution}h)`} type="warning" />
          <InsightBadge text={`${openTickets} tickets still open`} type={openTickets > 30 ? "negative" : "neutral"} />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Tickets" value={totalTickets} subtitle="Q1 2026" icon={<TicketIcon className="w-5 h-5 text-primary-foreground" />} glowClass="kpi-glow-blue" gradientClass="gradient-primary" />
        <KPICard title="Avg Resolution" value={`${avgResolution.toFixed(1)}h`} subtitle="Target: 18h" icon={<Clock className="w-5 h-5 text-primary-foreground" />} glowClass="kpi-glow-amber" gradientClass="gradient-warning" />
        <KPICard title="Avg CSAT" value={avgCSAT.toFixed(1)} subtitle="Out of 5.0" icon={<Star className="w-5 h-5 text-primary-foreground" />} glowClass="kpi-glow-green" gradientClass="gradient-accent" />
        <KPICard title="High Priority" value={highPriority} subtitle={`${((highPriority / totalTickets) * 100).toFixed(0)}% of total`} icon={<AlertCircle className="w-5 h-5 text-primary-foreground" />} glowClass="kpi-glow-red" gradientClass="gradient-destructive" />
      </div>

      {/* Row 2: Trend + Status + Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Monthly Ticket Volume & CSAT" subtitle="Trend over Q1 2026" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
              <XAxis dataKey="month" stroke="hsl(215,15%,55%)" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(215,15%,55%)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(215,15%,55%)" fontSize={12} domain={[0, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="tickets" fill="hsl(210,100%,56%)" radius={[4,4,0,0]} opacity={0.7} name="Tickets" />
              <Line yAxisId="right" dataKey="avgCSAT" stroke="hsl(160,84%,44%)" strokeWidth={2} dot={{ r: 4 }} name="Avg CSAT" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ticket Status" subtitle="Current distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} strokeWidth={2} stroke="hsl(220,20%,7%)">
                {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {byStatus.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Category + Region */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Issues by Category" subtitle="Volume & avg resolution time">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
              <XAxis type="number" stroke="hsl(215,15%,55%)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(215,15%,55%)" fontSize={11} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="hsl(210,100%,56%)" radius={[0,4,4,0]} name="Tickets" />
              <Bar dataKey="avgResolution" fill="hsl(38,92%,55%)" radius={[0,4,4,0]} name="Avg Hours" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Regional Performance" subtitle="CSAT & resolution time by region">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={byRegion} cx="50%" cy="50%">
              <PolarGrid stroke="hsl(220,14%,18%)" />
              <PolarAngleAxis dataKey="name" stroke="hsl(215,15%,55%)" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(215,15%,55%)" fontSize={10} />
              <Radar name="Avg CSAT" dataKey="avgCSAT" stroke="hsl(160,84%,44%)" fill="hsl(160,84%,44%)" fillOpacity={0.2} />
              <Radar name="Avg Resolution (h)" dataKey="avgResolution" stroke="hsl(38,92%,55%)" fill="hsl(38,92%,55%)" fillOpacity={0.15} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4: Channel + Product + Segment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="By Channel" subtitle="Volume & satisfaction">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byChannel}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
              <XAxis dataKey="name" stroke="hsl(215,15%,55%)" fontSize={11} />
              <YAxis stroke="hsl(215,15%,55%)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="hsl(280,65%,60%)" radius={[4,4,0,0]} name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
          <InsightBadge text={`Best channel: ${bestChannel.name} (${bestChannel.avgCSAT} CSAT)`} type="positive" />
        </ChartCard>

        <ChartCard title="By Product Line" subtitle="Resolution efficiency">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byProduct}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
              <XAxis dataKey="name" stroke="hsl(215,15%,55%)" fontSize={11} />
              <YAxis stroke="hsl(215,15%,55%)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgResolution" fill="hsl(350,80%,60%)" radius={[4,4,0,0]} name="Avg Hours" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Segments" subtitle="Volume & CSAT by segment">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bySegment} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} strokeWidth={2} stroke="hsl(220,20%,7%)">
                {bySegment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {bySegment.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name} ({s.count})
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Row 5: Team Performance Table */}
      <ChartCard title="Agent Team Performance" subtitle="Comparative metrics across all teams">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Team</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Tickets</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Resolved</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Resolution Rate</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Avg CSAT</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Avg Resolution</th>
              </tr>
            </thead>
            <tbody>
              {byTeam.sort((a, b) => b.avgCSAT - a.avgCSAT).map(team => (
                <tr key={team.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{team.name}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{team.tickets}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{team.resolved}</td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-medium ${(team.resolved / team.tickets) > 0.85 ? 'text-accent' : 'text-warning'}`}>
                      {((team.resolved / team.tickets) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-medium ${team.avgCSAT >= 3 ? 'text-accent' : 'text-destructive'}`}>
                      {team.avgCSAT}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{team.avgResolution}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Footer insight */}
      <div className="glass-card p-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 mr-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Key Takeaways</span>
        </div>
        <InsightBadge text={`Enterprise accounts: ${((tickets.filter(t => t.customer_segment === 'Enterprise').length / totalTickets) * 100).toFixed(0)}% of volume`} type="neutral" />
        <InsightBadge text={`Phone channel has highest volume (${byChannel.find(c => c.name === 'Phone')?.count || 0} tickets)`} type="warning" />
        <InsightBadge text={`Billing is the #1 issue category (${byCategory[0]?.count || 0} tickets)`} type="negative" />
      </div>
    </div>
  );
};

export default Index;
