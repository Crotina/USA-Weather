export const url_param = new URLSearchParams(window.location.search);

export class Notice{
    /**
     * 
     * @param {HTMLElement} element 
     */
    constructor (element) {
        this.element = element,
        this.display_value = 'flex'
    }
    _open(c){
        this.element.textContent = c;
        this.element.classList.add('show')
    }
    _close() {
        this.element.classList.remove('show')
    }
    show(content, time_ms) {
        this._open(content)

        setTimeout(() => {
            this._close()
        }, time_ms);
    }
}
/**
 * 
 * @returns location that include x and y axis
 */
export async function get_current_location() {
    return new Promise((resolve, reject) => {
        if(!navigator.geolocation) {
            reject('failed to get location: geolocation not support');
            return
        }
        navigator.geolocation.getCurrentPosition((ok) => resolve(ok), (not_ok)=>reject(not_ok), {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 600000
        })
    })

}

/**
 * 
 * @param {string} url - url
 * @returns {object | null}
 */
export async function get_content(url) {
    try {
        const response = await fetch(url);

        if(!response.ok) {
            throw new Error(`response status: ${response.status}`)
        }

        const result = await response.json();
        // console.log(result)
        return result
    } catch(error) {
        console.error(error);
        return null
    }
}

/**
 * 
 * @param {string} observation_stations_url - url of observation station
 * @returns {object | null}
 */
export async function get_current_temperature(observation_stations_url = null) {
    if(observation_stations_url === null) return null

    const observation_list = await get_content(observation_stations_url)
    if (observation_list === null) {console.error('js err');return null}
    console.log(observation_list.observationStations[0])

    const current_temp_url = await get_content(`${observation_list.observationStations[0]}/observations/latest`);
    console.log(current_temp_url.properties)
    return current_temp_url.properties
   
}

/**
 * 
 * @param {number} deg - degree
 * @returns {string} - direction
 */
export function convert_deg_dir(deg) {
  if (deg == null || isNaN(deg)) return "";

  deg = (deg % 360 + 360) % 360;

  const directions = [
    "N",// 0°
    "NNE",// 22.5°
    "NE",// 45°
    "ENE",// 67.5°
    "E",// 90°
    "ESE",// 112.5°
    "SE",// 135°
    "SSE",// 157.5°
    "S",// 180°
    "SSW",// 202.5°
    "SW",// 225°
    "WSW",// 247.5°
    "W",// 270°
    "WNW",// 292.5°
    "NW",// 315°
    "NNW"// 337.5°
  ];

  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/**
 * 
 * @param {number} meter - meter
 * @returns {string} a length with unit
 */
export function convert_meter_to_ft_or_miles(meters){
    if (meters == null || isNaN(meters)) return null;
    
    if((meters * 3.28084) > 1319) {
        let a = ((meters * 3.28084) / 5280).toFixed(2);
        if (a >= 10.00){
             return 'Unlimited'
        }
        return `${a} miles`
    } else {
        return `${(meters * 3.28084).toFixed(2)} ft`
    }
}

/**
 * 
 * @param {number} hr_24 - a time in 24 hr
 */
export function to12Hour(hour24) {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12} ${period}`;
}

export class Storage{
    constructor(){
        this.LOCAL_STORAGE_KEY = 'SAVEDCITY'
    }

    _cover_storage(obj) {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(obj));
    }

    _reset_storage(){
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify({
                    cities: []
                }))
    }

    get_local_setting() {
        const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (data != null) {
            let jsondata = JSON.parse(data);
            return jsondata
        } else {
            this._reset_storage();
            return this.get_local_setting();
        }
    }

    clear_saved_locations(){
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }
    
    /**
     * 
     * @param {{name: string, coordinate: [latitude: number, longitude: number]}} cityobj 
     * @returns 
     */
    add_city(cityobj) {
        if(typeof(cityobj.name) != 'string' || !Array.isArray(cityobj.coordinate)){
            console.error(cityobj, 'error value', )
            return
        }
        if (!cityobj.coordinate[0] || !cityobj.coordinate[1]){
            console.error(cityobj, 'error in coordinate');
            return
        }

        const data = this.get_local_setting();
        data.cities.push(cityobj);
        this._cover_storage(data);
    }
    delete_city(idx) {
        idx = parseInt(idx);
        if(isNaN(idx)) {return}
        const data = this.get_local_setting();
        if(data.cities.length == 0) return
        data.cities.splice(idx, 1);
        console.log(data)
        this._cover_storage(data)
    }
}
export const c_to_f = (c) => {return (c*9/5+32).toFixed(0)}