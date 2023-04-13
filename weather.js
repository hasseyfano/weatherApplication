$(document).ready(function () {

    // Initialization, read 
    var temp_type_value = localStorage.getItem("temp_type");
    var city1_name = localStorage.getItem("city1_name");
    var city2_name = localStorage.getItem("city2_name");

    // If city names are already stored in the general idea, 
    if (city1_name !== null) {
        $('#City1NameTextbox').val(city1_name);
    }

    if (city2_name !== null) {
        $('#City2NameTextbox').val(city2_name);
    }
    // Set Temperature type with already stored value.
    if (temp_type_value !== null) {
        if (temp_type_value == 1) {
            $('#Radio1').attr('checked', true);
        }
        else {
            $('#Radio2').attr('checked', true);
        }
    }
    // set date to current board.
    var currentdate = new Date();
    var datetime = " " + currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    $('#current_date').html(datetime);

    // When the city names and temperature type is set, call http request for current city names.
    var CityName = $("#City1NameTextbox").val();
    var Outputbox = $("#City1");
    var CelciusFlag = $('#Radio1:checked').length;
    SearchWeather(CityName, Outputbox, CelciusFlag, "city1_name");

    CityName = $("#City2NameTextbox").val();
    Outputbox = $("#City2");

    SearchWeather(CityName, Outputbox, CelciusFlag, "city2_name");

    // When city1 name is changed with keypress, it calls request
    $('#City1NameTextbox').on('input', function () {
        var CityName = $("#City1NameTextbox").val();
        var Outputbox = $("#City1");
        var CelciusFlag = $('#Radio1:checked').length;
        SearchWeather(CityName, Outputbox, CelciusFlag, "city1_name");
    });

    // When city1 name is changed with keypress, it calls request
    $('#City2NameTextbox').on('input', function () {
        var CityName = $("#City2NameTextbox").val();
        var Outputbox = $("#City2");
        var CelciusFlag = $('#Radio1:checked').length;
        SearchWeather(CityName, Outputbox, CelciusFlag, "city2_name");
    });

    // When temperature type is changed between celsius and fahrent, it calls request
    $('input[type=radio]').on('change', function () {

        var CityName = $("#City1NameTextbox").val();
        var Outputbox = $("#City1");
        // get the type of temperature type and city name
        var CelciusFlag = $('#Radio1:checked').length;
        SearchWeather(CityName, Outputbox, CelciusFlag, "city1_name");

        CityName = $("#City2NameTextbox").val();
        Outputbox = $("#City2");

        SearchWeather(CityName, Outputbox, CelciusFlag, "city2_name");

        if (CelciusFlag == 1)
            localStorage.setItem('temp_type', 1);
        else
            localStorage.setItem('temp_type', 2);

    });

    // This is the function for cityname change.
    function SearchWeather(CityName, Outputbox, CelciusFlag, storage_city_name) {

        var xhttp_city = new XMLHttpRequest();
        var xhttp_weather = new XMLHttpRequest();

        // First CallBack for City Region API
        xhttp_city.onreadystatechange = function () {
            // When http response is correct, process for its state
            if (this.readyState == 4 && this.status == 200) {
                var SearchResponse = this.responseText;

                var obj = JSON.parse(SearchResponse);
                var city_name = obj.name;
                var country_name = obj.sys.country;
                var weather_description = obj.weather[0].description;
                var temp = obj.main.temp;
                var pressure = obj.main.pressure;
                var wind_speed = obj.wind.speed;
                var longitude = obj.coord.lon;
                var latitude = obj.coord.lat;

                // if the city name is correct, then make weather forecast api with lon, lat and APIKEY.
                var apiKey = "9ea2e1ad9aad7cc8fbba68ab87ca6b78";
                SearchString = "https://api.openweathermap.org/data/2.5/onecall"
                    + "?lat=" + latitude + "&lon=" + longitude + "&exclude=daily&APPID=" + apiKey;

                xhttp_weather.open("GET", SearchString, true); // true = means Async request
                xhttp_weather.send();

                var CurrentDate = new Date(obj.dt * 1000);
                var Sunrise = new Date(obj.sys.sunrise * 1000);

                // get current city information with weather, pressure, ...
                var SearchResultsHTML = "City: " + city_name + "<br />" +
                    "Country: " + country_name + "<br />" +
                    "Weather: " + weather_description + "<br />" +
                    "Pressure: " + pressure + "<br />" +
                    "Wind Speed: " + wind_speed + "<br />" +
                    "Date: " + CurrentDate.toLocaleDateString() + "<br />" +
                    "Sunrise: " + Sunrise.toLocaleTimeString() + "<br />";
                // check the temperature type and set temperature with exact temperature type.
                if (CelciusFlag == 1)
                    SearchResultsHTML += "Temperature(℃): " + (temp - 273.15) + "<br />";
                else
                    SearchResultsHTML += "Temperature(℉): " + ((temp - 273.15) * 9 / 5 + 32) + "<br />";
                $(Outputbox).find(".city_info").html(SearchResultsHTML);
                // save the city name with localStorage.
                localStorage.setItem(storage_city_name, city_name);
            }
            else {
                // If the city name is incorrect, show wrong city name message, and clear the forecast information.
                $(Outputbox).find('.city_info').html("Wrong City Name, please type in name of a city");
                $(Outputbox).find('.weather_info').html("");
            }
        }

        // First CallBack for City Weather Forecast API
        xhttp_weather.onreadystatechange = function () {
            // 
            if (this.readyState == 4 && this.status == 200) {
                var SearchResponse = this.responseText;
                var obj = JSON.parse(SearchResponse);
                var hours_data, weather_html = "";

                // loop for forecast 3 hours.
                for (var i = 0; i < 3; i++) {
                    tmp_obj = obj.hourly[i];
                    var currentDate = new Date(tmp_obj.dt * 1000);
                    weather_html += "<h4>DateTime : " + currentDate.toLocaleString() + "</h4>";

                    // check the temperature type and set temperature with exact temperature type.
                    if (CelciusFlag == 1) {
                        weather_html += "Temperature(℃): " + (tmp_obj.temp - 273.15) + "<br />" +
                            "FeelLike Temperature(℃) : " + (tmp_obj.feels_like - 273.15) + "<br />";
                    }
                    else {
                        weather_html += "Temperature(℃): " + ((tmp_obj.temp - 273.15) * 9 / 5 + 32) + "<br />" +
                            "FeelLike Temperature(℃) : " + ((tmp_obj.feels_like - 273.15) * 9 / 5 + 32) + "<br />";
                    }
                    weather_html += "Temperature : " + tmp_obj.temp + "<br />" +
                        "FeelLike Temperature : " + tmp_obj.feels_like + "<br />" +
                        "Pressure : " + tmp_obj.pressure + "<br />" +
                        "Humidity : " + tmp_obj.humidity + "<br />" +
                        "Dew_Point : " + tmp_obj.dew_point + "<br />" +
                        "UVI : " + tmp_obj.uvi + "<br />" +
                        "Clouds : " + tmp_obj.clouds + "<br />" +
                        "Visibility : " + tmp_obj.visibility + "<br />" +
                        "Wind Speed : " + tmp_obj.wind_speed + "<br />" +
                        "Wind Deg : " + tmp_obj.wind_deg + "<br />" +
                        "wind Gust : " + tmp_obj.wind_gust + "<br />" +
                        "Weather ID : " + tmp_obj.weather[0].id + "<br />" +
                        "Weather Main : " + tmp_obj.weather[0].main + "<br />" +
                        "Weather Description : " + tmp_obj.weather[0].description + "<br />" +
                        // icon url for weather
                        "Weather Icon: <img src=' http://openweathermap.org/img/wn/" + tmp_obj.weather[0].icon + ".png'><br />";
                }

                $(Outputbox).find(".weather_info").html(weather_html);
            }
        }

        var apiKey = "9ea2e1ad9aad7cc8fbba68ab87ca6b78";
        // build the search string for the request
        SearchString = "https://api.openweathermap.org/data/2.5/weather" +
            "?q=" + CityName + "&APPID=" + apiKey;
        console.log(SearchString);
        // (4) open a connection (we use get here)
        xhttp_city.open("GET", SearchString, true); // true = means Async request
        // (5) send the request and wait for the response (triigers the callback)
        xhttp_city.send();
    }
});