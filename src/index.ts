import { Hono } from "hono";
import { cors } from "hono/cors";

// Cada spot tiene coordenadas + dirección (en grados) desde la que el viento/oleaje le perjudica más
const SPOTS: Record<string, { lat: number; lng: number; exposedTo: number }> = {
  "las-canteras":  { lat: 28.14376,           lng: -15.433521,          exposedTo: 350 }, // N  — La Barra protege pero swell del norte pasa
  "el-cabron":     { lat: 27.870666,          lng: -15.386634,          exposedTo: 90  }, // E  — costa este, levante lo arruina
  "puerto-mogan":  { lat: 27.818044,          lng: -15.762344,          exposedTo: 315 }, // NW — bahía muy protegida
  "confital":      { lat: 28.030225341301644, lng: -16.56255406216408,  exposedTo: 10  }, // N/NE — muy expuesto, sin protección // TODO: verificar coordenadas
  "sardina-norte": { lat: 28.152858452818656, lng: -15.696619798760123, exposedTo: 315 }, // NW — cala protegida de alisios
  "tufia":         { lat: 27.957974735351108, lng: -15.381852967612407, exposedTo: 90  }, // E  — costa este
  "anfi-del-mar":  { lat: 27.772846046401682, lng: -15.695869943516328, exposedTo: 200 }, // SSW — laguna artificial, casi siempre bien
  "puerto-rico":   { lat: 27.785613132672776, lng: -15.71285464930681,  exposedTo: 225 }, // SW — bahía muy resguardada
  "guigui":        { lat: 27.948696387501787, lng: -15.827943541112543, exposedTo: 270 }, // W  — expuesto al swell atlántico
  "playa-chica":   { lat: 28.14037965769678,  lng: -15.435942993415766, exposedTo: 350 }, // N  — similar a Las Canteras
  "playa-nieves":  { lat: 28.100491260712374, lng: -15.709068406866088, exposedTo: 315 }, // NW — costa noroeste
  "las-salinas":   { lat: 28.149562092984283, lng: -15.535417047601637, exposedTo: 350 }, // N  — costa norte muy expuesta
  "el-burrero":    { lat: 27.910702195323154, lng: -15.387082230144685, exposedTo: 90  }, // E  — costa este
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// WMO weather code → condición UI
function mapWeatherCode(code: number): { condition: string; icon: string } {
  if (code === 0)  return { condition: "Sunny",         icon: "sunny"        };
  if (code <= 3)   return { condition: "Partly Cloudy", icon: "partly-sunny" };
  if (code <= 48)  return { condition: "Foggy",         icon: "cloudy"       };
  if (code <= 67)  return { condition: "Rainy",         icon: "rainy"        };
  if (code <= 77)  return { condition: "Cloudy",        icon: "cloudy"       };
  if (code <= 82)  return { condition: "Rainy",         icon: "rainy"        };
  return                   { condition: "Thunderstorm", icon: "thunderstorm" };
}

// Grados → dirección cardinal
function degreesToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// Altura de ola → nivel snorkel
function waveLevel(h: number): "Low" | "Medium" | "High" {
  if (h < 0.5) return "Low";
  if (h < 1.0) return "Medium";
  return "High";
}

// Visibilidad estimada: olas + periodo + tiempo
function calcVisibility(
  waveH: number,
  wavePeriod: number,
  weatherCode: number
): { status: "Poor" | "Fair" | "Good" | "Excellent"; meters: number } {
  const isClear = weatherCode <= 3;
  // Periodo largo = más resuspensión del fondo aunque la ola parezca pequeña
  const effectiveH = waveH * (wavePeriod > 10 ? 1.4 : 1.0);
  if (effectiveH < 0.3 && isClear) return { status: "Excellent", meters: 20 };
  if (effectiveH < 0.5 && isClear) return { status: "Good",      meters: 14 };
  if (effectiveH < 0.8)            return { status: "Fair",      meters: 8  };
  return                                   { status: "Poor",      meters: 4  };
}

// Idoneidad para snorkel según olas, periodo, viento y exposición del spot
function calcSuitability(
  waveH: number,
  wavePeriod: number,
  windSpeed: number,
  windDeg: number,
  exposedTo: number
): "Excellent" | "Good" | "Fair" | "Poor" {
  // ¿El viento viene de la dirección mala para este spot?
  const diff = Math.abs(windDeg - exposedTo);
  const angleDiff = diff > 180 ? 360 - diff : diff;
  const adverseWind = angleDiff < 60 && windSpeed > 15;

  // Periodo largo amplifica el efecto de la ola bajo el agua (surge)
  const swellScore = waveH * (wavePeriod > 10 ? 1.5 : 1.0);

  if (swellScore < 0.4 && windSpeed < 15 && !adverseWind) return "Excellent";
  if (swellScore < 0.7 && windSpeed < 25 && !adverseWind) return "Good";
  if (swellScore < 1.2)                                    return "Fair";
  return "Poor";
}

// ─── Fetch condiciones para un spot ──────────────────────────────────────────

async function fetchConditions(spotId: string) {
  const spot = SPOTS[spotId];
  if (!spot) return null;

  const { lat, lng, exposedTo } = spot;

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
      `&current=wave_height,wave_period,sea_surface_temperature`
    ),
  ]);

  if (!forecastRes.ok || !marineRes.ok) return null;

  const [forecast, marine]: [any, any] = await Promise.all([
    forecastRes.json(),
    marineRes.json(),
  ]);

  const cur = forecast.current;
  const mar = marine.current;

  const waveH: number       = mar.wave_height              ?? 0.5;
  const wavePeriod: number  = mar.wave_period              ?? 7;
  const weatherCode: number = cur.weather_code             ?? 0;
  const windSpeed: number   = cur.wind_speed_10m           ?? 0;
  const windDeg: number     = cur.wind_direction_10m       ?? 0;
  const waterTemp: number   = mar.sea_surface_temperature  ?? cur.temperature_2m;

  return {
    waves: {
      height: Math.round(waveH * 10) / 10,
      unit: "m",
      level: waveLevel(waveH),
      period: Math.round(wavePeriod),
    },
    waterTemp: {
      value: Math.round(waterTemp),
      unit: "°C",
    },
    weather: mapWeatherCode(weatherCode),
    visibility: calcVisibility(waveH, wavePeriod, weatherCode),
    wind: {
      speed: Math.round(windSpeed),
      unit: "km/h",
      direction: degreesToCardinal(windDeg),
    },
    suitability: calcSuitability(waveH, wavePeriod, windSpeed, windDeg, exposedTo),
    lastUpdated: new Date().toISOString(),
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────

type Bindings = CloudflareBindings & { CACHE?: KVNamespace };

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

// GET /api/spot/:id — condiciones de un spot
app.get("/api/spot/:id", async (c) => {
  const spotId = c.req.param("id");

  if (!SPOTS[spotId]) {
    return c.json({ error: "Spot not found" }, 404);
  }

  const cacheKey = `conditions:${spotId}`;

  if (c.env.CACHE) {
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) return c.json(JSON.parse(cached));
  }

  const result = await fetchConditions(spotId);
  if (!result) return c.json({ error: "Failed to fetch weather data" }, 502);

  if (c.env.CACHE) {
    await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
  }

  return c.json(result);
});

// GET /api/spots — condiciones de todos los spots en una sola llamada
app.get("/api/spots", async (c) => {
  const spotIds = Object.keys(SPOTS);

  const results = await Promise.all(
    spotIds.map(async (spotId) => {
      const cacheKey = `conditions:${spotId}`;

      if (c.env.CACHE) {
        const cached = await c.env.CACHE.get(cacheKey);
        if (cached) return [spotId, JSON.parse(cached)] as const;
      }

      const conditions = await fetchConditions(spotId);
      if (!conditions) return [spotId, null] as const;

      if (c.env.CACHE) {
        await c.env.CACHE.put(cacheKey, JSON.stringify(conditions), { expirationTtl: 3600 });
      }

      return [spotId, conditions] as const;
    })
  );

  const response = Object.fromEntries(results.filter(([, v]) => v !== null));
  return c.json(response);
});

export default app;
