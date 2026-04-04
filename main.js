import { 
    url_param,
    get_content,
    get_current_location,
    get_current_temperature,
    convert_deg_dir,
    convert_meter_to_ft_or_miles,
    to12Hour,
    c_to_f,
    Storage
 } from "./storage.js";

 import convert from "https://esm.sh/convert-units";

const current_city = {
    name: null,
    coordinate: null
};

const localst = new Storage();

/**
 * 
 * @returns {{latitude: string, longitude: string} | boolean} - if url param is okay, return the latitude and longitude, if no retuen false
 */
function urlparam_check() {
    if (url_param.get('latitude') === null || url_param.get('longitude') === null) return

    const latitude = parseFloat(url_param.get('latitude'));
    const longitude = parseFloat(url_param.get('longitude'));

    if(isNaN(latitude) || isNaN(longitude) ||
        latitude > 90 || latitude < -90 ||
        longitude > 180 || longitude < -180){
            notice('latitude or longitude is not an available value')
            return false
    } else {
        return {
            latitude: latitude.toFixed(4),
            longitude: longitude.toFixed(4)
        }
    }
}

/**
 * 
 * @param {number} latitude 
 * @param {number} longitude 
 */
async function get_point(latitude, longitude) {
    console.log('get-point', latitude, longitude)
    return await get_content(`https://api.weather.gov/points/${latitude},${longitude}`)
}



/**
 * 
 * @param {any} msg - the message that show to user
 */
function notice(msg){
    console.warn(msg)
}

/**
 * this function convert a timestamp to a date
 * @param {number} timestamp a 13 digits timestamp
 * @returns {string} the time that people can identify
 */
function timestamp_convert(timestamp) {
    timestamp = String(timestamp)
    const check = /^\d{13}$/;

    if(!check.test(timestamp)){console.error('timestamp is not 13 digits!'); return false}

    return new Date(timestamp).toDateString()
}



/**
 * 加载内容到页面，传入的值必须是从美国官方天气预报api获取的第一步信息(point/lati..., longit...)
 * @param {object} content - the information that gets from weather.gov
 */
async function load_display_content(content) {
    const display_cityname = document.getElementsByClassName('DISPLAY_current_cityname')
    const display_coordinates = document.getElementById('display_position');
    const display_temperature = document.getElementsByClassName('DISPYAY_temperature');

    const display_visibility = document.getElementsByClassName('DISPLAY_visibility');
    const display_wind_direction = document.getElementsByClassName('DISPLAY_wind_direction');
    const display_wind_speed = document.getElementsByClassName('DISPLAY_wind_speed');

    const sunlight_normal = document.getElementsByClassName('normal_sunlight');
    const sunlight_civil_twilight = document.getElementsByClassName('civil_twilight');
    const sunlight_nautical_twilight = document.getElementsByClassName('nautical_twilight');
    const sunlight_astronomical_twilight = document.getElementsByClassName('astronomical_twilight');
    const transit_ds = document.getElementById('display_transit');

    const hourly_forecast_list = document.getElementById('hourly_forecast_list');

    

    console.debug(content)
    const urls = {
        forecast: content.properties.forecast,
        forecast_hourly: content.properties.forecastHourly,
        observation_station: content.properties.observationStations
    }

    const current_properties = await get_current_temperature(urls.observation_station);
    
    console.log('current_properties: ', current_properties)
    const city_info = {
        coordinates: content.properties.relativeLocation.geometry.coordinates,

        name: content.properties.relativeLocation.properties.city,
        state: content.properties.relativeLocation.properties.state,
        display_temperature: `${c_to_f(current_properties.temperature.value)} °F`,

        visibility: convert_meter_to_ft_or_miles(current_properties.visibility.value),
        wind_direction: `${convert_deg_dir(current_properties.windDirection.value)}`,
        wind_speed: `${convert(current_properties.windSpeed.value).from('km/h').to('m/h').toFixed(2)} mph`,

        sunlight: {
            transit_time: new Date(content.properties.astronomicalData.transit),

            normal_sunrise: new Date(content.properties.astronomicalData.sunrise),
            normal_sunset: new Date(content.properties.astronomicalData.sunset),

            civil_twilight_begin: new Date(content.properties.astronomicalData.civilTwilightBegin),
            civil_twilight_end: new Date(content.properties.astronomicalData.civilTwilightEnd),

            nautical_twilight_begin: new Date(content.properties.astronomicalData.nauticalTwilightBegin),
            nautical_twilight_end: new Date(content.properties.astronomicalData.nauticalTwilightEnd),

            astronomical_twilight_begin: new Date(content.properties.astronomicalData.astronomicalTwilightBegin),
            astronomical_twilight_end: new Date(content.properties.astronomicalData.astronomicalTwilightEnd),
        }
    }
    const sl = city_info.sunlight;
    console.log(city_info)

    current_city.name = city_info.name;
    current_city.coordinate = city_info.coordinates

    let forcasts = await get_content(urls.forecast_hourly);
    forcasts = (forcasts.properties.periods).slice(0, 49)

    put_content_to_page(display_cityname, `${city_info.name}, ${city_info.state}`)
    display_coordinates.textContent = `(${city_info.coordinates[1]}, ${city_info.coordinates[0]})`
    put_content_to_page(display_temperature, city_info.display_temperature)

    put_content_to_page(display_visibility, city_info.visibility);
    put_content_to_page(display_wind_direction, city_info.wind_direction);
    put_content_to_page(display_wind_speed, city_info.wind_speed);

    put_content_to_page(sunlight_normal, `
        <p>sunrise: ${sl.normal_sunrise.toLocaleTimeString()}</p>
        <p>sunset: ${sl.normal_sunset.toLocaleTimeString()}</p>`, true);
    put_content_to_page(sunlight_civil_twilight, `
            <p>Twilight Begin: ${sl.civil_twilight_begin.toLocaleTimeString()}</p>
            <p>Twilight End: ${sl.civil_twilight_end.toLocaleTimeString()}</p>
        `, true);
    put_content_to_page(sunlight_nautical_twilight, `
        <p>Twilight Begin: ${sl.nautical_twilight_begin.toLocaleTimeString()}</p>
        <p>Twilight End: ${sl.nautical_twilight_end.toLocaleTimeString()}</p>
        `, true);
    put_content_to_page(sunlight_astronomical_twilight, `
        <p>Twilight Begin: ${sl.astronomical_twilight_begin.toLocaleTimeString()}</p>
        <p>Twilight End: ${sl.astronomical_twilight_end.toLocaleTimeString()}</p>
        `, true)
    transit_ds.textContent = sl.transit_time.toLocaleTimeString();

    let hrly_fo_content = '';
    for(let i = 0; i < forcasts.length; i++) {
        let f = forcasts[i];
        let time = new Date(f.startTime);

        hrly_fo_content += `
            <div class="hourly_forecast_item">
                    <img src="${f.icon}" alt="forecast_icon">
                    <div class="hourly_forecast_item_detail">
                        <span>${to12Hour(time.getHours())}</span>
                        <br>
                        <span><strong>${f.temperature} °F</strong></span>
                    </div>
                </div>
        `
    }
    hourly_forecast_list.innerHTML = hrly_fo_content;

    load_saved_city_list();
}

function load_saved_city_list() {
    const saved_city_el = document.getElementById('location_list');
    const saved_city = localst.get_local_setting();

    let svct = '';
    console.log(saved_city.cities)
    for(let a = 0; a < saved_city.cities.length; a++) {
        const b = saved_city.cities[a];
        svct += `
            <li class="location_list_item">
                            <a href="index.html?latitude=${b.coordinate[1]}&longitude=${b.coordinate[0]}">${b.name}</a>
                            <button class="delete_saved_city_btn" onclick="delete_city_from_list(${a})">delete</button>
                        </li>
        `
    }
    saved_city_el.innerHTML = svct;
}
function delete_city_from_list(idx) {
    localst.delete_city(idx);
    load_saved_city_list();
}

function add_current_city_to_saved_city(){
    localst.add_city({
        name: current_city.name,
        coordinate: [current_city.coordinate[0], current_city.coordinate[1]]
    });
    load_saved_city_list();
}
window.add_current_city_to_saved_city = add_current_city_to_saved_city;
window.load_saved_city_list = load_saved_city_list;
window.delete_city_from_list = delete_city_from_list;

/**
 * 
 * @param {HTMLElement} el 
 * @param {any} content 
 * @param {boolean} isHTML
 */
function put_content_to_page(el, content, isHTML = false) {
    Array.from(el).forEach((el) => {
        if (isHTML) {
            el.innerHTML = content;
        } else {
            el.textContent = content;
        }
    })
}

async function init() {
    const is_urlparam_okay = urlparam_check();
    if (is_urlparam_okay) {
        console.log('available url param detected')
        try {
            const resu = await get_point(is_urlparam_okay.latitude, is_urlparam_okay.longitude);
            load_display_content(resu)
        } catch(error) {
            console.log(error)
        }
        return
    }

    let is_current_location_able = false;
    let location = ''
    try{
        location = await get_current_location();
        is_current_location_able = true
    } catch(error) {
        console.error(error);
        notice('we cant get your location')
    }
    if(is_current_location_able) {
        const location_latitude = location.coords.latitude.toFixed(4);
        const location_longitude = location.coords.longitude.toFixed(4);
        console.log('ready for get the weather of your location: ', location);
    
        try {
            const result = await get_point(location_latitude, location_longitude);
            console.log(result)
            load_display_content(result)
        } catch(error) {
            console.error(error);
            
        }
        
    }
}
window.init = init;
window.localst = localst;
window.current_city = current_city;
// console.log(convert(16090).from('m').to('mi'))