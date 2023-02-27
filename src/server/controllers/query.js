const axios = require('axios')
const { getSecretKeyAsBase64 } = require('../helpers/util')
const route = require('express').Router()
const { v4: uuid } = require('uuid')

route
    .post('/payment_request', async (request, response) => {

        const envName = request.cookies['env']

        const { body } = request

        const { payment_request_id } = body

        const authKey = getSecretKeyAsBase64(envName)

        const result = await axios({

            url: `https://api.xendit.co/payment_requests/${payment_request_id}`,
            method: 'get',
            headers: {

                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + authKey,
                'Idempotency-key': uuid(),
            }
        })

        response.send(result.data)
    })

    .post('/payment_method', async (request, response) => {

        const envName = request.cookies['env']

        const { body } = request

        const { payment_method_id } = body

        const authKey = getSecretKeyAsBase64(envName)

        const result = await axios({

            url: `https://api.xendit.co/payment_methods/${payment_method_id}`,
            method: 'get',
            headers: {

                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + authKey,
                'Idempotency-key': uuid(),
            }
        })

        response.send(result.data)
    })

module.exports = route