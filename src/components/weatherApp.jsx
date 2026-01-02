import { useContext, useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContextProvider";
import {
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaCloudSun,
  FaCloudShowersHeavy,
} from "react-icons/fa";

function formatTemp(temp) {
  if (temp === undefined || temp === null) return "--";
  return Math.round(temp);
}


const weatherIcons = {
  clear: <FaSun />,
  partly_cloudy: <FaCloudSun />,
  cloudy: <FaCloud />,
  rain: <FaCloudRain />,
  snow: <FaSnowflake />,
  showers: <FaCloudShowersHeavy />,
  sunny: <FaSun />,
};

const WeatherApp = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [city, setCity] = useState("Delhi");
  const [updateCity, setUpdateCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherIconKey, setWeatherIconKey] = useState("");
  const [forecastDates, setForecastDates] = useState([]);

  function getNextSevenDaysDates(locale = "en-IN") {
    const dates = [];
    const now = new Date();
    const commonTime = now.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h12",
    });

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);

      dates.push({
        day: date.toLocaleDateString(locale, { weekday: "short" }),
        dateString: date.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
        }),
        time: commonTime,
      });
    }
    return dates;
  }

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const getweatherData = async (cityName) => {
    if (loading) return;

    setLoading(true);
    setError(null);
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=7&aqi=no&alerts=no`;
   

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error ${response.status}: ${errorText.substring(0, 50)}...`
        );
      }

      const result = await response.json();
      setWeatherData(result);
      console.log(result);
    } catch (err) {
      console.error("Weather Fetch Error:", err);
      setError(err.message || "An unknown network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!city) return;
    getweatherData(city);
  }, [city]);

  useEffect(() => {
    if (weatherData) {
      const weatherText =
        weatherData.current_observation?.condition?.text || "";
      const key = weatherText.toLowerCase().replace(/\s/g, "_");
      setWeatherIconKey(key);

      const dates = getNextSevenDaysDates();
      setForecastDates(dates);
    }
  }, [weatherData]);

  const handleInputChange = (e) => {
    setUpdateCity(e.target.value);
  };

  const handleUpdateCity = (e) => {
    e.preventDefault();
    if (updateCity.trim() !== "") {
      setCity(updateCity);
    }
    setUpdateCity("");
  };

  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
        Error: {error}
      </div>
    );
  }

 


  return (
    <main className="main min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white ">
      <nav className="w-full px-4 sm:px-10 lg:px-20 py-2">
        <div className="flex justify-between items-center ">
          <i className="bi bi-bar-chart-fill cursor-pointer text-xl sm:text-2xl"></i>

          <div className="cursor-pointer text-base sm:text-xl">
            <span className="mr-1 text-xl sm:text-2xl lg:text-3xl font-semibold">
              {weatherData?.location?.name || city}
            </span>

            <i className="bi bi-geo-alt-fill text-lg sm:text-xl"></i>
          </div>

          <button
            className="cursor-pointer text-xl sm:text-2xl"
            onClick={toggleTheme}
          >
            {theme === "light" ? <FaMoon></FaMoon> : <FaSun></FaSun>}
          </button>
        </div>
      </nav>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-center py-4">
        Weather for <span>{weatherData?.location?.name || city}</span>
      </h1>

      <div className="flex justify-center items-center py-4 px-2 sm:px-4">
        <div className="w-full max-w-sm sm:max-w-md shadow-[0_0px_6px_rgba(0,0,0,0.1),_0_0_6px_rgba(255,255,255,0.6)] rounded-lg px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <input
              type="text"
              value={updateCity}
              onChange={handleInputChange}
              placeholder="Search..."
              className="flex-grow border border-gray-300 rounded-md py-2 pl-3 text-base sm:text-lg font-semibold text-gray-900 bg-white shadow-[0_0px_4px_rgba(0,0,0,0.1),_0_0_4px_rgba(255,255,255,0.6)]"
            />
            <button
              onClick={handleUpdateCity}
              disabled={loading}
              className={`rounded-md py-2 px-4 shadow-[0_0px_6px_rgba(0,0,0,0.1),_0_0_6px_rgba(255,255,255,0.6)] font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Get"}
            </button>
          </div>

          {weatherData && (
            <>
              <h2 className="text-center mb-2 mt-4 sm:mt-6 font-semibold text-lg sm:text-xl">
                Current Weather
              </h2>

              <div className="py-2 text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-3">
                  <span className="mr-2 text-center text-3xl sm:text-4xl text-yellow-500">
                    {weatherIcons[weatherIconKey] || weatherIcons.clear}
                  </span>
                  <span>{formatTemp(weatherData?.current?.temp_c)}</span>
                  &#8451;
                </h1>

                <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-4">
                  {weatherData?.current?.condition?.text}
                </p>

                <ul className="list-none mt-4">
                  <li className="text-base sm:text-lg font-semibold mt-2">
                    Humidity
                    <span className="font-bold ml-2 text-lg sm:text-xl">
                      {weatherData?.current?.humidity}%
                    </span>
                  </li>

                  <li className="text-base sm:text-lg font-semibold mt-2">
                    Wind Speed
                    <span className="font-bold ml-2 text-lg sm:text-xl">
                      {weatherData?.current?.wind_kph} km/h
                    </span>
                  </li>

                  <li className="text-base sm:text-lg font-semibold mt-2">
                    Sunrise
                    <span className="font-bold ml-2 text-lg sm:text-xl">
                      {weatherData?.forecast?.forecastday?.[0]?.astro?.sunrise}
                    </span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="py-2 px-2 sm:px-4 lg:px-20">
        <div className="w-full">
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto  shadow-[0_2px_6px_-4px_rgba(255,255,255,0.6)] py-2">
            <h3 className="text-xl sm:text-2xl font-semibold">
            Day Forecast
            </h3>

            <h3 className="text-lg sm:text-xl font-semibold">
              <i className="bi bi-gear-fill text-lg sm:text-xl"></i>
              <span className="font-normal ms-2 text-sm sm:text-lg">
               Weather Information
              </span>
            </h3>
          </div>



  {forecastDates.length > 0 && (
  <div className="list-content w-full py-2 shadow-[0_2px_6px_-4px_rgba(0,0,0,0.1)] rounded-lg dark:shadow-none  dark:bg-gray-800">
    {forecastDates.map((dateItem, index) => {
      const forecast = weatherData?.forecast?.forecastday?.[index];

      const text = forecast?.day?.condition?.text || "Clear"; 
      const iconKey = text.toLowerCase().replace(/\s/g, "_");

      const maxTemp = forecast?.day?.maxtemp_c ?? "--"; 
      const minTemp = forecast?.day?.mintemp_c ?? "--"; 

      return (
        <div
          key={index}
          className="w-full max-w-6xl mx-auto  py-3 px-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
        >
          <div className="flex items-center justify-between w-full">
            
            <h5 className="flex-shrink-0 text-sm sm:text-base w-1/3 text-left">
              <span className="font-bold mr-1">{dateItem.day}</span>
              <span className="text-gray-600 dark:text-gray-400">{dateItem.dateString}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-500">{dateItem.time}</span>
            </h5>

            <h5 className="flex-shrink-0 text-xl sm:text-2xl text-center w-1/3">
              <span className="text-yellow-500">
                {weatherIcons[iconKey] || weatherIcons.clear}
              </span>
              <span className="block text-xs text-gray-700 dark:text-gray-300 mt-1">{text}</span>
            </h5>

            
            <h5 className="flex-shrink-0 text-base sm:text-lg font-semibold text-right w-1/3">
              <span className="text-blue-600">{formatTemp(maxTemp)}°C</span>
              <span className="text-gray-500 font-normal"> / </span>
              <span className="text-rose-600">{formatTemp(minTemp)}°C</span>
            </h5>
          </div>
        </div>
      );
    })}
  </div>
)}



         
        </div>
      </div>
    </main>
  );
};

export default WeatherApp;
