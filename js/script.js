const form = document.querySelector("#searchForm");
const input = document.querySelector("#cityInput");
const statusEl = document.querySelector("#status");
const weatherEl = document.querySelector("#weather");

const fields = {
  location: document.querySelector("#locationName"),
  updated: document.querySelector("#updated"),
  temperature: document.querySelector("#temperature"),
  condition: document.querySelector("#condition"),
  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind"),
  feels: document.querySelector("#feels")
};

const weatherCodes = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
  55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 80: "Rain showers",
  81: "Moderate rain showers", 82: "Violent rain showers", 95: "Thunderstorm",
  96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail"
};

function setStatus(message, error = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", error);
}

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Location service is unavailable.");
  const data = await response.json();
  if (!data.results?.length) throw new Error("City not found. Try another city name.");
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude, longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "auto"
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Weather service is unavailable.");
  return response.json();
}

async function loadWeather(city) {
  setStatus("Fetching live weather...");
  weatherEl.classList.add("hidden");

  try {
    const place = await getCoordinates(city);
    const data = await getWeather(place.latitude, place.longitude);
    const current = data.current;

    fields.location.textContent = `${place.name}, ${place.country}`;
    fields.updated.textContent = `Updated: ${new Date(current.time).toLocaleString([], {dateStyle: "medium", timeStyle: "short"})}`;
    fields.temperature.textContent = Math.round(current.temperature_2m);
    fields.condition.textContent = weatherCodes[current.weather_code] ?? "Unknown conditions";
    fields.humidity.textContent = `${current.relative_humidity_2m}%`;
    fields.wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    fields.feels.textContent = `${Math.round(current.apparent_temperature)}°C`;

    weatherEl.classList.remove("hidden");
    setStatus(`Showing weather for ${place.name}.`);
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = input.value.trim();
  if (city) loadWeather(city);
});

loadWeather("Jamshedpur");
