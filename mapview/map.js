var map = L.map('map').setView([38.6537,-121.3797], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

/**
 * 
 * @param {Array} arr 
 */
function reverse_array(arr) {
    for(let i = 0; i < arr.length; i++) {
        const first = arr[i][0]
        arr[i][0] = arr[i][1];
        arr[i][1] = first
    }
    return arr
}
const a = reverse_array([
                [
                    -121.3518,
                    38.6532
                ],
                [
                    -121.3573,
                    38.675
                ],
                [
                    -121.3852,
                    38.6707
                ],
                [
                    -121.3797,
                    38.6489
                ],
                [
                    -121.3518,
                    38.6532
                ]
            ]);
console.log(a);
var polygon = L.polygon(a).addTo(map)