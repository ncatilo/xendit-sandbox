const eventService = require('../../helpers/eventService')
const socketIoService = require('../../helpers/socketIoService')
const route = require('express').Router()
const { CALLBACK_VERIFICATION_TOKEN } = process.env


/*
ISSUE:
At the moment, callbacks for a sub-account transaction isn't working; not getting called from Xendit to caller.
Because registering the URLs for callbacks for sub-account isn't avaiable by API or dashboard at the moment.
Reported this issue with Xendit dated Jan 13, 2023.
As a temp workaround, we contact and submit the callback URLs for both TEST and Live to Xendit and they will register these at their end to our account.
*/

route
    .post([

        '/awaiting', '/pending',

        // 3rd stage: Payment Capture
        // https://docs.google.com/document/d/1FQlWRUm_QOlNosJqDj030VpgqxmZ46qKdC8oad5MDQA/edit#heading=h.a3q9r4yowwsw
        '/captured/success', '/captured/failed',

        // Last stage: Payment charge
        // https://docs.google.com/document/d/1FQlWRUm_QOlNosJqDj030VpgqxmZ46qKdC8oad5MDQA/edit#heading=h.koojdilx62ea
        '/charged/success', '/charged/failed'],

        (request, response) => {

            const { body, headers, originalUrl } = request

            const callbackToken = headers['x-callback-token']

            if (callbackToken != CALLBACK_VERIFICATION_TOKEN) {

                // handle rogue callback here

                return response.end()
            }

            // Recommended by Xendit
            const webhookId = headers['webhook-id']
            // Avoid processing duplicate webhook calls by storing all callbacks' webhook IDs from Xendit into your system
            // and verify that the webhook id of the incoming call is unique against the stored list

            socketIoService.publish('response-payload-captured', {

                title: `CALLBACK from Xendit to ${originalUrl}`, payload: body
            })

            const { event, data } = body

            if (event === 'capture.succeeded') {

                const { payment_request_id, customer_id, reusability } = data

                socketIoService.publish('payment-request-capture-succeeded', {

                    payment_request_id, customer_id, reusability
                })
            }

            response.end()
        })

    .post('/method/status', async (request, response) => {

        const { body, headers, originalUrl } = request

        const callbackToken = headers['x-callback-token']

        if (callbackToken != CALLBACK_VERIFICATION_TOKEN) {

            // handle rogue callback here

            return response.end()
        }

        // Recommended by Xendit
        const webhookId = headers['webhook-id']
        // Avoid processing duplicate webhook calls by storing all callbacks' webhook IDs from Xendit into your system
        // and verify that the webhook id of the incoming call is unique against the stored list

        const { id: payment_method_id, event, data } = request.body

        const { type, reusability, customer_id } = data

        socketIoService.publish('response-payload-captured', {

            title: `CALLBACK from Xendit to ${originalUrl}`, payload: body
        })

        if (event === 'payment_method.activated') {

            if (type === 'EWALLET') {

                eventService.publish('ewallet-payment-method-activated', { paymentMethodId: payment_method_id })
            }

            socketIoService.publish('payment-method-activated', { payment_method_id, reusability, customer_id })
        }

        response.end()
    })

module.exports = route