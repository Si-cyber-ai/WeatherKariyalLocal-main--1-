import { WeatherData } from "@shared/api";
import { supabaseWeatherStorage } from "./supabaseWeatherStorage.js";
import fs from "fs";
import path from "path";

// Path to store weather data (fallback)
const DATA_DIR = path.join(process.cwd(), "data");
const WEATHER_DATA_FILE = path.join(DATA_DIR, "weather-data.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default weather data
const defaultWeatherData: WeatherData[] = [
  {
    id: "1",
    date: "2025-01-15",
    rainfall: 12.5,
    maxTemperature: 32.1,
    minTemperature: 24.8,
    humidity: 78,
    createdAt: "2025-01-15T06:00:00Z",
    updatedAt: "2025-01-15T06:00:00Z",
  },
  {
    id: "2",
    date: "2025-01-14",
    rainfall: 8.2,
    maxTemperature: 31.5,
    minTemperature: 25.3,
    humidity: 75,
    createdAt: "2025-01-14T06:00:00Z",
    updatedAt: "2025-01-14T06:00:00Z",
  },
];

// File storage fallback functions
function loadWeatherDataFromFile(): WeatherData[] {
  try {
    if (!fs.existsSync(WEATHER_DATA_FILE)) {
      saveWeatherDataToFile(defaultWeatherData);
      return defaultWeatherData;
    }
    
    const fileContent = fs.readFileSync(WEATHER_DATA_FILE, "utf-8");
    const data = JSON.parse(fileContent);
    
    if (!Array.isArray(data)) {
      console.warn("Invalid weather data format, using default data");
      saveWeatherDataToFile(defaultWeatherData);
      return defaultWeatherData;
    }
    
    return data;
  } catch (error) {
    console.error("Error loading weather data from file:", error);
    saveWeatherDataToFile(defaultWeatherData);
    return defaultWeatherData;
  }
}

function saveWeatherDataToFile(data: WeatherData[]): void {
  try {
    fs.writeFileSync(WEATHER_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving weather data to file:", error);
    throw new Error("Failed to save weather data to file");
  }
}

// Hybrid storage class that uses MongoDB when available, file storage as fallback
export class WeatherDataStore {
  private fileData: WeatherData[] = [];
  private useDatabase = false;

  constructor() {
    this.fileData = loadWeatherDataFromFile();
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.useDatabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_API_KEY;
    console.log("Environment check:");
    console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "✓ Set" : "✗ Missing");
    console.log("SUPABASE_API_KEY:", process.env.SUPABASE_API_KEY ? "✓ Set" : "✗ Missing");
    
    if (this.useDatabase) {
      console.log("✅ Using Supabase for persistent storage");
    } else {
      console.log("📁 Using file storage (local development)");
    }
  }

  // Get all weather data
  async getAll(): Promise<WeatherData[]> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.getAll();
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        return [...this.fileData];
      }
    }
    return [...this.fileData];
  }

  // Get weather data by date
  async getByDate(date: string): Promise<WeatherData | null> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.getByDate(date);
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        return this.fileData.find(item => item.date === date) || null;
      }
    }
    return this.fileData.find(item => item.date === date) || null;
  }

  // Get weather data by ID
  async getById(id: string): Promise<WeatherData | null> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.getById(id);
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        return this.fileData.find(item => item.id === id) || null;
      }
    }
    return this.fileData.find(item => item.id === id) || null;
  }

  // Add new weather data
  async add(weatherData: Omit<WeatherData, "id" | "createdAt" | "updatedAt">): Promise<WeatherData> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.add(weatherData);
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        // Fall through to file storage
      }
    }

    // File storage implementation
    const now = new Date().toISOString();
    const newId = Date.now().toString();

    const newWeatherData: WeatherData = {
      ...weatherData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    this.fileData.push(newWeatherData);
    saveWeatherDataToFile(this.fileData);
    console.log("Weather data added to file storage:", newId);
    return newWeatherData;
  }

  // Update weather data
  async update(id: string, weatherData: Partial<Omit<WeatherData, "id" | "createdAt">>): Promise<WeatherData | null> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.update(id, weatherData);
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        // Fall through to file storage
      }
    }

    // File storage implementation
    const index = this.fileData.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }

    const updatedData: WeatherData = {
      ...this.fileData[index],
      ...weatherData,
      updatedAt: new Date().toISOString(),
    };

    this.fileData[index] = updatedData;
    saveWeatherDataToFile(this.fileData);
    console.log("Weather data updated in file storage:", id);
    return updatedData;
  }

  // Delete weather data
  async delete(id: string): Promise<boolean> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.delete(id);
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        // Fall through to file storage
      }
    }

    // File storage implementation
    const index = this.fileData.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }

    this.fileData.splice(index, 1);
    saveWeatherDataToFile(this.fileData);
    console.log("Weather data deleted from file storage:", id);
    return true;
  }

  // Get weather data by month
  async getByMonth(year: number, month: number): Promise<WeatherData[]> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.getByMonth(year, month);
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        // Fall through to file storage
      }
    }

    // File storage implementation
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    // Get the last day of the month dynamically
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;
    console.log(`Filtering file data for ${year}-${month}: ${startDate} to ${endDate}`);
    
    return this.fileData
      .filter(item => item.date >= startDate && item.date <= endDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get weather data by year
  async getByYear(year: number): Promise<WeatherData[]> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.getByYear(year);
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        // Fall through to file storage
      }
    }

    // File storage implementation
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    return this.fileData
      .filter(item => item.date >= startDate && item.date <= endDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get available dates
  async getAvailableDates(): Promise<{ years: number[], months: Record<number, number[]>, totalRecords: number }> {
    if (this.useDatabase) {
      try {
        return await supabaseWeatherStorage.getAvailableDates();
      } catch (error) {
        console.error("Supabase error, falling back to file storage:", error);
        // Fall through to file storage
      }
    }

    // File storage implementation
    const years = new Set<number>();
    const months: Record<number, Set<number>> = {};
    
    this.fileData.forEach(item => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      years.add(year);
      if (!months[year]) {
        months[year] = new Set();
      }
      months[year].add(month);
    });
    
    const result = {
      years: Array.from(years).sort((a, b) => b - a),
      months: {} as Record<number, number[]>,
      totalRecords: this.fileData.length
    };
    
    Object.keys(months).forEach(year => {
      result.months[parseInt(year)] = Array.from(months[parseInt(year)]).sort((a, b) => a - b);
    });
    
    return result;
  }

  // Create backup (file storage only)
  createBackup(): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = path.join(DATA_DIR, `weather-data-backup-${timestamp}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(this.fileData, null, 2), "utf-8");
      console.log(`Backup created: ${backupFile}`);
    } catch (error) {
      console.error("Error creating backup:", error);
    }
  }
}

// Export singleton instance
export const weatherStore = new WeatherDataStore();