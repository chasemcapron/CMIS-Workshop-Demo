import { useState, useMemo } from "react";
import { Ticket } from "@/lib/parseTickets";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface DashboardFiltersProps {
  tickets: Ticket[];
  onFiltered: (filtered: Ticket[]) => void;
}

const MultiSelect = ({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
}) => (
  <div className="space-y-2">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
            selected.has(opt)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const DashboardFilters = ({ tickets, onFiltered }: DashboardFiltersProps) => {
  const [regions, setRegions] = useState<Set<string>>(new Set());
  const [priorities, setPriorities] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const allRegions = useMemo(() => [...new Set(tickets.map(t => t.region))].sort(), [tickets]);
  const allPriorities = useMemo(() => [...new Set(tickets.map(t => t.priority))].sort(), [tickets]);
  const allStatuses = useMemo(() => [...new Set(tickets.map(t => t.status))].sort(), [tickets]);

  const toggle = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, val: string) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setFn(next);
  };

  const activeCount = regions.size + priorities.size + statuses.size + (dateRange?.from ? 1 : 0);

  const clearAll = () => {
    setRegions(new Set());
    setPriorities(new Set());
    setStatuses(new Set());
    setDateRange(undefined);
  };

  // Apply filters
  useMemo(() => {
    let filtered = tickets;
    if (regions.size) filtered = filtered.filter(t => regions.has(t.region));
    if (priorities.size) filtered = filtered.filter(t => priorities.has(t.priority));
    if (statuses.size) filtered = filtered.filter(t => statuses.has(t.status));
    if (dateRange?.from) {
      filtered = filtered.filter(t => {
        const d = new Date(t.created_at);
        if (dateRange.from && d < dateRange.from) return false;
        if (dateRange.to && d > new Date(dateRange.to.getTime() + 86400000)) return false;
        return true;
      });
    }
    onFiltered(filtered);
  }, [tickets, regions, priorities, statuses, dateRange]);

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground h-7 px-2">
            <X className="w-3 h-3 mr-1" /> Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MultiSelect label="Region" options={allRegions} selected={regions} onToggle={v => toggle(regions, setRegions, v)} />
        <MultiSelect label="Priority" options={allPriorities} selected={priorities} onToggle={v => toggle(priorities, setPriorities, v)} />
        <MultiSelect label="Status" options={allStatuses} selected={statuses} onToggle={v => toggle(statuses, setStatuses, v)} />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Date Range</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "w-full justify-start text-left text-xs h-8 border-border/50 bg-secondary/50",
                !dateRange?.from && "text-muted-foreground"
              )}>
                <CalendarIcon className="w-3 h-3 mr-2" />
                {dateRange?.from ? (
                  dateRange.to
                    ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                    : format(dateRange.from, "MMM d, yyyy")
                ) : "Select dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
