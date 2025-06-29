import { RequestHandler } from "express";
import {
  WeatherResponse,
  WeatherData,
  DailyWeatherDisplay,
  WeatherComparison,
} from "@shared/api";

// In-memory storage for weather data - in a real app, this would be a database
let weatherDataStore: WeatherData[] = [
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

function createComparison(
  current: number,
  previous: number | null,
): WeatherComparison {
  if (previous === null) {
    return {
      current,
      previous: null,
      change: null,
      changeType: "neutral",
    };
  }

  const change = current - previous;
  let changeType: "increase" | "decrease" | "neutral";

  if (Math.abs(change) < 0.1) {
    changeType = "neutral";
  } else if (change > 0) {
    changeType = "increase";
  } else {
    changeType = "decrease";
  }

  return {
    current,
    previous,
    change,
    changeType,
  };
}

export const handleTodayWeather: RequestHandler = (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];

    // Find today's and yesterday's data
    const todayData = weatherDataStore.find((d) => d.date === today);
    const yesterdayData = weatherDataStore.find(
      (d) => d.date === yesterdayDate,
    );

    // If no data for today, use the most recent entry
    const currentData =
      todayData || weatherDataStore[weatherDataStore.length - 1];

    if (!currentData) {
      return res.status(404).json({ error: "No weather data available" });
    }

    const response: WeatherResponse = {
      today: {
        date: currentData.date,
        rainfall: createComparison(
          currentData.rainfall,
          yesterdayData?.rainfall || null,
        ),
        maxTemperature: createComparison(
          currentData.maxTemperature,
          yesterdayData?.maxTemperature || null,
        ),
        minTemperature: createComparison(
          currentData.minTemperature,
          yesterdayData?.minTemperature || null,
        ),
        humidity: createComparison(
          currentData.humidity,
          yesterdayData?.humidity || null,
        ),
      },
      lastUpdated: currentData.updatedAt,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in handleTodayWeather:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleWeatherHistory: RequestHandler = (req, res) => {
  try {
    // Sort data by date (most recent first)
    const sortedData = [...weatherDataStore].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    res.json({
      data: sortedData,
      total: sortedData.length,
      page: 1,
      limit: 10,
    });
  } catch (error) {
    console.error("Error in handleWeatherHistory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleAddWeatherData: RequestHandler = (req, res) => {
  try {
    const { date, rainfall, maxTemperature, minTemperature, humidity } =
      req.body;

    // Validate required fields
    if (
      !date ||
      rainfall === undefined ||
      maxTemperature === undefined ||
      minTemperature === undefined ||
      humidity === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate data types and ranges
    if (
      isNaN(rainfall) ||
      isNaN(maxTemperature) ||
      isNaN(minTemperature) ||
      isNaN(humidity)
    ) {
      return res
        .status(400)
        .json({ error: "Numeric values must be valid numbers" });
    }

    if (humidity < 0 || humidity > 100) {
      return res
        .status(400)
        .json({ error: "Humidity must be between 0 and 100" });
    }

    if (minTemperature > maxTemperature) {
      return res
        .status(400)
        .json({
          error:
            "Minimum temperature cannot be higher than maximum temperature",
        });
    }

    const now = new Date().toISOString();
    const newId = Date.now().toString();

    // Check if data for this date already exists
    const existingIndex = weatherDataStore.findIndex(
      (item) => item.date === date,
    );

    if (existingIndex >= 0) {
      // Update existing data
      weatherDataStore[existingIndex] = {
        ...weatherDataStore[existingIndex],
        rainfall: Number(rainfall),
        maxTemperature: Number(maxTemperature),
        minTemperature: Number(minTemperature),
        humidity: Number(humidity),
        updatedAt: now,
      };
    } else {
      // Add new data
      const newWeatherData: WeatherData = {
        id: newId,
        date,
        rainfall: Number(rainfall),
        maxTemperature: Number(maxTemperature),
        minTemperature: Number(minTemperature),
        humidity: Number(humidity),
        createdAt: now,
        updatedAt: now,
      };

      weatherDataStore.push(newWeatherData);
    }

    res.json({
      success: true,
      message: "Weather data saved successfully",
      id: existingIndex >= 0 ? weatherDataStore[existingIndex].id : newId,
    });
  } catch (error) {
    console.error("Error in handleAddWeatherData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleDeleteWeatherData: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Weather data ID is required" });
    }

    // Find the index of the data to delete
    const index = weatherDataStore.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Weather data not found" });
    }

    // Remove the data from the store
    weatherDataStore.splice(index, 1);

    res.json({
      success: true,
      message: "Weather data deleted successfully",
    });
  } catch (error) {
    console.error("Error in handleDeleteWeatherData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
