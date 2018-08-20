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
    console.log('ERROR', code, message);
}


module.exports = {
    mapToObj,
    errorSocket
};