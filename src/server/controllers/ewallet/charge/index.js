const route = require('express').Router()

route
    .get('/', (request, response) => {

        const envName = request.cookies['env']

        response.render('ewallet', { envName })
    })

module.exports = route