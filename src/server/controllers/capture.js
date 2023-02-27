const route = require('express').Router()

route

    .get('/success', (request, response) => {

        response.render('capture/success')
    })

    .get('/failed', (request, response) => {

        response.render('capture/failed')
    })

    .get('/canceled', (request, response) => {

        response.render('capture/canceled')
    })

module.exports = route