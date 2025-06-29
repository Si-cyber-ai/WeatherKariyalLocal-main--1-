/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Weather data types for Kariyad Weather Station
 */
export interface WeatherData {
  id: string;
  date: string; // ISO date string
  rainfall: number; // mm
  maxTemperature: number; // °C
  minTemperature: number; // °C
  humidity: number; // %
  createdAt: string;
  updatedAt: string;
}

export interface WeatherComparison {
  current: number;
  previous: number | null;
  change: number | null;
  changeType: "increase" | "decrease" | "neutral";
}

export interface DailyWeatherDisplay {
  date: string;
  rainfall: WeatherComparison;
  maxTemperature: WeatherComparison;
  minTemperature: WeatherComparison;
  humidity: WeatherComparison;
}

export interface WeatherResponse {
  today: DailyWeatherDisplay;
  lastUpdated: string;
}
