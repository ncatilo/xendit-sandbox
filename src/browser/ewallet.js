$(function() {

    const paymentForm = $('form#payment-form')

    paymentForm.find('#type').on('change', function() {

        $('#customer-info, #customer-id-field').toggle()

        const selectChannelCode = paymentForm.find('select[name="channel_code"]')
        
        const isMultipleUse = $(this).val() === 'multiple-use'

        // NOTE: GCash is currently not available for for multiple-use
        if(isMultipleUse) {

            selectChannelCode.find('option[value="GCASH"]').remove()
        }
        else {

            selectChannelCode.prepend('<option value="GCASH">GCash</option>')
            selectChannelCode.val('GCASH')
        }
    })

    paymentForm.on('submit', e => {

        e.preventDefault()

        const data = paymentForm.find(':input:visible').serialize()

        const type = paymentForm.find('#type').val()

        $.ajax({

            url: `/ewallet/charge/${type}`,
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
})