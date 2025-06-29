import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleTodayWeather,
  handleWeatherHistory,
  handleAddWeatherData,
  handleDeleteWeatherData,
} from "./routes/weather";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Weather API routes
  app.get("/api/weather/today", handleTodayWeather);
  app.get("/api/weather/history", handleWeatherHistory);
  app.post("/api/weather/add", handleAddWeatherData);
  app.delete("/api/weather/delete/:id", handleDeleteWeatherData);

  return app;
}
