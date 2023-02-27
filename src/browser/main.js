function renderAppendJson({ title, payload }) {

    const chevron = $(`<span class='chevron'></span>`)

    const div = $(`<div><div class='bar'><span>${title}</span></div><pre></pre></div>`)

    const responseArea = $('#response-area')

    responseArea.append(div)

    div.find('.bar').prepend(chevron)

    let text = '(No body)'

    if (payload) {

        text = JSON.stringify(payload ?? '(No body)', null, 2)
    }

    const pre = div.find('pre')

    pre.text(text)

    if (responseArea.find('> div').length > 1) {

        pre.hide()
        chevron.addClass('chevron-up')
    }
    else {
        chevron.addClass('chevron-down')
    }

    div.find('.bar').on('click', function () {

        pre.slideToggle('fast', () => {

            $(this).find('.chevron').toggleClass('chevron-up chevron-down')
        });
    })
}

function renderClearJson({ title, payload }) {

    renderAppendJson({ title, payload })
}

function toggleProviderUIPrompt(showOrHide) {

    $('#provider-ui-prompt-area iframe').contents().find('body').html('')

    $('#provider-ui-prompt-area')[showOrHide]();
}

$.ajaxSetup({

    beforeSend: function (e, xhr) {

        const { url } = xhr

        $('#response-area').empty()

        const match = ['/refund', '/query'].filter(i => url.startsWith(i))[0]

        if(!match) {

            $('#id-area li').hide()
        }
    }
})

$(function () {

    $('.pay-options > button').on('click', function () {

        $('#response-area').empty()

        const paymentType = $(this).data('payment-type')

        const url = `/${paymentType}/charge`

        $.ajax({

            url,
            success: response => {

                $('#content').html(response)
            }
        })
    })
})