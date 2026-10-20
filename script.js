
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");
const message = document.getElementById("message");
const weatherInfo = document.getElementById("weatherInfo");

const weatherDescriptions = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Depositing rime fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Moderate drizzle", "🌦️"],
    55: ["Dense drizzle", "🌧️"],
    61: ["Slight rain", "🌦️"],
    63: ["Moderate rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    71: ["Slight snowfall", "🌨️"],
    73: ["Moderate snowfall", "❄️"],
    75: ["Heavy snowfall", "❄️"],
    80: ["Rain showers", "🌦️"],
    81: ["Moderate rain showers", "🌧️"],
    82: ["Violent rain showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Thunderstorm with heavy hail", "⛈️"]
};

async function getWeather(latitude, longitude, placeName) {
    message.textContent = "Fetching weather...";
    weatherInfo.hidden = true;

    try {
        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,` +
            `apparent_temperature,weather_code,wind_speed_10m` +
            `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const data = await response.json();
        const current = data.current;

        if (!current) {
            throw new Error("Weather data is unavailable.");
        }

        const [description, icon] =
            weatherDescriptions[current.weather_code] ||
            ["Weather information unavailable", "🌍"];

        document.getElementById("cityName").textContent = placeName;
        document.getElementById("weatherIcon").textContent = icon;

        document.getElementById("temperature").textContent =
            `${Math.round(current.temperature_2m)}°C`;

        document.getElementById("description").textContent = description;

        document.getElementById("humidity").textContent =
            `${current.relative_humidity_2m}%`;

        document.getElementById("wind").textContent =
            `${current.wind_speed_10m} km/h`;

        document.getElementById("feelsLike").textContent =
            `${Math.round(current.apparent_temperature)}°C`;

        message.textContent = "";
        weatherInfo.hidden = false;

    } catch (error) {
        message.textContent =
            "Could not load weather. Please check your internet and try again.";
        weatherInfo.hidden = true;
    }
}

async function searchCity(city) {
    if (!city.trim()) {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Searching for city...";
    weatherInfo.hidden = true;

    try {
        const url =
            `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(city.trim())}` +
            `&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City search failed.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            message.textContent =
                "City not found. Please check the spelling.";
            return;
        }

        const place = data.results[0];
        const placeName = [place.name, place.admin1, place.country]
            .filter(Boolean)
            .filter((value, index, array) =>
                array.indexOf(value) === index
            )
            .join(", ");

        await getWeather(place.latitude, place.longitude, placeName);

    } catch (error) {
        message.textContent =
            "Unable to search. Please check your internet connection.";
    }
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    searchCity(cityInput.value);
});

locationBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
        message.textContent =
            "Geolocation is not supported by your browser.";
        return;
    }

    message.textContent = "Requesting your location...";
    weatherInfo.hidden = true;

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const { latitude, longitude } = position.coords;

            getWeather(
                latitude,
                longitude,
                "Your Current Location"
            );
        },
        function () {
            message.textContent =
                "Location unavailable. Allow location access or search by city.";
        },
        { timeout: 10000 }
    );
});
