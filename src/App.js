import { useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = "1f4490d948a844b04c172da9e334d8a4";

  const getWeather = async (e) => {
    e.preventDefault();

    if (!city) return;

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()},IN&appid=${API_KEY}&units=metric`

      );

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🌦 Weather App</h1>

      <form onSubmit={getWeather} style={styles.form}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />
        <button style={styles.button}>Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div style={styles.card}>
          <h2>{weather.name}</h2>
          <p>🌡 Temperature: {weather.main.temp} °C</p>
          <p>☁ Weather: {weather.weather[0].main}</p>
          <p>💨 Wind: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    fontFamily: "Arial",
  },
  form: {
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    marginRight: "10px",
  },
  button: {
    padding: "10px 15px",
    fontSize: "16px",
    cursor: "pointer",
  },
  card: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ccc",
    display: "inline-block",
    borderRadius: "8px",
  },
};

export default App;
