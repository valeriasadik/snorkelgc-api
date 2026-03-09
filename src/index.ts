import { Hono } from "hono";
import { cors } from "hono/cors";

// Coordinates for each spot (mirrors spots.json in the Angular app)
const SPOTS: Record<string, { lat: number; lng: number }> = {
  "las-canteras":  { lat: 28.14376,              lng: -15.433521             },
  "el-cabron":     { lat: 27.870666,             lng: -15.386634             },
  "puerto-mogan":  { lat: 27.818044,             lng: -15.762344             },
  "confital":      { lat: 28.030225341301644,    lng: -16.56255406216408     }, // TODO: verificar coordenadas
  "sardina-norte": { lat: 28.152858452818656,    lng: -15.696619798760123    },
  "tufia":         { lat: 27.957974735351108,    lng: -15.381852967612407    },
  "anfi-del-mar":  { lat: 27.772846046401682,    lng: -15.695869943516328    },
  "puerto-rico":   { lat: 27.785613132672776,    lng: -15.71285464930681     },
  "guigui":        { lat: 27.948696387501787,    lng: -15.827943541112543    },
  "playa-chica":   { lat: 28.14037965769678,     lng: -15.435942993415766    },
  "playa-nieves":  { lat: 28.100491260712374,    lng: -15.709068406866088    },
  "las-salinas":   { lat: 28.149562092984283,    lng: -15.535417047601637    },
  "el-burrero":    { lat: 27.910702195323154,    lng: -15.387082230144685    },
};

// WMO weather code → UI condition
function mapWeatherCode(code: number): { condition: string; icon: string } {
  if (code === 0)  return { condition: "Sunny",         icon: "sunny" };
  if (code <= 3)   return { condition: "Partly Cloudy", icon: "partly-sunny" };
  if (code <= 48)  return { condition: "Foggy",         icon: "cloudy" };
  if (code <= 67)  return { condition: "Rainy",         icon: "rainy" };
  if (code <= 77)  return { condition: "Cloudy",        icon: "cloudy" };
  if (code <= 82)  return { condition: "Rainy",         icon: "rainy" };
  return           { condition: "Thunderstorm",         icon: "thunderstorm" };
}

// Wind degrees → cardinal direction
function degreesToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// Wave height → snorkel level
function waveLevel(h: number): "Low" | "Medium" | "High" {
  if (h < 0.5) return "Low";
  if (h < 1.0) return "Medium";
  return "High";
}

// Visibility heuristic from wave height + weather clarity
function calcVisibility(
  waveH: number,
  weatherCode: number
): { status: "Poor" | "Fair" | "Good" | "Excellent"; meters: number } {
  const isClear = weatherCode <= 3;
  if (waveH < 0.3 && isClear) return { status: "Excellent", meters: 20 };
  if (waveH < 0.5 && isClear) return { status: "Good",      meters: 14 };
  if (waveH < 0.8)            return { status: "Fair",      meters: 8  };
  return                             { status: "Poor",      meters: 4  };
}

type Bindings = CloudflareBindings & { CACHE?: KVNamespace };

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

app.get("/api/spot/:id", async (c) => {
  const spotId = c.req.param("id");
  const coords = SPOTS[spotId];

  if (!coords) {
    return c.json({ error: "Spot not found" }, 404);
  }

  const cacheKey = `conditions:${spotId}`;

  // Return cached result if available
  if (c.env.CACHE) {
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }
  }

  // Fetch weather + marine data in parallel from Open-Meteo
  const { lat, lng } = coords;
  const [forecastRes, marineRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m` +
      `&wind_speed_unit=kmh&timezone=auto`
    ),
    fetch(
      `https://marine-api.open-meteo.com/v1/marine` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=wave_height,sea_surface_temperature`
    ),
  ]);

  if (!forecastRes.ok || !marineRes.ok) {
    return c.json({ error: "Failed to fetch weather data" }, 502);
  }

  const [forecast, marine]: [any, any] = await Promise.all([
    forecastRes.json(),
    marineRes.json(),
  ]);

  const cur = forecast.current;
  const mar = marine.current;

  const waveH: number      = mar.wave_height             ?? 0.5;
  const weatherCode: number = cur.weather_code           ?? 0;
  const waterTempRaw: number = mar.sea_surface_temperature ?? cur.temperature_2m;

  const result = {
    waves: {
      height: Math.round(waveH * 10) / 10,
      unit: "m",
      level: waveLevel(waveH),
    },
    waterTemp: {
      value: Math.round(waterTempRaw),
      unit: "°C",
    },
    weather: mapWeatherCode(weatherCode),
    visibility: calcVisibility(waveH, weatherCode),
    wind: {
      speed: Math.round(cur.wind_speed_10m),
      unit: "km/h",
      direction: degreesToCardinal(cur.wind_direction_10m),
    },
    lastUpdated: new Date().toISOString(),
  };

  // Cache for 1 hour
  if (c.env.CACHE) {
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 3600,
    });
  }

  return c.json(result);
});

export default app;
