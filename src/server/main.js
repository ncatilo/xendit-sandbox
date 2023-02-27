require('dotenv').config()
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const path = require('path')

const expressServer = express()
const httpServer = createServer(expressServer)
const io = new Server(httpServer)
const port = process.env.PORT || 3000
const cookieParser = require('cookie-parser')
const consoleHelper = require('./helpers/consoleHelper')
require('./helpers/socketIoService').init(io)
require('./helpers/axiosInterceptors')

const throwExceptionsAsJson = (err, request, response, next) => {

    let { status, message, stack } = err

    message = err?.response?.data ?? message

    response.status(status || 500).send({ message, stack })
}

expressServer
    .use(consoleHelper)
    .use('/public', express.static('src/browser'))
    .use(cookieParser())
    .use('/lib/jquery', express.static(path.join(__dirname, '../../node_modules/jquery/dist')))
    .use('/lib/socket.io-client', express.static(path.join(__dirname, '../../node_modules/socket.io-client/dist')))
    .use(express.urlencoded({ extended: false }))
    .use(express.json())
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')

    .use('/', require('./controllers/home'))
    .use('/capture', require('./controllers/capture'))

    .use('/card/charge', require('./controllers/card/charge'))
    .use('/card/multiple-use/activate', require('./controllers/card/multiple-use/activate'))
    .use('/card/multiple-use/deactivate', require('./controllers/card/multiple-use/deactivate'))
    .use('/card/multiple-use/expire', require('./controllers/card/multiple-use/expire'))
    
    .use('/ewallet/charge', require('./controllers/ewallet/charge/index'))
    .use('/ewallet/charge/one-time-use', require('./controllers/ewallet/charge/one-time-use'))
    .use('/ewallet/charge/multiple-use', require('./controllers/ewallet/charge/multiple-use'))
    .use('/ewallet/void', require('./controllers/ewallet/void'))
    
    .use('/refund', require('./controllers/refund'))
    .use('/query', require('./controllers/query'))
    
    .use('/api/callback/payment', require('./controllers/callback/payment'))

    .use(throwExceptionsAsJson)

httpServer
    .listen(port || 3000, () => {

        console.log(`server running at port ${port}...`)
    })
