import { Hono } from "hono";
import { cors } from "hono/cors";

// ─── D1 row types ─────────────────────────────────────────────────────────────

interface SpotRow {
  id: string;
  name: string;
  lat: number;
  lng: number;
  exposed_to: number;
  difficulty: string;
  description: string | null;
  image_url: string | null;
  entry_point: string | null;
  best_time: string | null;
}

interface FacilityRow {
  spot_id: string;
  type: string;
  available: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapWeatherCode(code: number): { condition: string; icon: string } {
  if (code === 0)  return { condition: "Sunny",         icon: "sunny"        };
  if (code <= 3)   return { condition: "Partly Cloudy", icon: "partly-sunny" };
  if (code <= 48)  return { condition: "Foggy",         icon: "cloudy"       };
  if (code <= 67)  return { condition: "Rainy",         icon: "rainy"        };
  if (code <= 77)  return { condition: "Cloudy",        icon: "cloudy"       };
  if (code <= 82)  return { condition: "Rainy",         icon: "rainy"        };
  return                   { condition: "Thunderstorm", icon: "thunderstorm" };
}

function degreesToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function waveLevel(h: number): "Low" | "Medium" | "High" {
  if (h < 0.5) return "Low";
  if (h < 1.0) return "Medium";
  return "High";
}

function calcVisibility(
  waveH: number,
  wavePeriod: number,
  weatherCode: number
): { status: "Poor" | "Fair" | "Good" | "Excellent"; meters: number } {
  const isClear = weatherCode <= 3;
  const effectiveH = waveH * (wavePeriod > 10 ? 1.4 : 1.0);
  if (effectiveH < 0.3 && isClear) return { status: "Excellent", meters: 20 };
  if (effectiveH < 0.5 && isClear) return { status: "Good",      meters: 14 };
  if (effectiveH < 0.8)            return { status: "Fair",      meters: 8  };
  return                                   { status: "Poor",      meters: 4  };
}

function calcScore(
  waveH: number,
  wavePeriod: number,
  windSpeed: number,
  windDeg: number,
  exposedTo: number,
  weatherCode: number
): number {
  // Olas (40%) — factor más importante para snorkel
  const waveScore = Math.max(0, Math.min(10, 10 - waveH * 6));

  // Viento (25%)
  const windScore = Math.max(0, Math.min(10, 10 - windSpeed / 4));

  // Visibilidad por clima (20%)
  const visScore = weatherCode <= 3 ? 10 : weatherCode <= 48 ? 6 : 3;

  // Protección del spot (15%) — bonus si el viento no viene de la dirección adversa
  const diff = Math.abs(windDeg - exposedTo);
  const angleDiff = diff > 180 ? 360 - diff : diff;
  const exposureScore = angleDiff > 90 ? 10 : angleDiff > 60 ? 6 : 2;

  const raw = waveScore * 0.40 + windScore * 0.25 + visScore * 0.20 + exposureScore * 0.15;
  return Math.round(raw * 10) / 10;
}

function scoreToSuitability(score: number): "Excellent" | "Good" | "Fair" | "Poor" {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Fair";
  return "Poor";
}

function facilitiesToFlags(rows: FacilityRow[]): {
  parking: boolean;
  showers: boolean;
  restaurant: boolean;
  lifeguard: boolean;
} {
  const has = (type: string) => rows.some(f => f.type === type && f.available === 1);
  return {
    parking:    has("parking"),
    showers:    has("showers"),
    restaurant: has("restaurant"),
    lifeguard:  has("lifeguard"),
  };
}

// Agrupa filas de facilities por spot_id en un Map
function groupFacilities(rows: FacilityRow[]): Map<string, FacilityRow[]> {
  const map = new Map<string, FacilityRow[]>();
  for (const row of rows) {
    if (!map.has(row.spot_id)) map.set(row.spot_id, []);
    map.get(row.spot_id)!.push(row);
  }
  return map;
}

// ─── Fetch condiciones meteorológicas ─────────────────────────────────────────

type ConditionsResult = {
  score: number;
  suitability: "Excellent" | "Good" | "Fair" | "Poor";
  conditions: {
    waves: { height: number; unit: string; level: string; period: number };
    waterTemp: { value: number; unit: string };
    weather: { condition: string; icon: string };
    visibility: { status: string; meters: number };
    wind: { speed: number; unit: string; direction: string };
  };
  lastUpdated: string;
};

async function fetchConditions(
  lat: number,
  lng: number,
  exposedTo: number
): Promise<ConditionsResult | null> {
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

  const waveH: number       = mar.wave_height             ?? 0.5;
  const wavePeriod: number  = mar.wave_period             ?? 7;
  const weatherCode: number = cur.weather_code            ?? 0;
  const windSpeed: number   = cur.wind_speed_10m          ?? 0;
  const windDeg: number     = cur.wind_direction_10m      ?? 0;
  const waterTemp: number   = mar.sea_surface_temperature ?? cur.temperature_2m;

  const score = calcScore(waveH, wavePeriod, windSpeed, windDeg, exposedTo, weatherCode);

  return {
    score,
    suitability: scoreToSuitability(score),
    conditions: {
      waves: {
        height: Math.round(waveH * 10) / 10,
        unit: "m",
        level: waveLevel(waveH),
        period: Math.round(wavePeriod),
      },
      waterTemp: { value: Math.round(waterTemp), unit: "°C" },
      weather: mapWeatherCode(weatherCode),
      visibility: calcVisibility(waveH, wavePeriod, weatherCode),
      wind: {
        speed: Math.round(windSpeed),
        unit: "km/h",
        direction: degreesToCardinal(windDeg),
      },
    },
    lastUpdated: new Date().toISOString(),
  };
}

// Lee condiciones desde KV o llama a Open-Meteo si no hay cache
async function getConditionsCached(
  cache: KVNamespace | undefined,
  spotId: string,
  lat: number,
  lng: number,
  exposedTo: number
): Promise<ConditionsResult | null> {
  const cacheKey = `conditions:${spotId}`;

  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as ConditionsResult;
  }

  const result = await fetchConditions(lat, lng, exposedTo);
  if (result && cache) {
    await cache.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
  }
  return result;
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", cors());

// GET /api/spots — todos los spots (o filtrados por ?ids=las-canteras,el-cabron)
app.get("/api/spots", async (c) => {
  const idsParam = c.req.query("ids");
  const idList = idsParam ? idsParam.split(",").map(s => s.trim()).filter(Boolean) : null;

  let spots: SpotRow[];
  let facilitiesMap: Map<string, FacilityRow[]>;

  try {
    if (idList && idList.length > 0) {
      const placeholders = idList.map(() => "?").join(",");
      const [spotsResult, facilitiesResult] = await Promise.all([
        c.env.DB
          .prepare(`SELECT id, name, lat, lng, exposed_to, difficulty FROM spots WHERE id IN (${placeholders})`)
          .bind(...idList)
          .all<SpotRow>(),
        c.env.DB
          .prepare(`SELECT spot_id, type, available FROM facilities WHERE spot_id IN (${placeholders})`)
          .bind(...idList)
          .all<FacilityRow>(),
      ]);
      spots = spotsResult.results;
      facilitiesMap = groupFacilities(facilitiesResult.results);
    } else {
      const [spotsResult, facilitiesResult] = await Promise.all([
        c.env.DB
          .prepare("SELECT id, name, lat, lng, exposed_to, difficulty FROM spots")
          .all<SpotRow>(),
        c.env.DB
          .prepare("SELECT spot_id, type, available FROM facilities")
          .all<FacilityRow>(),
      ]);
      spots = spotsResult.results;
      facilitiesMap = groupFacilities(facilitiesResult.results);
    }
  } catch {
    return c.json({ error: "Database error" }, 500);
  }

  const results = await Promise.all(
    spots.map(async (spot) => {
      const cond = await getConditionsCached(
        c.env.CACHE,
        spot.id,
        spot.lat,
        spot.lng,
        spot.exposed_to
      );
      if (!cond) return null;

      return {
        id:          spot.id,
        name:        spot.name,
        lat:         spot.lat,
        lng:         spot.lng,
        score:       cond.score,
        suitability: cond.suitability,
        conditions:  cond.conditions,
        facilities:  facilitiesToFlags(facilitiesMap.get(spot.id) ?? []),
        difficulty:  spot.difficulty,
        lastUpdated: cond.lastUpdated,
      };
    })
  );

  return c.json({ spots: results.filter(Boolean) });
});

// GET /api/spot/:id — detalle completo de un spot
app.get("/api/spot/:id", async (c) => {
  const spotId = c.req.param("id");

  let spot: SpotRow | null;
  let facilityRows: FacilityRow[];

  try {
    const [spotResult, facilitiesResult] = await Promise.all([
      c.env.DB
        .prepare(
          "SELECT id, name, lat, lng, exposed_to, difficulty, description, image_url, entry_point, best_time FROM spots WHERE id = ?"
        )
        .bind(spotId)
        .first<SpotRow>(),
      c.env.DB
        .prepare("SELECT spot_id, type, available FROM facilities WHERE spot_id = ?")
        .bind(spotId)
        .all<FacilityRow>(),
    ]);
    spot = spotResult ?? null;
    facilityRows = facilitiesResult.results;
  } catch {
    return c.json({ error: "Database error" }, 500);
  }

  if (!spot) return c.json({ error: "Spot not found" }, 404);

  const cond = await getConditionsCached(
    c.env.CACHE,
    spot.id,
    spot.lat,
    spot.lng,
    spot.exposed_to
  );
  if (!cond) return c.json({ error: "Failed to fetch weather data" }, 502);

  return c.json({
    id:          spot.id,
    name:        spot.name,
    lat:         spot.lat,
    lng:         spot.lng,
    score:       cond.score,
    suitability: cond.suitability,
    conditions:  cond.conditions,
    facilities:  facilitiesToFlags(facilityRows),
    difficulty:  spot.difficulty,
    description: spot.description,
    imageUrl:    spot.image_url,
    entryPoint:  spot.entry_point,
    bestTime:    spot.best_time,
    lastUpdated: cond.lastUpdated,
  });
});

export default app;
