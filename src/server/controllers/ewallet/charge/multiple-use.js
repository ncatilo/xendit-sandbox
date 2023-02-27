const { getSecretKeyAsBase64 } = require('../../../helpers/util')
const route = require('express').Router()
const axios = require('axios')
const socketIoService = require('../../../helpers/socketIoService')
const { v4: uuid } = require('uuid')
const eventService = require('../../../helpers/eventService')
const { REDIRECT_HOST } = process.env

route
    .post('/', async (request, response) => {

        try {

            const envName = request.cookies['env']

            const { body } = request

            const authKey = getSecretKeyAsBase64(envName)

            // Pre-stage: Create Customer

            const createCustomerResponse = await axios({

                url: "https://api.xendit.co/customers",
                method: 'post',
                data: {

                    reference_id: `customer-${Date.now()}`,
                    type: "INDIVIDUAL",
                    individual_detail: {

                        given_names: body.given_names,
                        surname: body.surname
                    },
                    email: body.email,
                    mobile_number: body.mobile_number
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

            const { id: customerId } = createCustomerResponse.data

            // socketIoService.publish('id-captured', { name: 'customer_id', id: customerId })

            // Stage 1: Payment Method

            const paymentMethodResponse = await axios({

                url: "https://api.xendit.co/v2/payment_methods",
                method: 'post',
                data: {

                    type: "EWALLET",
                    reusability: "MULTIPLE_USE",
                    country: "PH",
                    customer_id: customerId,
                    ewallet: {
                        channel_code: body.channel_code,
                        channel_properties: {

                            success_return_url: `${REDIRECT_HOST}/capture/success`,
                            failure_return_url: `${REDIRECT_HOST}/capture/failed`,
                            cancel_return_url: `${REDIRECT_HOST}/capture/canceled`
                        }
                    },
                    metadata: {
                        foo: "bar"
                    }
                },
                headers: {

                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + authKey,
                    'Idempotency-key': uuid(),
                }
            })

            const { id: payment_method_Id, actions } = paymentMethodResponse.data

            const { url } = actions.filter(i => i.action === 'AUTH')[0] || {}

            response.send({ url })

            // Stage 2: Payment Request

            // IMPORTANT: Ideally, the Payment Method with its id for this transaction should be retained in your database instead.
            // Then when a callback is called that the payment Method is 'activated' at Xendit, 
            // the Payment Method for this transaction should be recalled from the database and commence a Payment Request then.
            // But just for this Sandbox demo, an pub-sub event handling from the callback is enough.

            eventService.subscribeOnce('ewallet-payment-method-activated', async ({ paymentMethodId }) => {

                if (paymentMethodId !== payment_method_Id) return;

                const paymentRequestResponse = await axios({

                    url: "https://api.xendit.co/payment_requests",
                    method: 'post',
                    data: {

                        amount: body.amount,
                        currency: "PHP",
                        payment_method_id: paymentMethodId,
                        description: "This is a description.",
                        channel_properties: {

                            success_return_url: "http://localhost:3000/capture/success",
                            // redeem_points: "REDEEM_ALL"
                        },
                        metadata: {

                            foo: "bar"
                        }
                    },
                    headers: {

                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + authKey,
                        'Idempotency-key': uuid(),
                    }
                })
            })
        }
        catch (err) {

            const { status, message } = err

            response.status(status || 500).send({ message })
        }
    })


module.exports = route