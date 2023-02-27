const morgan = require('morgan')

function getCssStyles(status) {

    let backgroundColour = 'green'
    
    let statusFontColour = '#000'
    
    let infoColour = '#999'
    
    let verb = 'log'
    
    if (status === 422) {
        
        backgroundColour = '#ff9b02'
        
        statusFontColour = '#000'
        
        infoColour = '#ff9b02'
        
        verb = 'warn'
    }

    else if(status === 304) {

        backgroundColour = '#555'
    }
    
    else if (status >= 400) {
        
        backgroundColour = 'red'
    
        statusFontColour = '#fff'
    
        infoColour = 'unset'
    
        verb = 'error'
    }

    const cssStatus = `background-color:${backgroundColour};color:${statusFontColour};font-weight:bold;`

    const cssInfo = `background-color:unset;color:${infoColour};`;

    return { cssStatus, cssInfo, verb }
}

module.exports = morgan((tokens, request, response) => {

    const status = parseInt(tokens.status(request, response))

    const i = [

        '%c ' + status + ' %c',

        tokens.method(request, response),

        request.get('host') + tokens.url(request, response),

        tokens.res(request, response, 'content-length'), '-',

        tokens['response-time'](request, response), 'ms'

    ].join(' ');

    const { cssStatus, cssInfo, verb } = getCssStyles(status)

    Reflect.apply(console[verb], console, [i, cssStatus, cssInfo])

    return i
})