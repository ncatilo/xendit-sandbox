let _socket = null

module.exports = {

    init: ioServer => {

        ioServer.on('connection', socket => {

            console.log(`${socket.id} is connected`);

            _socket = socket 
        })
    },

    publish: (handle, payload) => {

        _socket.emit(handle, payload)
    },

    subscribe: (handle, func) => {

        _socket.on(handle, func)
    }
}