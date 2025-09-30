import { WeatherData } from "@shared/api";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const WEATHER_TABLE = process.env.SUPABASE_WEATHER_TABLE || "weather_data";

async function supabaseRequest(endpoint: string, method: string = "GET", body?: any) {
  if (!SUPABASE_URL || !SUPABASE_API_KEY) throw new Error("Supabase credentials not configured");
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers: Record<string, string> = {
    "apikey": SUPABASE_API_KEY,
    "Authorization": `Bearer ${SUPABASE_API_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  const config: RequestInit = { method, headers };
  if (body) config.body = JSON.stringify(body);
  const res = await fetch(url, config);
  if (!res.ok) throw new Error(`Supabase error: ${res.status} - ${await res.text()}`);
  return await res.json();
}

export const supabaseWeatherStorage = {
  async getAll(): Promise<WeatherData[]> {
    return await supabaseRequest(`${WEATHER_TABLE}?order=date.desc`);
  },
  async getById(id: string): Promise<WeatherData | null> {
    const result = await supabaseRequest(`${WEATHER_TABLE}?id=eq.${id}`);
    return result[0] || null;
  },
  async getByDate(date: string): Promise<WeatherData | null> {
    const result = await supabaseRequest(`${WEATHER_TABLE}?date=eq.${date}`);
    return result[0] || null;
  },
  async add(data: Omit<WeatherData, "id" | "createdAt" | "updatedAt">): Promise<WeatherData> {
    const now = new Date().toISOString();
    const newData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await supabaseRequest(`${WEATHER_TABLE}`, "POST", [newData]);
    return result[0];
  },
  async update(id: string, data: Partial<Omit<WeatherData, "id" | "createdAt">>): Promise<WeatherData | null> {
    const now = new Date().toISOString();
    const result = await supabaseRequest(`${WEATHER_TABLE}?id=eq.${id}`, "PATCH", { ...data, updatedAt: now });
    return result[0] || null;
  },
  async delete(id: string): Promise<boolean> {
    await supabaseRequest(`${WEATHER_TABLE}?id=eq.${id}`, "DELETE");
    return true;
  },
  async getByMonth(year: number, month: number): Promise<WeatherData[]> {
    const start = `${year}-${month.toString().padStart(2, "0")}-01`;
    const end = `${year}-${month.toString().padStart(2, "0")}-31`;
    return await supabaseRequest(`${WEATHER_TABLE}?date=gte.${start}&date=lte.${end}&order=date.desc`);
  },
  async getByYear(year: number): Promise<WeatherData[]> {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    return await supabaseRequest(`${WEATHER_TABLE}?date=gte.${start}&date=lte.${end}&order=date.desc`);
  },
  async getAvailableDates(): Promise<{ years: number[], months: Record<number, number[]>, totalRecords: number }> {
    const all = await supabaseWeatherStorage.getAll();
    const years = new Set<number>();
    const months: Record<number, Set<number>> = {};
    all.forEach(item => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      years.add(year);
      if (!months[year]) months[year] = new Set();
      months[year].add(month);
    });
    const result = {
      years: Array.from(years).sort((a, b) => b - a),
      months: {} as Record<number, number[]>,
      totalRecords: all.length
    };
    Object.keys(months).forEach(year => {
      result.months[parseInt(year)] = Array.from(months[parseInt(year)]).sort((a, b) => a - b);
    });
    return result;
  }
};
