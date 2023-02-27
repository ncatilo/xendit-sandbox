const { default: axios } = require('axios')
const { getSecretKeyAsBase64 } = require('../helpers/util')
const route = require('express').Router()
const { v4: uuid } = require('uuid')

route
    .post('/', async (request, response) => {

        try {
            const envName = request.cookies['env']

            const { body } = request

            const authKey = getSecretKeyAsBase64(envName)

            const result = await axios({

                url: 'https://api.xendit.co/payment_requests',
                method: 'post',
                data: {
                    amount: body.amount,
                    currency: "PHP",
                    payment_method_id: body.payment_method_id,
                    description: "This is a description.",
                    metadata: {
                        foo: "bar"
                    }
                },
                headers: {

                    'Authorization': `Basic ${authKey}`,
                    'Content-type': 'application/json',

                    // This prevents duplicated requests from being processed at Xendit
                    // Must be unique like UUID at every POST/PATCH/PUT/DELETE request
                    // Idempotency keys are stored on the request layer at Xendit;
                    // expires after 24 hours from the first request
                    'Idempotency-key': uuid()
                }
            })

            response.send(result.data)
        }
        catch (err) {

            const { status, message } = err

            response.status(status || 500).send({ message })
        }
    })

module.exports = route