import { useState, useEffect, useRef } from "react";
import { 
  WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, 
  WiFog, WiThermometer, WiHumidity, WiBarometer, 
  WiStrongWind, WiSunrise, WiSunset, WiRefresh,
  WiMoonAltWaxingCrescent3, WiMoonAltFull
} from "react-icons/wi";
import { 
  FaSearch, FaMapMarkerAlt, FaWind, FaTemperatureHigh, 
  FaTint, FaCloud, FaEye, FaArrowUp, FaArrowDown,
  FaBolt, FaCalendarDay
} from "react-icons/fa";
import { 
  RiCelsiusFill, RiFahrenheitFill, 
  RiTimerFlashLine, RiMoonClearLine 
} from "react-icons/ri";
import { BsDropletHalf, BsCloudsFill } from "react-icons/bs";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric");
  const [recentSearches, setRecentSearches] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [activeTab, setActiveTab] = useState("today");
  const searchInputRef = useRef(null);

const API_KEY = process.env.REACT_APP_WEATHER_KEY;


  // Dynamic theme colors based on weather and time
  const themeColors = {
    day: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#3b82f6",
      bg: "#0f172a",
      card: "#1e293b",
      text: "#f8fafc"
    },
    night: {
      primary: "#7c3aed",
      secondary: "#5b21b6",
      accent: "#3730a3",
      bg: "#030712",
      card: "#111827",
      text: "#e2e8f0"
    }
  };

  // Weather condition to gradient mapping
  const weatherGradients = {
    Clear: timeOfDay === "day" 
      ? "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" 
      : "linear-gradient(135deg, #0c0c2e 0%, #1a1a40 100%)",
    Clouds: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
    Rain: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    Snow: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
    Thunderstorm: "linear-gradient(135deg, #23074d 0%, #cc5333 100%)",
    Mist: "linear-gradient(135deg, #3a6073 0%, #16222a 100%)",
    Fog: "linear-gradient(135deg, #3a6073 0%, #16222a 100%)",
    Haze: "linear-gradient(135deg, #3a6073 0%, #16222a 100%)"
  };

  // Get animated weather icon
  const getWeatherIcon = (condition, size = "normal") => {
    const iconSize = size === "large" ? 80 : size === "small" ? 24 : 48;
    
    const icons = {
      Clear: timeOfDay === "day" 
        ? <WiDaySunny size={iconSize} className="weather-icon sunny" />
        : <WiMoonAltFull size={iconSize} className="weather-icon moon" />,
      Clouds: <WiCloudy size={iconSize} className="weather-icon cloudy" />,
      Rain: <WiRain size={iconSize} className="weather-icon rainy" />,
      Snow: <WiSnow size={iconSize} className="weather-icon snowy" />,
      Thunderstorm: <WiThunderstorm size={iconSize} className="weather-icon thunder" />,
      Mist: <WiFog size={iconSize} className="weather-icon foggy" />,
      Fog: <WiFog size={iconSize} className="weather-icon foggy" />,
      Haze: <WiFog size={iconSize} className="weather-icon foggy" />
    };

    return icons[condition] || <WiDaySunny size={iconSize} />;
  };

  // Format time
  const formatTime = (timestamp, showSeconds = false) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined
    });
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchWeather = async (cityName) => {
    if (!cityName) return;

    setLoading(true);
    setError("");
    
    try {
      // Current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName.trim()}&appid=${API_KEY}&units=${unit}`
      );

      if (!weatherResponse.ok) {
        throw new Error("City not found. Please try again.");
      }

      const weatherData = await weatherResponse.json();
      
      // Determine time of day
      const now = Date.now() / 1000;
      const isDayTime = now > weatherData.sys.sunrise && now < weatherData.sys.sunset;
      setTimeOfDay(isDayTime ? "day" : "night");
      
      // 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName.trim()}&appid=${API_KEY}&units=${unit}`
      );
      
      const forecastData = await forecastResponse.json();
      
      // Get hourly forecast (next 12 hours)
      const next12Hours = forecastData.list.slice(0, 4);
      setHourlyForecast(next12Hours);
      
      // Get daily forecast
      const dailyForecast = [];
      for (let i = 0; i < forecastData.list.length; i += 8) {
        if (dailyForecast.length < 5) {
          dailyForecast.push(forecastData.list[i]);
        }
      }
      
      setWeather(weatherData);
      setForecast(dailyForecast);
      
      // Add to recent searches with animation
      const newSearch = {
        id: Date.now(),
        city: weatherData.name,
        country: weatherData.sys.country,
        temp: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        icon: weatherData.weather[0].main,
        timestamp: Date.now()
      };
      
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item.city !== weatherData.name);
        return [newSearch, ...filtered].slice(0, 4);
      });
      
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
      setHourlyForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeather = async (e) => {
    e?.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  const toggleUnit = () => {
    setUnit(prev => prev === "metric" ? "imperial" : "metric");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "darker" : "dark");
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
            );
            const data = await response.json();
            setCity(data.name);
            fetchWeather(data.name);
          } catch (err) {
            setError("Unable to get location weather");
          }
        },
        () => {
          setError("Please enable location services");
          setLoading(false);
        }
      );
    }
  };

  // Calculate wind direction
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Calculate feels like temperature
  const calculateFeelsLike = (temp, humidity, wind) => {
    // Simple approximation
    return unit === "metric" 
      ? Math.round(temp + (humidity / 100) * 2 - (wind / 5))
      : Math.round(temp + (humidity / 100) * 3.6 - (wind / 2.5));
  };

  // Load initial weather
  useEffect(() => {
    fetchWeather("New York");
  }, [unit]);

  // Focus search input on load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className={`app theme-${theme} time-${timeOfDay}`} 
         style={{ background: weather ? weatherGradients[weather.weather[0].main] : themeColors[timeOfDay].bg }}>
      
      {/* Animated Background Elements */}
      <div className="bg-animation">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="floating-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
           width: `${Math.random() * 3 + 1}px`,
height: `${Math.random() * 3 + 1}px`

          }} />
        ))}
      </div>

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo-container">
            <div className="logo-icon">
              <WiDaySunny className="sun" />
              <WiMoonAltWaxingCrescent3 className="moon" />
            </div>
            <h1 className="logo">
              <span className="logo-text">SkyCast</span>
              <span className="logo-tag">Pro</span>
            </h1>
          </div>
          
          <div className="header-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <RiMoonClearLine />
              <span className="toggle-slider"></span>
            </button>
            
            <button 
              className="unit-switch" 
              onClick={toggleUnit}
              aria-label="Switch units"
            >
              {unit === "metric" ? <RiCelsiusFill /> : <RiFahrenheitFill />}
              <span>{unit === "metric" ? "°C" : "°F"}</span>
            </button>
            
            <button 
              className="location-btn glow" 
              onClick={getCurrentLocation}
              aria-label="Use current location"
            >
              <FaMapMarkerAlt />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* Search Section */}
          <form onSubmit={getWeather} className="search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search city or location..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="search-input"
                  aria-label="Search location"
                />
                {city && (
                  <button 
                    type="button" 
                    className="clear-search"
                    onClick={() => setCity("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="search-btn glow"
                disabled={loading || !city.trim()}
              >
                {loading ? (
                  <WiRefresh className="loading-spinner" />
                ) : (
                  <>
                    <FaSearch />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="error-message slide-in">
              <div className="error-content">
                <FaBolt />
                <span>{error}</span>
                <button onClick={() => setError("")} aria-label="Dismiss error">×</button>
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="recent-section fade-in">
              <h3 className="section-title">
                <FaCalendarDay />
                Recent Searches
              </h3>
              <div className="recent-grid">
                {recentSearches.map((search) => (
                  <button
                    key={search.id}
                    className="recent-card"
                    onClick={() => {
                      setCity(search.city);
                      fetchWeather(search.city);
                    }}
                    aria-label={`Search ${search.city} weather`}
                  >
                    <div className="recent-info">
                      <div className="recent-city">
                        {search.city}, {search.country}
                      </div>
                      <div className="recent-temp">
                        {search.temp}°{unit === "metric" ? "C" : "F"}
                      </div>
                    </div>
                    <div className="recent-icon">
                      {getWeatherIcon(search.icon, "small")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Weather Display */}
          {weather && !loading && (
            <div className="weather-display">
              {/* Current Weather Overview */}
              <div className="current-weather-card slide-up">
                <div className="current-header">
                  <div>
                    <h2 className="location-name">
                      {weather.name}, {weather.sys.country}
                    </h2>
                    <p className="current-date-time">
                      {formatDate(weather.dt)} • {formatTime(weather.dt)}
                    </p>
                  </div>
                  <div className="weather-condition">
                    {getWeatherIcon(weather.weather[0].main, "large")}
                    <span className="condition-text">{weather.weather[0].description}</span>
                  </div>
                </div>

                <div className="current-temp-section">
                  <div className="main-temp">
                    <span className="temp-value">{Math.round(weather.main.temp)}</span>
                    <span className="temp-unit">°{unit === "metric" ? "C" : "F"}</span>
                  </div>
                  <div className="temp-feels">
                    <FaTemperatureHigh />
                    <span>Feels like {calculateFeelsLike(weather.main.temp, weather.main.humidity, weather.wind.speed)}°</span>
                  </div>
                  <div className="temp-range">
                    <span className="temp-min">
                      <FaArrowDown /> {Math.round(weather.main.temp_min)}°
                    </span>
                    <span className="temp-separator">|</span>
                    <span className="temp-max">
                      <FaArrowUp /> {Math.round(weather.main.temp_max)}°
                    </span>
                  </div>
                </div>

                {/* Weather Stats Grid */}
                <div className="weather-stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaWind />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}</div>
                      <div className="stat-label">
                        Wind • {getWindDirection(weather.wind.deg)}
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaTint />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{weather.main.humidity}%</div>
                      <div className="stat-label">Humidity</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <WiBarometer />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{weather.main.pressure} hPa</div>
                      <div className="stat-label">Pressure</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaEye />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{(weather.visibility / 1000).toFixed(1)} km</div>
                      <div className="stat-label">Visibility</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <BsCloudsFill />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{weather.clouds.all}%</div>
                      <div className="stat-label">Cloud Cover</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <BsDropletHalf />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">
                        {weather.rain ? `${weather.rain["1h"] || 0}mm` : "0mm"}
                      </div>
                      <div className="stat-label">Precipitation</div>
                    </div>
                  </div>
                </div>

                {/* Sun Times */}
                <div className="sun-times">
                  <div className="sun-time sunrise">
                    <WiSunrise />
                    <div>
                      <div className="sun-label">Sunrise</div>
                      <div className="sun-value">{formatTime(weather.sys.sunrise)}</div>
                    </div>
                  </div>
                  <div className="sun-time sunset">
                    <WiSunset />
                    <div>
                      <div className="sun-label">Sunset</div>
                      <div className="sun-value">{formatTime(weather.sys.sunset)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forecast Tabs */}
              <div className="forecast-tabs">
                <button 
                  className={`tab-btn ${activeTab === "today" ? "active" : ""}`}
                  onClick={() => setActiveTab("today")}
                >
                  Today
                </button>
                <button 
                  className={`tab-btn ${activeTab === "hourly" ? "active" : ""}`}
                  onClick={() => setActiveTab("hourly")}
                >
                  Hourly
                </button>
                <button 
                  className={`tab-btn ${activeTab === "weekly" ? "active" : ""}`}
                  onClick={() => setActiveTab("weekly")}
                >
                  5-Day
                </button>
              </div>

              {/* Hourly Forecast */}
              {activeTab === "hourly" && hourlyForecast.length > 0 && (
                <div className="hourly-forecast slide-up">
                  <div className="hourly-scroll">
                    {hourlyForecast.map((hour, index) => (
                      <div key={index} className="hour-card">
                        <div className="hour-time">
                          {index === 0 ? "Now" : formatTime(hour.dt)}
                        </div>
                        <div className="hour-icon">
                          {getWeatherIcon(hour.weather[0].main, "small")}
                        </div>
                        <div className="hour-temp">
                          {Math.round(hour.main.temp)}°
                        </div>
                        <div className="hour-precip">
                          {hour.pop > 0 ? `${Math.round(hour.pop * 100)}%` : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Forecast */}
              {activeTab === "weekly" && forecast.length > 0 && (
                <div className="weekly-forecast slide-up">
                  {forecast.map((day, index) => (
                    <div key={index} className="day-card">
                      <div className="day-name">
                        {index === 0 ? "Today" : formatDate(day.dt).split(",")[0]}
                      </div>
                      <div className="day-icon">
                        {getWeatherIcon(day.weather[0].main, "small")}
                      </div>
                      <div className="day-temps">
                        <span className="day-high">
                          {Math.round(day.main.temp_max)}°
                        </span>
                        <div className="temp-bar">
                          <div 
                            className="temp-fill"
                            style={{
                              width: `${((day.main.temp_max - day.main.temp_min) / 20) * 100}%`
                            }}
                          />
                        </div>
                        <span className="day-low">
                          {Math.round(day.main.temp_min)}°
                        </span>
                      </div>
                      <div className="day-condition">
                        {day.weather[0].main}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Today's Highlights */}
              {activeTab === "today" && (
                <div className="highlights slide-up">
                  <h3 className="section-title">Today's Highlights</h3>
                  <div className="highlight-grid">
                    <div className="highlight-card">
                      <h4>UV Index</h4>
                      <div className="uv-index">
                        <div className="uv-value">5.2</div>
                        <div className="uv-bar">
                          <div className="uv-fill" style={{ width: "52%" }} />
                        </div>
                        <div className="uv-label">Moderate</div>
                      </div>
                    </div>
                    
                    <div className="highlight-card">
                      <h4>Sunrise & Sunset</h4>
                      <div className="sun-progress">
                        <div className="sun-timeline">
                          <div className="sun-marker" style={{ left: "30%" }}>
                            <WiSunrise />
                            <span>{formatTime(weather.sys.sunrise)}</span>
                          </div>
                          <div className="sun-marker" style={{ left: "70%" }}>
                            <WiSunset />
                            <span>{formatTime(weather.sys.sunset)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="highlight-card">
                      <h4>Wind Status</h4>
                      <div className="wind-display">
                        <div className="wind-speed">
                          {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}
                        </div>
                        <div className="wind-direction">
                          <div 
                            className="wind-arrow"
                            style={{ transform: `rotate(${weather.wind.deg}deg)` }}
                          >
                            ↑
                          </div>
                          <span>{getWindDirection(weather.wind.deg)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="highlight-card">
                      <h4>Air Quality</h4>
                      <div className="air-quality">
                        <div className="aqi-value">Good</div>
                        <div className="aqi-desc">Air quality is satisfactory</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="pulse-loader"></div>
                <p>Fetching weather data...</p>
                <p className="loading-sub">Loading detailed forecast</p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-text">
              Powered by <span className="highlight">OpenWeatherMap</span> • 
              Data updates every 10 minutes
            </p>
            <p className="footer-note">
              Made with <span className="heart">❤️</span> for weather enthusiasts
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;