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