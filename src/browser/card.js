$(function () {

    const paymentForm = $('form#payment-form')

    paymentForm.on('submit', function (e) {

        e.preventDefault()

        const data = paymentForm.serialize()

        $.ajax({

            url: `/card/charge`,
            type: 'POST',
            data,
            success: response => {

                const { url } = response;

                toggleProviderUIPrompt('show')

                window.open(url, 'inline-frame')
            },
            error: err => {

                renderAppendJson({ title: 'Error response', payload: err })
            }
        })
    })

    const multiUseForm = $('form#multi-use-form')

    multiUseForm.find('button').on('click', function () {

        const path = $(this).data('path')

        const data = multiUseForm.serialize()

        $.ajax({
            url: `/card/charge/${path}`,
            method: 'post',
            data,
            success: function ({ url }) {

                toggleProviderUIPrompt('show')

                window.open(url, 'inline-frame')

            },
            error: err => {

                renderAppendJson({ title: 'Error response', payload: err })
            }
        })
    })
})