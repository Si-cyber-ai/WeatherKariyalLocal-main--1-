import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { WeatherComparison } from "@shared/api";
import React from "react";

interface WeatherMetricProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  unit: string;
  comparison: WeatherComparison;
  bgColor?: string;
  iconColor?: string;
}

export default function WeatherMetric({
  label,
  icon,
  value,
  unit,
  comparison,
  bgColor = "bg-white",
  iconColor = "text-primary",
}: WeatherMetricProps) {
  const getChangeIcon = () => {
    switch (comparison.changeType) {
      case "increase":
        return (
          <TrendingUp className="w-4 h-4 text-[hsl(var(--color-increase))]" />
        );
      case "decrease":
        return (
          <TrendingDown className="w-4 h-4 text-[hsl(var(--color-decrease))]" />
        );
      default:
        return <Minus className="w-4 h-4 text-[hsl(var(--color-neutral))]" />;
    }
  };

  const getChangeText = () => {
    if (comparison.previous === null) {
      return "No previous data";
    }
    if (comparison.change === null || comparison.change === 0) {
      return "No change";
    }
    const sign = comparison.change > 0 ? "+" : "";
    return `${sign}${comparison.change.toFixed(1)}${unit}`;
  };

  const getChangeColor = () => {
    switch (comparison.changeType) {
      case "increase":
        return "text-[hsl(var(--color-increase))]";
      case "decrease":
        return "text-[hsl(var(--color-decrease))]";
      default:
        return "text-[hsl(var(--color-neutral))]";
    }
  };

  return (
    <div className={`rounded-lg p-6 ${bgColor}`}>
      {/* Header with icon and label */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </h3>
      </div>

      {/* Main value */}
      <div className="flex items-baseline space-x-2 mb-3">
        <span className="text-3xl font-bold text-foreground tabular-nums">
          {value.toFixed(1)}
        </span>
        <span className="text-lg text-muted-foreground">{unit}</span>
      </div>

      {/* Comparison with yesterday */}
      <div className="flex items-center space-x-2">
        {comparison.previous !== null && getChangeIcon()}
        <span className={`text-sm font-medium ${getChangeColor()}`}>
          {getChangeText()}
        </span>
        {comparison.previous !== null && (
          <span className="text-xs text-muted-foreground">vs previous day</span>
        )}
      </div>
    </div>
  );
}
