import { 
    url_param,
    get_content,
    get_current_location,
    get_current_temperature
 } from "./storage.js";

const LOCAL_STORAGE_KEY = 'weather_locations'; // do not fucking change this, if it changes, nobody can get the informations

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
 * 
 * @returns {object}
 */
function get_local_setting() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data != null) {
        return JSON.parse(data)
    } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, '{}');
        return {}
    }
    
}
function clear_saved_locations(){
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

const c_to_f = (c) => {return (c*9/5+32).toFixed(0)}

/**
 * 
 * @param {object} content - the information that gets from weather.gov
 */
async function load_display_content(content) {
    const display_cityname = document.getElementById('display_cityname');
    const display_coordinates = document.getElementById('display_position');
    const display_temperature = document.getElementById('display_temperature');

    const urls = {
        forecast: content.properties.forecast,
        forecast_hourly: content.properties.forecastHourly,
        observation_station: content.properties.observationStations
    }

    const temperature = await get_current_temperature(urls.observation_station);
    
    const city_info = {
        coordinates: content.properties.relativeLocation.geometry.coordinates,
        name: content.properties.relativeLocation.properties.city,
        state: content.properties.relativeLocation.properties.state,
        display_temperature: c_to_f(temperature.temperature.value),
    }

    const forcasts = await get_content(urls.forecast_hourly);
    console.log(forcasts.properties.periods)

    display_cityname.textContent = `${city_info.name}, ${city_info.state}`;
    display_coordinates.textContent = `(${city_info.coordinates[1]}, ${city_info.coordinates[0]})`
    display_temperature.textContent = city_info.display_temperature
}



async function init() {
    const is_urlparam_okay = urlparam_check();
    if (is_urlparam_okay) {
        try {
            await get_point(is_urlparam_okay.latitude, is_urlparam_okay.longitude);
            // next is display content
        } catch(error) {
            console.log(error)
        }
        return
    }

    let is_current_location_able = false;
    let location = ''
    try{
        console.time('get_location');
        location = await get_current_location();
        console.timeEnd('get_location');
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