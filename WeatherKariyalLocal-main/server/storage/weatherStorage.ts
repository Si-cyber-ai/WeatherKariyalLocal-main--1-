import { WeatherData } from "@shared/api";
import fs from "fs";
import path from "path";

// Path to store weather data
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

// Load weather data from file
function loadWeatherData(): WeatherData[] {
  try {
    if (!fs.existsSync(WEATHER_DATA_FILE)) {
      // If file doesn't exist, create it with default data
      saveWeatherData(defaultWeatherData);
      return defaultWeatherData;
    }
    
    const fileContent = fs.readFileSync(WEATHER_DATA_FILE, "utf-8");
    const data = JSON.parse(fileContent);
    
    // Validate that data is an array
    if (!Array.isArray(data)) {
      console.warn("Invalid weather data format, using default data");
      saveWeatherData(defaultWeatherData);
      return defaultWeatherData;
    }
    
    return data;
  } catch (error) {
    console.error("Error loading weather data:", error);
    // If there's any error, return default data and try to save it
    saveWeatherData(defaultWeatherData);
    return defaultWeatherData;
  }
}

// Save weather data to file
function saveWeatherData(data: WeatherData[]): void {
  try {
    fs.writeFileSync(WEATHER_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving weather data:", error);
    throw new Error("Failed to save weather data");
  }
}

// Create a backup of current data
function createBackup(): void {
  try {
    const data = loadWeatherData();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(DATA_DIR, `weather-data-backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Backup created: ${backupFile}`);
  } catch (error) {
    console.error("Error creating backup:", error);
  }
}

// Weather data store class
export class WeatherDataStore {
  private data: WeatherData[] = [];

  constructor() {
    this.data = loadWeatherData();
  }

  // Get all weather data
  getAll(): WeatherData[] {
    return [...this.data];
  }

  // Get weather data by date
  getByDate(date: string): WeatherData | undefined {
    return this.data.find(item => item.date === date);
  }

  // Get weather data by ID
  getById(id: string): WeatherData | undefined {
    return this.data.find(item => item.id === id);
  }

  // Add new weather data
  add(weatherData: Omit<WeatherData, "id" | "createdAt" | "updatedAt">): WeatherData {
    const now = new Date().toISOString();
    const newId = Date.now().toString();

    const newWeatherData: WeatherData = {
      ...weatherData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    this.data.push(newWeatherData);
    saveWeatherData(this.data);
    
    return newWeatherData;
  }

  // Update existing weather data
  update(id: string, updates: Partial<Omit<WeatherData, "id" | "createdAt">>): WeatherData | null {
    const index = this.data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }

    const now = new Date().toISOString();
    this.data[index] = {
      ...this.data[index],
      ...updates,
      updatedAt: now,
    };

    saveWeatherData(this.data);
    return this.data[index];
  }

  // Update or add weather data by date
  upsertByDate(date: string, weatherData: Omit<WeatherData, "id" | "createdAt" | "updatedAt">): WeatherData {
    const existingIndex = this.data.findIndex(item => item.date === date);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing
      this.data[existingIndex] = {
        ...this.data[existingIndex],
        ...weatherData,
        date, // Ensure date is preserved
        updatedAt: now,
      };
      saveWeatherData(this.data);
      return this.data[existingIndex];
    } else {
      // Add new
      return this.add({ ...weatherData, date });
    }
  }

  // Delete weather data by ID
  delete(id: string): boolean {
    const index = this.data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }

    this.data.splice(index, 1);
    saveWeatherData(this.data);
    return true;
  }

  // Get weather data for a specific month/year
  getByMonth(year: number, month: number): WeatherData[] {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return this.data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  // Get weather data for a specific year
  getByYear(year: number): WeatherData[] {
    return this.data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === year;
    });
  }

  // Get available years
  getAvailableYears(): number[] {
    const years = new Set<number>();
    this.data.forEach(item => {
      const year = new Date(item.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }

  // Get available months for a year
  getAvailableMonths(year: number): number[] {
    const months = new Set<number>();
    this.data.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate.getFullYear() === year) {
        months.add(itemDate.getMonth() + 1); // getMonth() returns 0-11
      }
    });
    return Array.from(months).sort((a, b) => b - a); // Most recent first
  }

  // Create backup
  backup(): void {
    createBackup();
  }

  // Get total count
  count(): number {
    return this.data.length;
  }
}

// Export singleton instance
export const weatherStore = new WeatherDataStore();