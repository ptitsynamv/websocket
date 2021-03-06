function mapToObj(map, except = null) {
    const obj = {};
    for (let [k, v] of map) {
        if (k !== except) {
            obj[k] = v;
        }
    }
    return obj;
}

function errorSocket(socket = '', message = '', code = 500) {
    let nameOfError = 'serverError';

    socket.emit(nameOfError, {
        code,
        message,
    });

    //TODO logger for errors
    console.log('ERROR', code, message);
}

colorsNames = [
    "#00ffff",
    "#a52a2a",
    "#008b8b",
    "#a9a9a9",
    "#006400",
    "#bdb76b",
    "#8b008b",
    "#556b2f",
    "#ff8c00",
    "#9932cc",
    "#e9967a",
    "#ff00ff",
    "#ffd700",
    "#008000",
    "#f0e68c",
    "#90ee90",
    "#ffb6c1",
    "#00ff00",
    "#ff00ff",
    "#808000",
    "#ffa500",
    "#ffc0cb",
    "#800080",
    "#ff0000",
    "#c0c0c0",
    "#ffffff",
    "#ffff00"
];

function getRandomColor() {
    return colorsNames[Math.floor(Math.random() * colorsNames.length)]
}


module.exports = {
    mapToObj,
    errorSocket,
    getRandomColor
};