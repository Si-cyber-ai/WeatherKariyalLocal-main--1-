"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";

// Example today's weather data — you can replace this with live data
const todayWeather = {
  location: "Kariyad Nambiar School",
  temperature: "31°C",
  rainfall: "12 mm",
  humidity: "78%",
};

export default function GlobeKariyad() {
  const globeRef = useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const globe = Globe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .labelsData([
        {
          lat: 11.341,
          lng: 75.909,
          text: "Kariyad Nambiar School",
        },
      ])
      .labelSize(1.4)
      .labelDotRadius(0.5)
      .labelColor(() => "#3b82f6")
      .onLabelClick(label => {
        if (label.text === "Kariyad Nambiar School") {
          setShowPopup(true);
        }
      });

    if (globeRef.current) {
      globe(globeRef.current);
      globe.pointOfView({ lat: 11.34, lng: 75.91, altitude: 1.8 }, 1000);
    }
  }, []);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg">
      <div ref={globeRef} className="w-full h-full" />

      {showPopup && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl max-w-xs z-10">
          <h3 className="font-semibold text-primary mb-2">
            🌍 {todayWeather.location}
          </h3>
          <ul className="text-sm text-foreground space-y-1">
            <li>🌡 Temperature: <strong>{todayWeather.temperature}</strong></li>
            <li>🌧 Rainfall: <strong>{todayWeather.rainfall}</strong></li>
            <li>💧 Humidity: <strong>{todayWeather.humidity}</strong></li>
          </ul>
          <button
            onClick={() => setShowPopup(false)}
            className="mt-3 text-xs text-blue-600 hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
