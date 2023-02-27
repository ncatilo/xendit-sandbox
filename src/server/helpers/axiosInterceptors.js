const { default: axios } = require('axios')
const BadRequestError = require('bad-request-error')
const socketIoService = require('./socketIoService')

axios.interceptors.request.use(onFulfilled => {

    const { method, data: payload, url } = onFulfilled

    socketIoService.publish('response-payload-captured', {

        title: `Request to ${method?.toUpperCase()} ${url}`,
        payload
    })

    return onFulfilled

}, onRejected => {

    let { message, stack, response, request } = onRejected

    const { error_code, message: responseMessage } = response?.data

    message = responseMessage ?? message

    const { method, res } = request

    const { responseUrl } = res

    const title = `Error from ${method} ${responseUrl}`

    socketIoService.publish('response-payload-captured', { title, payload: { message, error_code, stack } })

    throw new BadRequestError(message)
})

axios.interceptors.response.use(onFulfilled => {

    const { data } = onFulfilled

    const { method, res } = onFulfilled.request

    const { responseUrl } = res

    const title = `Response from ${method} ${responseUrl}`

    socketIoService.publish('response-payload-captured', { title, payload: data })

    return onFulfilled

}, onRejected => {

    let { message, stack, response, request } = onRejected

    const { status } = response

    const { error_code, message: responseMessage } = response?.data

    message = responseMessage ?? message

    const { method, res } = request

    const { responseUrl } = res

    const title = `Error from ${method} ${responseUrl}`

    const payload = { title, payload: { message, error_code, stack } }

    socketIoService.publish('response-payload-captured', payload)

    throw new BadRequestError(message)
})