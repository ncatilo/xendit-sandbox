const { getSecretKeyAsBase64 } = require('../../../helpers/util')
const route = require('express').Router()
const axios = require('axios')
const socketIoService = require('../../../helpers/socketIoService')
const { v4: uuid } = require('uuid')
const { REDIRECT_HOST } = process.env

route
    .post('/', async (request, response) => {

        try {

            const envName = request.cookies['env']

            const { body } = request

            const authKey = getSecretKeyAsBase64(envName)

            // stages 1 and 2: Payment Method and Payment Request aggregated into one endpoint at Xendit

            const paymentRequestResponse = await axios({

                url: 'https://api.xendit.co/payment_requests',
                method: 'post',
                data: {

                    amount: body.amount,
                    currency: "PHP",
                    country: "PH",
                    payment_method: {
                        type: "EWALLET",
                        reusability: "ONE_TIME_USE",
                        ewallet: {
                            channel_code: body.channel_code,
                            channel_properties: {
                                success_return_url: `${REDIRECT_HOST}/capture/success`,
                                failure_return_url: `${REDIRECT_HOST}/capture/failed`
                            }
                        }
                    },
                    reference_id: `ewallet_ref_${Date.now()}`
                },
                headers: {

                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + authKey,

                    // This prevents duplicated requests from being processed at Xendit
                    // Must be unique like UUID at every POST/PATCH/PUT/DELETE request
                    // Idempotency keys are stored on the request layer at Xendit;
                    // expires after 24 hours from the first request
                    'Idempotency-key': uuid(),
                }
            })


            const { actions } = paymentRequestResponse.data

            // The url is the provider’s UI (GCash, Maya etc) for the browser app to display
            const { url } = actions.filter(i => i.action === 'AUTH')[0] || {}

            response.send({ url })
        }
        catch (err) {

            const { status, message } = err

            response.status(status || 500).send({ message })
        }
    })

module.exports = route