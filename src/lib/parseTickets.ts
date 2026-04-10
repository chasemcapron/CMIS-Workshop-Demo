export interface Ticket {
  ticket_id: string;
  created_at: string;
  region: string;
  product_line: string;
  channel: string;
  priority: string;
  status: string;
  resolution_time_hours: number;
  csat_score: number;
  issue_category: string;
  issue_subcategory: string;
  customer_segment: string;
  agent_team: string;
  ticket_summary: string;
}

export function parseCSV(csv: string): Ticket[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = values[i]?.trim() || ''; });
    return {
      ...obj,
      resolution_time_hours: parseFloat(obj.resolution_time_hours) || 0,
      csat_score: parseInt(obj.csat_score) || 0,
    } as Ticket;
  });
}

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
