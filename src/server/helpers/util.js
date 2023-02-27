let secretKeyAsBase64 = null

module.exports = {

    getSecretKeyAsBase64: (envName) => {

        if(!secretKeyAsBase64) {

            envName = envName?.trim()?.toUpperCase()
    
            if(['LIVE', 'TEST'].indexOf(envName) === -1) {
            
                throw new Error('Env name is empty or not known')
            }
    
            const secretKey = process.env[`${envName}_ENV_SECRET_KEY`]
    
            secretKeyAsBase64 = Buffer.from(`${secretKey}:`).toString('base64')
        }

        return secretKeyAsBase64
    }
}