import { useEffect, useState } from "react";
import {
  CloudRain,
  Thermometer,
  Snowflake,
  Droplets,
  RefreshCw,
} from "lucide-react";
import Layout from "@/components/Layout";
import WeatherMetric from "@/components/WeatherMetric";
import { WeatherResponse } from "@shared/api";

export default function Index() {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/weather/today");
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = (await response.json()) as WeatherResponse;
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Failed to load weather data");
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading weather data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !weatherData) {
    return (
      <Layout>
        <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchWeatherData}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Weather Data KSWS 13144 KNHSS Kariyad
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Live Weather Monitoring – Kariyad Weather Station
          </p>
          <div className="inline-block bg-accent px-4 py-2 rounded-lg">
            <p className="text-sm font-medium text-accent-foreground">
              Today: {formattedDate}
            </p>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <WeatherMetric
            label="Rainfall"
            icon={<CloudRain className="w-5 h-5 md:w-6 md:h-6" />}
            value={weatherData.today.rainfall.current}
            unit="mm"
            comparison={weatherData.today.rainfall}
            bgColor="bg-blue-100"
            iconColor="text-blue-500"
          />
          <WeatherMetric
            label="Max Temperature"
            icon={<Thermometer className="w-5 h-5 md:w-6 md:h-6" />}
            value={weatherData.today.maxTemperature.current}
            unit="°C"
            comparison={weatherData.today.maxTemperature}
            bgColor="bg-red-100"
            iconColor="text-red-500"
          />
          <WeatherMetric
            label="Min Temperature"
            icon={<Snowflake className="w-5 h-5 md:w-6 md:h-6" />}
            value={weatherData.today.minTemperature.current}
            unit="°C"
            comparison={weatherData.today.minTemperature}
            bgColor="bg-cyan-100"
            iconColor="text-cyan-500"
          />
          <WeatherMetric
            label="Relative Humidity"
            icon={<Droplets className="w-5 h-5 md:w-6 md:h-6" />}
            value={weatherData.today.humidity.current}
            unit="%"
            comparison={weatherData.today.humidity}
            bgColor="bg-green-100"
            iconColor="text-green-500"
          />
        </div>

        {/* Last Updated & Refresh */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <p className="text-sm text-muted-foreground">
              Last updated: {formatLastUpdated(weatherData.lastUpdated)}
            </p>
            <button
              onClick={fetchWeatherData}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* School Information */}
        <div className="mt-12 bg-accent rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-accent-foreground mb-3">
              Kariyad Nambiar Higher Secondary School
            </h2>
            <p className="text-accent-foreground/80 max-w-2xl mx-auto">
              Kerala is actively setting up weather stations in government and
              government-aided schools to enhance geography education and track
              local weather patterns. These stations, part of the Samagra
              Shiksha Kerala (SSK) initiative, provide students with hands-on
              experience in weather monitoring and data collection, making
              learning more practical and engaging.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
