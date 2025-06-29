import Layout from "@/components/Layout";
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Trash2,
  Shield,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WeatherData } from "@shared/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface WeatherHistoryResponse {
  data: WeatherData[];
  total: number;
  page: number;
  limit: number;
}

export default function History() {
  const [weatherHistory, setWeatherHistory] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "12345") {
      setIsAdmin(true);
      setAdminError("");
      setShowAdminLogin(false);
      setAdminPassword("");
    } else {
      setAdminError("Incorrect admin password.");
      setAdminPassword("");
    }
  };

  useEffect(() => {
    fetchWeatherHistory();
  }, []);

  const fetchWeatherHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/weather/history");
      if (!response.ok) {
        throw new Error("Failed to fetch weather history");
      }
      const data = (await response.json()) as WeatherHistoryResponse;
      setWeatherHistory(data.data);
    } catch (error) {
      console.error("Error fetching weather history:", error);
      setError("Failed to load weather history");
    } finally {
      setLoading(false);
    }
  };

  const deleteWeatherData = async (id: string) => {
    try {
      setDeleting(id);
      const response = await fetch(`/api/weather/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete data");
      }

      // Remove from local state
      setWeatherHistory((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Failed to delete data. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const exportToCsv = () => {
    const headers = [
      "Date",
      "Rainfall (mm)",
      "Max Temperature (°C)",
      "Min Temperature (°C)",
      "Humidity (%)",
    ];

    const csvContent = [
      headers.join(","),
      ...weatherHistory.map((item) =>
        [
          item.date,
          item.rainfall,
          item.maxTemperature,
          item.minTemperature,
          item.humidity,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kariyad-weather-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatChartData = (data: WeatherData[]) => {
    return data
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        rainfall: item.rainfall,
        maxTemp: item.maxTemperature,
        minTemp: item.minTemperature,
        humidity: item.humidity,
      }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading weather history...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchWeatherHistory}
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

  const chartData = formatChartData(weatherHistory);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Weather History
          </h1>
          <p className="text-muted-foreground">
            Complete historical weather data for Kariyad Weather Station
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {weatherHistory.length} records available
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {isAdmin ? (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Admin Mode
                  </span>
                  <button
                    onClick={() => setIsAdmin(false)}
                    className="text-xs text-green-600 hover:text-green-800 underline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="flex items-center space-x-2 px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Admin Login</span>
                </button>
              )}
              <button
                onClick={exportToCsv}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-border p-6 w-full max-w-md mx-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Admin Authentication
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter admin password to manage weather data
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter admin password"
                    required
                  />
                  {adminError && (
                    <p className="text-sm text-red-600 mt-1">{adminError}</p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminError("");
                      setAdminPassword("");
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Charts */}
        {weatherHistory.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Temperature Chart */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Temperature Trends
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxTemp"
                    stroke="hsl(var(--color-climate-blue))"
                    strokeWidth={2}
                    name="Max Temp (°C)"
                    dot={{ fill: "hsl(var(--color-climate-blue))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minTemp"
                    stroke="hsl(var(--color-climate-blue-dark))"
                    strokeWidth={2}
                    name="Min Temp (°C)"
                    dot={{ fill: "hsl(var(--color-climate-blue-dark))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Rainfall Chart */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Rainfall Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="rainfall"
                    fill="hsl(var(--color-climate-blue-light))"
                    name="Rainfall (mm)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity Chart */}
            <div className="bg-white rounded-lg border border-border p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Humidity Levels
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="hsl(var(--color-climate-blue))"
                    strokeWidth={2}
                    name="Humidity (%)"
                    dot={{ fill: "hsl(var(--color-climate-blue))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Historical Data
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rainfall (mm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Max Temp (°C)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Min Temp (°C)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Humidity (%)
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {weatherHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground tabular-nums">
                      {item.rainfall.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground tabular-nums">
                      {item.maxTemperature.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground tabular-nums">
                      {item.minTemperature.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground tabular-nums">
                      {item.humidity}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => deleteWeatherData(item.id)}
                              disabled={deleting === item.id}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleting === item.id ? "Deleting..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="flex items-center space-x-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="text-xs">Delete</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {weatherHistory.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                Start by adding weather data through the manual entry form.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
