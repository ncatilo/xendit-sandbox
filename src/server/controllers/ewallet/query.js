const axios = require('axios')
const { getSecretKeyAsBase64 } = require('../../helpers/util')
const route = require('express').Router()

route
    .post('/', async (request, response) => {

        const envName = request.cookies['env']

        const { body } = request

        const { payment_request_id } = body

        const authKey = getSecretKeyAsBase64(envName)

        const result = await axios({

            url: `https://api.xendit.co/ewallets/charges/${payment_request_id}`,
            method: 'get',
            headers: {

                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + authKey
            }
        })

        response.send(result.data)
    })

module.exports = route