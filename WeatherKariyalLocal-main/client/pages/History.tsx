import Layout from "@/components/Layout";
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Trash2,
  Shield,
  Lock,
  ChevronDown,
  FileText,
  Database,
  Droplets,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WeatherData, WeatherHistoryResponse, AvailableDatesResponse } from "@shared/api";
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
  
  // New filtering state
  const [availableDates, setAvailableDates] = useState<AvailableDatesResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

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
    fetchAvailableDates();
    fetchWeatherHistory();
  }, []);

  useEffect(() => {
    fetchWeatherHistory();
  }, [selectedYear, selectedMonth]);

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch("/api/weather/dates");
      if (!response.ok) {
        throw new Error("Failed to fetch available dates");
      }
      const data = (await response.json()) as AvailableDatesResponse;
      setAvailableDates(data);
    } catch (error) {
      console.error("Error fetching available dates:", error);
    }
  };

  const fetchWeatherHistory = async () => {
    try {
      setLoading(true);
      let url = "/api/weather/history";
      const params = new URLSearchParams();
      
      if (selectedYear) {
        params.append("year", selectedYear.toString());
      }
      if (selectedMonth) {
        params.append("month", selectedMonth.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
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
      
      // Refresh available dates in case this was the last entry for a month/year
      fetchAvailableDates();
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Failed to delete data. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const downloadData = async (format: 'json' | 'csv') => {
    try {
      setDownloading(true);
      let url = "/api/weather/download";
      const params = new URLSearchParams();
      
      params.append("format", format);
      if (selectedYear) {
        params.append("year", selectedYear.toString());
      }
      if (selectedMonth) {
        params.append("month", selectedMonth.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to download data");
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `weather-data.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to download data. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  const formatTemperature = (temp: number) => `${temp.toFixed(1)}°C`;
  const formatRainfall = (rainfall: number) => `${rainfall.toFixed(1)} mm`;
  const formatHumidity = (humidity: number) => `${humidity}%`;

  const getFilterDescription = () => {
    if (selectedYear && selectedMonth) {
      return `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
    } else if (selectedYear) {
      return `Year ${selectedYear}`;
    }
    return "All Data";
  };

  // Chart data preparation
  const chartData = weatherHistory.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    rainfall: item.rainfall,
    maxTemp: item.maxTemperature,
    minTemp: item.minTemperature,
    humidity: item.humidity,
  }));

  if (loading && !availableDates) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading weather history...</p>
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
          <div className="text-center text-red-600">
            <p className="text-xl mb-4">Error loading weather history</p>
            <p>{error}</p>
            <button
              onClick={fetchWeatherHistory}
              className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Admin Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Weather History
            </h1>
            <p className="text-gray-600">
              Historical weather data for Kariyad - {getFilterDescription()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isAdmin && (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Shield size={16} />
                Admin
              </button>
            )}
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Shield size={14} />
                Admin Mode
              </div>
            )}
          </div>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                  <Lock className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Admin Access</h3>
                <p className="text-gray-600">Enter your admin password</p>
              </div>
              <form onSubmit={handleAdminLogin}>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
                  autoFocus
                />
                {adminError && (
                  <p className="text-red-600 text-sm mb-4 text-center">{adminError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminError("");
                      setAdminPassword("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters and Download Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              {/* Year Selection */}
              <div className="relative">
                <select
                  value={selectedYear || ""}
                  onChange={(e) => {
                    const year = e.target.value ? parseInt(e.target.value) : null;
                    setSelectedYear(year);
                    setSelectedMonth(null); // Reset month when year changes
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {availableDates?.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Month Selection */}
              <div className="relative">
                <select
                  value={selectedMonth || ""}
                  onChange={(e) => {
                    const month = e.target.value ? parseInt(e.target.value) : null;
                    setSelectedMonth(month);
                  }}
                  disabled={!selectedYear}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">All Months</option>
                  {selectedYear && availableDates?.months[selectedYear]?.map(month => (
                    <option key={month} value={month}>{MONTH_NAMES[month - 1]}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              {(selectedYear || selectedMonth) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-black hover:text-gray-600 underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Download Section */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-black">Download:</span>
              <button
                onClick={() => downloadData('json')}
                disabled={downloading}
                className="flex items-center gap-2 px-3 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database size={14} />
                JSON
              </button>
              <button
                onClick={() => downloadData('csv')}
                disabled={downloading}
                className="flex items-center gap-2 px-3 py-2 border border-black text-black text-sm rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={14} />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Loading State for Data */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading filtered data...</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!loading && weatherHistory.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Temperature Chart */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                <TrendingUp size={20} className="text-black" />
                Temperature
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="maxTemp"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Max Temp (°C)"
                    />
                    <Line
                      type="monotone"
                      dataKey="minTemp"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Min Temp (°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rainfall Chart */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                <Calendar size={20} className="text-black" />
                Rainfall
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Bar dataKey="rainfall" fill="#666666" name="Rainfall (mm)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Humidity Chart */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                <Droplets size={20} className="text-black" />
                Humidity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#333333"
                      strokeWidth={2}
                      name="Humidity (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && weatherHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Weather Data Records</h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {weatherHistory.length} records for {getFilterDescription()}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rainfall
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Temp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Temp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Humidity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {weatherHistory.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatRainfall(item.rainfall)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {formatTemperature(item.maxTemperature)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        {formatTemperature(item.minTemperature)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatHumidity(item.humidity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            disabled={deleting === item.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deleting === item.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && weatherHistory.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600">
              {selectedYear || selectedMonth 
                ? `No weather data available for ${getFilterDescription()}. Try adjusting your filters.`
                : "No weather data has been recorded yet."
              }
            </p>
            {(selectedYear || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Show All Data
              </button>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this weather data record? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteWeatherData(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}