const EventEmitter = require('events')
const eventEmitter = new EventEmitter()

module.exports = {

    publish: (handle, payload) => {

        eventEmitter.emit(handle, payload)
    },

    subscribe: (handle, func) => {

        eventEmitter.on(handle, func)
    },

    subscribeOnce: (handle, func) => {

        eventEmitter.once(handle, func)
    }
}