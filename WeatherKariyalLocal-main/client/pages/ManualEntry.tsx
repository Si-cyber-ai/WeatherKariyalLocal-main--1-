import Layout from "@/components/Layout";
import { Shield, Save, Lock } from "lucide-react";
import { useState } from "react";

interface FormData {
  date: string;
  rainfall: string;
  maxTemperature: string;
  minTemperature: string;
  humidity: string;
}

export default function ManualEntry() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    rainfall: "",
    maxTemperature: "",
    minTemperature: "",
    humidity: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/weather/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          rainfall: parseFloat(formData.rainfall),
          maxTemperature: parseFloat(formData.maxTemperature),
          minTemperature: parseFloat(formData.minTemperature),
          humidity: parseInt(formData.humidity),
        }),
      });

      if (response.ok) {
        setSubmitMessage("✅ Weather data saved successfully!");
        setFormData({
          date: new Date().toISOString().split("T")[0],
          rainfall: "",
          maxTemperature: "",
          minTemperature: "",
          humidity: "",
        });
      } else {
        throw new Error("Failed to save data");
      }
    } catch (error) {
      setSubmitMessage("❌ Failed to save data. Please try again.");
      console.error("Error submitting data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "12345") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Manual Data Entry
            </h1>
            <p className="text-muted-foreground">
              Secure form for authorized weather data entry
            </p>
          </div>

          {/* Authentication Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg border border-border p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Authorization Required
                </h2>
                <p className="text-sm text-muted-foreground">
                  Please enter the password to access the data entry form
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter password"
                    required
                  />
                  {authError && (
                    <p className="text-sm text-red-600 mt-1">{authError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Access Entry Form</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Manual Data Entry
          </h1>
          <p className="text-muted-foreground">
            Secure form for authorized weather data entry
          </p>
        </div>

        {/* Success Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">
              Access granted. You can now enter weather data.
            </p>
          </div>
        </div>

        {/* Working Form */}
        <div className="bg-white rounded-lg border border-border p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rainfall (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.rainfall}
                  onChange={(e) =>
                    setFormData({ ...formData, rainfall: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.maxTemperature}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTemperature: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Min Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.minTemperature}
                  onChange={(e) =>
                    setFormData({ ...formData, minTemperature: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0"
                  value={formData.humidity}
                  onChange={(e) =>
                    setFormData({ ...formData, humidity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Saving..." : "Save Data"}</span>
              </button>
            </div>
          </form>

          {submitMessage && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                submitMessage.includes("success")
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <p className="text-sm">{submitMessage}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
