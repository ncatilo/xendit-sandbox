const route = require('express').Router()

route

    .get('/', (request, response) => {

        response.render('landing')
    })

    .get(['/live', '/test'], (request, response) => {

        const envName = request.url.split('?')[0].split('/')[1]

        response.cookie('env', envName)

        response.render('home', { envName })
    })

module.exports = route