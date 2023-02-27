const { getSecretKeyAsBase64 } = require('../../helpers/util')
const route = require('express').Router()
const axios = require('axios')
const { REDIRECT_HOST } = process.env
const { v4: uuid } = require('uuid')
const socketIoService = require('../../helpers/socketIoService')

async function postPaymentRequestToXendit(authKey, { amount, payment_method_id, sub_merchant_id }) {

    const paymentRequestResponse = await axios({

        url: 'https://api.xendit.co/payment_requests',
        method: 'post',
        data: {

            amount: amount,
            currency: "PHP",
            payment_method_id,

            // Optional - user-defined info here for your records at Xendit
            description: "This is a description.",
            metadata: {
                foo: "bar"
            }
        },
        headers: {

            'Content-Type': 'application/json',
            'Authorization': `Basic ${authKey}`,
            'Idempotency-key': uuid(),
            'for-user-id': sub_merchant_id
        }
    })

    const { actions } = paymentRequestResponse.data

    // The url is the 3DS OTP screen from the issuer for the browser app to display
    const { url } = actions.filter(i => i.action === 'AUTH')[0] || {}

    return url
}

route
    .get('/', (request, response) => {

        const envName = request.cookies['env']

        response.render('card', { envName })
    })
    .post('/', async (request, response) => {

        try {

            const envName = request.cookies['env']

            const authKey = getSecretKeyAsBase64(envName)

            const { body } = request

            const channel_properties = {

                success_return_url: `${REDIRECT_HOST}/capture/success`,
                failure_return_url: `${REDIRECT_HOST}/capture/failed`
            }

            // if (body.reusability === 'MULTIPLE_USE') {

            // NOTE: Required to do this right now but inconsistent as to why; likely an issue at Xendit
            channel_properties.skip_three_d_secure = body.reusability === 'MULTIPLE_USE' ? true : undefined

            // 1st stage: Commit a Payment Method request at Xendit for the Card
            // https://docs.google.com/document/d/1FQlWRUm_QOlNosJqDj030VpgqxmZ46qKdC8oad5MDQA/edit#heading=h.ulp54n2orkv

            const paymentMethodResponse = await axios({

                url: 'https://api.xendit.co/v2/payment_methods',

                method: 'post',

                data: {

                    type: "CARD",
                    reusability: body.reusability,
                    card: {
                        currency: "PHP",
                        channel_properties,
                        card_information: {
                            card_number: body.card_number,
                            expiry_month: body.expiry_month,
                            expiry_year: body.expiry_year,
                            cvv: body.cvv,
                            cardholder_name: body.cardholder_name
                        }
                    },

                    // Optional but recommended for Card 3DS
                    billing_information: {
                        country: body.country,
                        street_line1: body.street_line1,
                        street_line2: body.street_line2,
                        city: body.city,
                        province_state: body.province_state
                    },

                    // You could provide your unique per-transaction ID for your records here.
                    // If none is specified, Xendit will auto-generate one for you.
                    reference_id: `creditcard_ref_${Date.now()}`,

                    // Optional
                    description: "This is a description.",

                    // Optional - user-defined JSON for your own records at Xendit
                    metadata: {
                        email: body.email,
                        mobile_number: body.mobile_number,
                        phone_number: body.phone_number
                    }
                },
                headers: {

                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authKey}`,

                    // This prevents duplicated requests from being processed at Xendit
                    // Must be unique like UUID at every POST/PATCH/PUT/DELETE request
                    // Idempotency keys are stored on the request layer at Xendit;
                    // expires after 24 hours from the first request
                    'Idempotency-key': uuid(),

                    // If ID is provided, this is to attach this transaction 
                    // to your sub-account registered at xenPlatform
                    'for-user-id': body.sub_merchant_id
                }
            })

            // If Card is to be saved for later use (MULTIPLE_USE)
            // Store this ID for the end-customer in your system
            const { id: payment_method_id } = paymentMethodResponse.data

            // 2nd stage: Initialize a Payment Request with the Payment Method ID at Xendit
            // https://docs.google.com/document/d/1FQlWRUm_QOlNosJqDj030VpgqxmZ46qKdC8oad5MDQA/edit#heading=h.ofcopxkhtal1

            const url = await postPaymentRequestToXendit(authKey, { ...body, payment_method_id })

            response.send({ url })
        }
        catch (err) {

            const { status, message } = err

            response.status(status || 500).send({ message })
        }
    })

    .post('/re-use-saved-payment-method', async (request, response) => {

        try {

            const envName = request.cookies['env']

            const authKey = getSecretKeyAsBase64(envName)

            const { body } = request

            const url = await postPaymentRequestToXendit(authKey, body)

            response.send({ url })

        }
        catch (err) {

            const { status, message } = err

            response.status(status || 500).send({ message })
        }
    })

module.exports = route