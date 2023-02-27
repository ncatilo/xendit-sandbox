const { getSecretKeyAsBase64 } = require('../../../helpers/util')
const route = require('express').Router()
const axios = require('axios')

route
    .post('/', async (request, response) => {

        try {

            const envName = request.cookies['env']

            const { payment_method_id } = request.body

            const authKey = getSecretKeyAsBase64(envName)

            const outcome = await axios({

                url: `https://api.xendit.co/v2/payment_methods/${payment_method_id}/expire`,
                method: 'post',
                data: {
                    status: "ACTIVE"
                },
                headers: {

                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authKey}`
                }
            })

            response.end()
        }
        catch (err) {

            const { httpStatus } = err

            response.status(httpStatus || 500).end()
        }
    })

module.exports = route