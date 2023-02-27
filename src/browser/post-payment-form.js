$(function() {

    const buttons = $('button[data-path]')

    buttons.on('click', function () {

        const btn = $(this)

        const form = btn.closest('form')

        const data = form.serialize()

        const path = btn.data('path')

        $.ajax({
            url: `/${path}`,
            method: 'post',
            data,
            success: function () {

                // done
            },
            error: err => {

                renderAppendJson({ title: 'Error response', payload: err })
            }
        })
    })
})