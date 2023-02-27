const { default: axios } = require('axios')
const { getSecretKeyAsBase64 } = require('../helpers/util')
const { v4: uuid } = require('uuid')
const route = require('express').Router()

route
    .post('/', async (request, response) => {

        const envName = request.cookies['env']

        const { body } = request

        const authKey = getSecretKeyAsBase64(envName)

        const result = await axios({

            url: `https://api.xendit.co/refunds`,
            method: 'post',
            data: body,
            headers: {

                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + authKey,
                'Idempotency-key': uuid(),
            }
        })

        response.send(result.data)
    })

module.exports = route