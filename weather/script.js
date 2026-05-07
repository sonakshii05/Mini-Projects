const apiKey = "23e0b5e1df31705caafab43fb2ba50dd";

const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", getWeather);

async function getWeather() {

  const city = document
    .getElementById("cityInput")
    .value
    .trim();

  if (city === "") {
    alert("Please enter a city name");
    return;
  }

  const apiUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {

    const response = await fetch(apiUrl);

    const data = await response.json();

    console.log(data);

    if (data.cod != 200) {

      document.getElementById("error").style.display = "block";

      document.getElementById("error").innerHTML =
        data.message;

      document.getElementById("weatherCard").style.display = "none";

      return;
    }

    document.getElementById("error").style.display = "none";

    document.getElementById("weatherCard").style.display = "block";

    document.getElementById("temperature").innerHTML =
      Math.round(data.main.temp) + "°C";

    document.getElementById("cityName").innerHTML =
      data.name;

    document.getElementById("condition").innerHTML =
      data.weather[0].description;

    document.getElementById("humidity").innerHTML =
      data.main.humidity + "%";

    document.getElementById("wind").innerHTML =
      data.wind.speed + " km/h";

    const iconCode = data.weather[0].icon;

    document.getElementById("weatherIcon").src =
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  }

  catch (error) {

    console.log("Error:", error);

    document.getElementById("error").style.display = "block";

    document.getElementById("error").innerHTML =
      "Something went wrong!";
  }
}