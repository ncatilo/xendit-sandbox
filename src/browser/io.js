window.socketIO = (function () {

    const api = 'http://localhost:3000';
    const socket = io(api);

    function parseId(name, id) {

        const input = $(`input[name="${name}"]`)

        if(input.val()) return

        if (!id) return input?.closest('li').hide()

        input.val(id)

        input.closest('li').show()
    }

    [{

        "connect": () => {

            console.log('connected with socket id ' + socket.id)
        }
    }, {

        "response-payload-captured": (data) => {

            renderAppendJson(data)

            const { payment_request_id, reference_id } = data?.payload?.data || {}

            parseId('payment_request_id', payment_request_id)
            
            parseId('reference_id', reference_id)
        }

    }, {

        "payment-request-capture-succeeded": ({ reusability, payment_request_id, customer_id }) => {

            parseId('payment_request_id', payment_request_id)

            parseId('customer_id', customer_id)
        }

    }, {

        'payment-method-activated': ({ payment_method_id, reusability, customer_id }) => {

            parseId('payment_method_id', payment_method_id)

            parseId('customer_id', customer_id)

            $('#multi-use-form #amount').toggle(reusability === 'MULTIPLE_USE')
        }

    }].forEach(function (item) {

        const [key, func] = Object.entries(item)[0]

        socket.on(key, func);
    });


    return {

        send: function (label, data) {

            socket.emit(label, data);
        }
    }
})()