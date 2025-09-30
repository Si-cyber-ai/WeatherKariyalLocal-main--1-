import { RequestHandler } from "express";
import {
  WeatherResponse,
  WeatherData,
  DailyWeatherDisplay,
  WeatherComparison,
  WeatherHistoryResponse,
  AvailableDatesResponse,
} from "@shared/api";
import { weatherStore } from "../storage/hybridWeatherStorage.js";

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

export const handleTodayWeather: RequestHandler = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Find today's data first
    const todayData = await weatherStore.getByDate(today);
    
    let currentData: WeatherData | null = null;
    let previousData: WeatherData | null = null;

    if (todayData) {
      // If we have today's data, use it and look for yesterday's data
      currentData = todayData;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split("T")[0];
      previousData = await weatherStore.getByDate(yesterdayDate);
    } else {
      // If no today's data, use the most recent entry
      const allData = (await weatherStore.getAll()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      if (allData.length === 0) {
        return res.status(404).json({ error: "No weather data available" });
      }
      
      currentData = allData[0]; // Most recent entry
      
      // Find the actual previous day's data relative to the current data
      const currentDate = new Date(currentData.date);
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      const previousDateString = previousDate.toISOString().split("T")[0];
      
      previousData = await weatherStore.getByDate(previousDateString);
    }

    if (!currentData) {
      return res.status(404).json({ error: "No weather data available" });
    }

    const response: WeatherResponse = {
      today: {
        date: currentData.date,
        rainfall: createComparison(
          currentData.rainfall,
          previousData?.rainfall || null,
        ),
        maxTemperature: createComparison(
          currentData.maxTemperature,
          previousData?.maxTemperature || null,
        ),
        minTemperature: createComparison(
          currentData.minTemperature,
          previousData?.minTemperature || null,
        ),
        humidity: createComparison(
          currentData.humidity,
          previousData?.humidity || null,
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

export const handleWeatherHistory: RequestHandler = async (req, res) => {
  try {
    const { year, month } = req.query;

    let data: WeatherData[];
    
    if (year && month) {
      // Get data for specific month
      data = await weatherStore.getByMonth(parseInt(year as string), parseInt(month as string));
    } else if (year) {
      // Get data for specific year
      data = await weatherStore.getByYear(parseInt(year as string));
    } else {
      // Get all data
      data = await weatherStore.getAll();
    }

    // Sort data by date (most recent first)
    const sortedData = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    res.json({
      data: sortedData,
      total: sortedData.length,
      page: 1,
      limit: sortedData.length,
    });
  } catch (error) {
    console.error("Error in handleWeatherHistory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleAddWeatherData: RequestHandler = async (req, res) => {
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

    // Check if data exists for this date
    const existingData = await weatherStore.getByDate(date);
    let savedData: WeatherData;

    if (existingData) {
      // Update existing data
      savedData = await weatherStore.update(existingData.id, {
        rainfall: Number(rainfall),
        maxTemperature: Number(maxTemperature),
        minTemperature: Number(minTemperature),
        humidity: Number(humidity),
      }) as WeatherData;
    } else {
      // Add new data
      savedData = await weatherStore.add({
        date,
        rainfall: Number(rainfall),
        maxTemperature: Number(maxTemperature),
        minTemperature: Number(minTemperature),
        humidity: Number(humidity),
      });
    }

    res.json({
      success: true,
      message: "Weather data saved successfully",
      id: savedData.id,
    });
  } catch (error) {
    console.error("Error in handleAddWeatherData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleDeleteWeatherData: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Weather data ID is required" });
    }

    // Try to delete the data
    const deleted = await weatherStore.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Weather data not found" });
    }

    res.json({
      success: true,
      message: "Weather data deleted successfully",
    });
  } catch (error) {
    console.error("Error in handleDeleteWeatherData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleDownloadWeatherData: RequestHandler = async (req, res) => {
  try {
    const { year, month, format = "json" } = req.query;

    let data: WeatherData[];
    let filename: string;
    
    if (year && month) {
      // Get data for specific month
      data = await weatherStore.getByMonth(parseInt(year as string), parseInt(month as string));
      filename = `weather-data-${year}-${String(month).padStart(2, '0')}`;
    } else if (year) {
      // Get data for specific year
      data = await weatherStore.getByYear(parseInt(year as string));
      filename = `weather-data-${year}`;
    } else {
      // Get all data
      data = await weatherStore.getAll();
      filename = `weather-data-all`;
    }

    // Sort data by date (chronological order for download)
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    if (format === "csv") {
      // Generate CSV
      const csvHeader = "Date,Rainfall (mm),Max Temperature (°C),Min Temperature (°C),Humidity (%),Created At,Updated At\n";
      const csvRows = sortedData.map(item => 
        `${item.date},${item.rainfall},${item.maxTemperature},${item.minTemperature},${item.humidity},${item.createdAt},${item.updatedAt}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csvContent);
    } else {
      // Generate JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: sortedData.length,
        data: sortedData
      });
    }
  } catch (error) {
    console.error("Error in handleDownloadWeatherData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleGetAvailableDates: RequestHandler = async (req, res) => {
  try {
    const availableDates = await weatherStore.getAvailableDates();

    res.json({
      years: availableDates.years,
      months: availableDates.months,
      totalRecords: availableDates.totalRecords,
    } as AvailableDatesResponse);
  } catch (error) {
    console.error("Error in handleGetAvailableDates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
